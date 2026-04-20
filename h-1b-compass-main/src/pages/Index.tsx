import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, GraduationCap, MapPin, ArrowRight, Scale,
  Briefcase, BookOpen, PenLine, Upload, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { ManualInfoForm } from '@/components/ManualInfoForm';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { loadOFLCWages, loadCrosswalkPlus } from '@/lib/dataLoader';
import type { AnalysisStep, DocumentAnalysis, StrategyReport, ManualClientInfo } from '@/types/h1b';
import { emptyManualInfo } from '@/types/h1b';

const initialSteps: AnalysisStep[] = [
  { id: 'upload', label: 'Uploading documents', labelCn: '上传文件', status: 'pending' },
  { id: 'extract', label: 'AI Feature Extraction', labelCn: 'AI 特征提取', status: 'pending' },
  { id: 'match', label: 'SOC Code Matching', labelCn: '岗位代码匹配', status: 'pending' },
  { id: 'compliance', label: 'Compliance Check', labelCn: '合规性校验', status: 'pending' },
  { id: 'report', label: 'Generating Strategy Report', labelCn: '生成战略报告', status: 'pending' },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Index() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [undergradTranscriptFile, setUndergradTranscriptFile] = useState<File | null>(null);
  const [jobDescFile, setJobDescFile] = useState<File | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [isFounder, setIsFounder] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [steps, setSteps] = useState<AnalysisStep[]>(initialSteps);
  const [mode, setMode] = useState<'upload' | 'manual'>('upload');
  const [manualInfo, setManualInfo] = useState<ManualClientInfo>(emptyManualInfo);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const DEMO_DATA: ManualClientInfo = {
    degree: 'Master of Science in Computer Science',
    degreeLevel: 'master',
    graduateMajor: 'Computer Science',
    undergradMajor: 'Computer Science',
    workYears: 2,
    skills: 'Python, Machine Learning, SQL, TensorFlow, PyTorch, Data Analysis, Software Development, API Design, Cloud Computing, System Design',
    courseDomains: 'Computer Science: 67%, Data Science: 13%, Statistics: 13%, Mathematics: 7%',
    jobTitle: 'Software Engineer',
  };

  const loadDemo = useCallback(() => {
    setMode('manual');
    setManualInfo(DEMO_DATA);
    setZipCode('10001');
    setIsFounder(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') {
      loadDemo();
      // Auto-trigger analysis after state settles
      setTimeout(() => {
        document.getElementById('h1b-analyze-btn')?.click();
      }, 300);
    }
  }, [loadDemo]);

  const updateStep = (id: string, updates: Partial<AnalysisStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (mode === 'upload') {
      if (!resumeFile) errors.resume = 'Resume is required. 简历为必填项。';
      if (!transcriptFile) errors.transcript = 'Graduate transcript is required. 研究生成绩单为必填项。';
    } else {
      if (!manualInfo.degree.trim()) errors.degree = 'Degree is required.';
      if (!manualInfo.graduateMajor.trim()) errors.major = 'Graduate major is required.';
      if (!manualInfo.skills.trim()) errors.skills = 'Please list at least some key skills.';
    }

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast({
        title: 'Missing Information / 信息缺失',
        description: `Please fill in all required fields (${Object.keys(errors).length} missing).`,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleAnalyze = async () => {
    if (!validate()) return;

    setIsAnalyzing(true);
    setSteps(initialSteps.map(s => ({ ...s, status: 'pending' as const })));

    try {
      let analysis: DocumentAnalysis;

      if (mode === 'manual') {
        // Build analysis from manual input
        updateStep('upload', { status: 'completed', detail: 'Manual input mode' });
        updateStep('extract', { status: 'completed', detail: 'Using manually provided data' });

        const skillsList = manualInfo.skills.split(',').map(s => s.trim()).filter(Boolean);
        const domainFreqs = manualInfo.courseDomains
          .split(',')
          .map(entry => {
            const match = entry.trim().match(/^(.+?):\s*(\d+)%?$/);
            if (!match) return null;
            return { domain: match[1].trim(), percentage: parseInt(match[2]) };
          })
          .filter(Boolean) as { domain: string; percentage: number }[];

        const totalPct = domainFreqs.reduce((sum, d) => sum + d.percentage, 0) || 100;

        analysis = {
          resume: {
            degree: manualInfo.degree,
            major: manualInfo.graduateMajor,
            undergradMajor: manualInfo.undergradMajor || undefined,
            degreeLevel: manualInfo.degreeLevel,
            skills: skillsList,
            workYears: manualInfo.workYears,
            techStack: skillsList,
          },
          transcript: {
            courses: [],
            domainFrequencies: domainFreqs.map(d => ({
              domain: d.domain,
              count: Math.round((d.percentage / totalPct) * 30),
              percentage: (d.percentage / totalPct) * 100,
              isAlternatePath: (d.percentage / totalPct) * 100 > 15,
            })),
            totalCourses: 30,
          },
        };
      } else {
        // Upload mode
        updateStep('upload', { status: 'processing' });
        const filesToEncode: Promise<string>[] = [
          fileToBase64(resumeFile!),
          fileToBase64(transcriptFile!),
        ];
        if (undergradTranscriptFile) filesToEncode.push(fileToBase64(undergradTranscriptFile));
        if (jobDescFile) filesToEncode.push(fileToBase64(jobDescFile));

        const encoded = await Promise.all(filesToEncode);
        const resumeB64 = encoded[0];
        const transcriptB64 = encoded[1];
        const undergradB64 = undergradTranscriptFile ? encoded[2] : undefined;
        const jobDescB64 = jobDescFile ? encoded[undergradTranscriptFile ? 3 : 2] : undefined;

        updateStep('upload', { status: 'completed' });

        updateStep('extract', { status: 'processing', detail: 'Analyzing documents with AI...' });
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-documents', {
          body: {
            resumeBase64: resumeB64,
            transcriptBase64: transcriptB64,
            undergradTranscriptBase64: undergradB64,
            jobDescBase64: jobDescB64,
            resumeFileName: resumeFile!.name,
            transcriptFileName: transcriptFile!.name,
            undergradFileName: undergradTranscriptFile?.name,
            jobDescFileName: jobDescFile?.name,
            manualSupplement: manualInfo.degree ? manualInfo : undefined,
          },
        });

        if (analysisError) throw new Error(analysisError.message || 'Analysis failed');
        analysis = analysisData;
        updateStep('extract', {
          status: 'completed',
          detail: `Found ${analysis.resume.skills.length} skills, ${analysis.transcript.totalCourses} courses`,
        });
      }

      // Step 3: Load wage data
      updateStep('match', { status: 'processing', detail: 'Loading wage data & matching SOC codes...' });
      try {
        const [wages, crosswalks] = await Promise.all([loadOFLCWages(), loadCrosswalkPlus()]);
        updateStep('match', { status: 'processing', detail: `Loaded ${wages.length} wage records` });
        (window as any).__wageData = wages;
        (window as any).__crosswalks = crosswalks;
      } catch (e) {
        console.warn('Could not load wage data:', e);
      }

      updateStep('compliance', { status: 'processing' });

      const { data: reportData, error: reportError } = await supabase.functions.invoke('generate-report', {
        body: {
          analysis,
          zipCode,
          isFounder,
          degreeLevel: manualInfo.degreeLevel || analysis.resume.degreeLevel || 'master',
          jobTitle: manualInfo.jobTitle || undefined,
          undergradMajor: manualInfo.undergradMajor || analysis.resume.undergradMajor || undefined,
        },
      });

      if (reportError) throw new Error(reportError.message || 'Report generation failed');

      updateStep('match', { status: 'completed' });
      updateStep('compliance', { status: 'completed' });
      updateStep('report', { status: 'completed' });

      const report: StrategyReport = reportData;
      navigate('/report', { state: { report, analysis } });

    } catch (err) {
      console.error('Analysis error:', err);
      const currentProcessing = steps.find(s => s.status === 'processing');
      if (currentProcessing) {
        updateStep(currentProcessing.id, { status: 'error', detail: String(err) });
      }
      toast({
        title: 'Analysis failed',
        description: err instanceof Error ? err.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canSubmit = mode === 'manual'
    ? !!(manualInfo.degree && manualInfo.graduateMajor && manualInfo.skills)
    : !!(resumeFile && transcriptFile);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
                H-1B Strategic Assessment
              </h1>
              <p className="text-sm text-muted-foreground">
                2026 Weighted Lottery Strategy Engine · H-1B 加权抽签战略引擎
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => { loadDemo(); setTimeout(() => document.getElementById('h1b-analyze-btn')?.click(), 200); }}
                className="gap-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold border-0"
              >
                <Zap className="h-3.5 w-3.5" /> Try Demo
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/design')} className="gap-1.5 text-xs">
                <BookOpen className="h-3.5 w-3.5" /> Design & Logic
              </Button>
            </div>
          </div>
          {/* Demo hint bar */}
          <div className="mt-3 px-3 py-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Quick Demo:</strong> Click "Try Demo" to auto-fill sample data (CS Master's, NYC) and generate a strategy report instantly.
              &nbsp;·&nbsp; 点击「Try Demo」一键填入示例数据并生成报告。
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Input Section */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border shadow-sm">
                <CardContent className="p-6 space-y-5">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      Client Information
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload documents or enter information manually.
                      <span className="block text-xs mt-0.5">上传文件或手动填写客户信息。</span>
                    </p>
                  </div>

                  {/* Mode Tabs */}
                  <Tabs value={mode} onValueChange={v => setMode(v as 'upload' | 'manual')}>
                    <TabsList className="w-full">
                      <TabsTrigger value="upload" className="flex-1 gap-1.5">
                        <Upload className="h-3.5 w-3.5" /> Upload Documents
                      </TabsTrigger>
                      <TabsTrigger value="manual" className="flex-1 gap-1.5">
                        <PenLine className="h-3.5 w-3.5" /> Manual Input 手填
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-4 mt-4">
                      <FileUpload
                        label="Resume"
                        labelCn="简历"
                        file={resumeFile}
                        onFileChange={f => { setResumeFile(f); setValidationErrors(e => ({ ...e, resume: '' })); }}
                        icon={<FileText className="h-8 w-8 mx-auto text-muted-foreground" />}
                        required
                        hint="Must include degree, major, work history, and skills."
                        hintCn="需包含学位、专业、工作经历和技能。"
                        error={validationErrors.resume}
                      />

                      <FileUpload
                        label="Graduate Transcript"
                        labelCn="研究生成绩单"
                        file={transcriptFile}
                        onFileChange={f => { setTranscriptFile(f); setValidationErrors(e => ({ ...e, transcript: '' })); }}
                        icon={<GraduationCap className="h-8 w-8 mx-auto text-muted-foreground" />}
                        required
                        hint="Full course list with grades. Used for domain frequency analysis and alternate SOC paths."
                        hintCn="完整课程列表含成绩。用于领域频率分析和备选SOC路径。"
                        error={validationErrors.transcript}
                      />

                      <FileUpload
                        label="Undergraduate Transcript"
                        labelCn="本科成绩单"
                        file={undergradTranscriptFile}
                        onFileChange={setUndergradTranscriptFile}
                        icon={<BookOpen className="h-8 w-8 mx-auto text-muted-foreground" />}
                        hint="Optional but recommended. Undergrad major can unlock additional SOC codes (e.g. Architecture → Interior Designer)."
                        hintCn="可选但推荐。本科专业可解锁更多SOC代码（如建筑→室内设计师）。"
                      />

                      <FileUpload
                        label="Job Description / Offer Letter"
                        labelCn="岗位描述 / Offer"
                        file={jobDescFile}
                        onFileChange={setJobDescFile}
                        icon={<Briefcase className="h-8 w-8 mx-auto text-muted-foreground" />}
                        hint="Optional. Helps match exact job duties to SOC codes and wage levels."
                        hintCn="可选。帮助精确匹配岗位职责与SOC代码和工资级别。"
                      />

                      {/* Supplement form for upload mode - collapsed */}
                      <details className="group">
                        <summary className="text-xs text-accent cursor-pointer hover:underline flex items-center gap-1">
                          <PenLine className="h-3 w-3" />
                          Add manual supplement (if documents are incomplete)
                          <span className="text-muted-foreground ml-1">补充信息</span>
                        </summary>
                        <div className="mt-3">
                          <ManualInfoForm info={manualInfo} onChange={setManualInfo} mode="supplement" />
                        </div>
                      </details>
                    </TabsContent>

                    <TabsContent value="manual" className="mt-4">
                      <ManualInfoForm info={manualInfo} onChange={setManualInfo} mode="full" />
                    </TabsContent>
                  </Tabs>

                  {/* Common fields */}
                  <div className="space-y-4 pt-2 border-t border-border">
                    {/* Degree Level - CRITICAL for lottery probability */}
                    {mode === 'upload' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">
                          Highest Degree Level <span className="text-muted-foreground text-xs">(最高学历级别)</span>
                          <span className="text-destructive ml-1 text-xs font-bold">* Critical for lottery odds</span>
                        </label>
                        <Select
                          value={manualInfo.degreeLevel}
                          onValueChange={v => setManualInfo(prev => ({ ...prev, degreeLevel: v as any }))}
                        >
                          <SelectTrigger className="max-w-[320px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bachelor">Bachelor's 本科 (1 pool)</SelectItem>
                            <SelectItem value="master">Master's 硕士 (2 pools = higher odds)</SelectItem>
                            <SelectItem value="doctorate">Doctorate 博士 (2 pools = higher odds)</SelectItem>
                            <SelectItem value="professional">Professional 专业学位 (2 pools)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Master's+ from US institution enters BOTH regular (65K) &amp; advanced degree (20K) pools.
                          <span className="block">硕士及以上（美国院校）= 同时参加普通池和高学历池，中签率显著提升。</span>
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Office Zip Code <span className="text-muted-foreground text-xs">(办公地 Zip Code)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="e.g. 95134"
                          value={zipCode}
                          onChange={e => setZipCode(e.target.value)}
                          className="max-w-[200px]"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used for prevailing wage lookup. 用于查询现行工资标准。
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="founder"
                        checked={isFounder}
                        onChange={e => setIsFounder(e.target.checked)}
                        className="rounded border-input"
                      />
                      <label htmlFor="founder" className="text-sm text-foreground cursor-pointer">
                        Client is a founder / self-employed
                        <span className="block text-xs text-muted-foreground">客户为创始人/自雇身份</span>
                      </label>
                    </div>
                  </div>

                  <Button
                    id="h1b-analyze-btn"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !canSubmit}
                    className="w-full font-semibold"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      'Analyzing...'
                    ) : (
                      <>
                        Generate Strategy Report
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Progress Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border shadow-sm">
                <CardContent className="p-6">
                  <AnalysisProgress steps={steps} />

                  <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong>2026 New Rule:</strong> H-1B lottery now uses wage-level weighting.
                      Level 1 = 1x, Level 2 = 2x, Level 3 = 3x, Level 4 = 4x selection probability.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      <strong>2026 新规：</strong>H-1B 抽签现已实行工资级别加权制。
                      Level 1 = 1倍, Level 2 = 2倍, Level 3 = 3倍, Level 4 = 4倍中签概率。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
