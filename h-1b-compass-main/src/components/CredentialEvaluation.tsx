import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ChevronDown, AlertTriangle, CheckCircle, ExternalLink, Copy, Check, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const NACES_AGENCIES = [
  { name: 'World Education Services (WES)', url: 'https://www.wes.org', turnaround: '7 business days', cost: '$205+', popular: true, note: 'Most commonly used for H-1B' },
  { name: 'Educational Credential Evaluators (ECE)', url: 'https://www.ece.org', turnaround: '10 business days', cost: '$160+', popular: true, note: 'Course-by-course available' },
  { name: 'Foundation for International Services (FIS)', url: 'https://www.fis-web.com', turnaround: '5-7 business days', cost: '$150+', popular: false, note: 'Fast turnaround option' },
  { name: 'SpanTran', url: 'https://www.spantran.com', turnaround: '8-10 business days', cost: '$175+', popular: true, note: 'Good for complex evaluations' },
  { name: 'IERF', url: 'https://www.ierf.org', turnaround: '10-15 business days', cost: '$175+', popular: false, note: 'California-based' },
  { name: 'Globe Language Services', url: 'https://www.globelanguage.com', turnaround: '5-10 business days', cost: '$180+', popular: false, note: 'Translation + evaluation' },
];

const THREE_YEAR_COUNTRIES = [
  'India', 'Bangladesh', 'Pakistan', 'Nepal', 'Nigeria', 'Ghana', 'Kenya',
  'United Kingdom', 'Australia', 'New Zealand', 'Hong Kong', 'Singapore',
];

interface CredentialEvaluationProps {
  degreeLevel?: string;
  major?: string;
}

export function CredentialEvaluation({ degreeLevel, major }: CredentialEvaluationProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [country, setCountry] = useState('');
  const [degreeYears, setDegreeYears] = useState<string>('4');
  const [copied, setCopied] = useState(false);

  const isThreeYear = parseInt(degreeYears) === 3;
  const isThreeYearCountry = THREE_YEAR_COUNTRIES.some(c => country.toLowerCase().includes(c.toLowerCase()));
  const needsEquivalency = isThreeYear || isThreeYearCountry;

  const evalRequestLetter = `
[YOUR NAME / 您的姓名]
[YOUR ADDRESS / 您的地址]
[DATE / 日期]

[EVALUATION AGENCY NAME]
[AGENCY ADDRESS]

RE: Request for Course-by-Course Credential Evaluation

Dear Credential Evaluation Team,

I am writing to request a course-by-course credential evaluation of my academic credentials for the purpose of an H-1B visa petition with U.S. Citizenship and Immigration Services (USCIS).

ACADEMIC CREDENTIALS:
- Degree: ${degreeLevel || '[DEGREE]'} in ${major || '[MAJOR]'}
- Institution: [UNIVERSITY NAME / 学校名称]
- Country of Education: ${country || '[COUNTRY / 国家]'}
- Year of Graduation: [YEAR / 毕业年份]
- Duration of Program: ${degreeYears} year(s)

REQUESTED EVALUATION:
1. Course-by-course evaluation (NOT document-by-document)
2. U.S. equivalency determination — please specify the exact U.S. degree equivalent and field of study
3. Statement of hours and credits per course
${needsEquivalency ? `4. IMPORTANT: My degree program was ${degreeYears} year(s). Please provide a detailed equivalency analysis explaining how this program compares to a U.S. 4-year bachelor's degree or higher.\n5. If applicable, include a "3+1" or progressive experience equivalency determination per USCIS standards (Matter of Shah, 17 I&N Dec. 244)` : ''}

DOCUMENTS ENCLOSED:
□ Original or certified copy of degree certificate / 学位证书原件或公证件
□ Original or certified copy of transcripts with course list / 成绩单原件或公证件
□ Certified English translations (if applicable) / 英文翻译公证件
□ Copy of passport identity page / 护照身份页复印件
□ Diploma supplement or mark sheet (if available) / 文凭补充件

DELIVERY INSTRUCTIONS:
Please send the original evaluation report to:
[ATTORNEY/PETITIONER ADDRESS]

And an electronic copy to:
[EMAIL ADDRESS]

I have enclosed payment for [RUSH/STANDARD] processing.

Thank you for your prompt attention to this matter.

Sincerely,
[YOUR NAME / 您的姓名]
[YOUR PHONE / 您的电话]
[YOUR EMAIL / 您的电子邮箱]
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(evalRequestLetter);
    setCopied(true);
    toast.success('Evaluation request letter copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border shadow-sm">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-accent" />
                Credential Evaluation Guidance
                <span className="text-sm font-body text-muted-foreground">学历认证指南</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Inputs */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm">Country of Education / 教育国家</Label>
                  <Input
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    placeholder="e.g. India, China, UK..."
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Degree Program Duration / 学制年限</Label>
                  <Select value={degreeYears} onValueChange={setDegreeYears}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Years</SelectItem>
                      <SelectItem value="3">3 Years</SelectItem>
                      <SelectItem value="4">4 Years</SelectItem>
                      <SelectItem value="5">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Alerts */}
              {needsEquivalency && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">3-Year Degree — Special Handling Required</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        A {degreeYears}-year degree from {country || 'this country'} may not automatically be recognized as equivalent to a U.S. 4-year bachelor's degree.
                        You may need a <strong>"3+1" equivalency</strong> argument combining the degree with progressive work experience (per <em>Matter of Shah</em>, 17 I&N Dec. 244).
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {degreeYears}年制学位可能不被直接认定为等同于美国四年制学士学位。可能需要"3+1"等价论证，结合学位与渐进式工作经验。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!needsEquivalency && country && (
                <div className="p-3 rounded-md bg-primary/5 border border-primary/20 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">
                    A {degreeYears}-year degree should generally be recognized as equivalent to a U.S. bachelor's degree. A standard course-by-course evaluation is recommended.
                  </p>
                </div>
              )}

              <Separator />

              {/* NACES Agencies */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                  <Globe className="h-4 w-4 text-primary" />
                  Recommended NACES/AICE Evaluation Agencies / 推荐认证机构
                </h4>

                <div className="grid sm:grid-cols-2 gap-3">
                  {NACES_AGENCIES.map((agency, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{agency.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{agency.note}</p>
                        </div>
                        {agency.popular && <Badge variant="secondary" className="text-[10px]">Popular</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>⏱ {agency.turnaround}</span>
                        <span>💰 {agency.cost}</span>
                        <a href={agency.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5">
                          Visit <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Evaluation Request Letter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">
                    Evaluation Request Letter Template / 认证申请信模板
                  </h4>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>

                <pre className="p-4 rounded-lg bg-card border border-border text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap text-foreground max-h-[400px] overflow-y-auto">
                  {evalRequestLetter}
                </pre>

                <p className="text-xs text-muted-foreground italic">
                  ⚠️ USCIS requires evaluations from NACES or AICE member agencies. Document-by-document evaluations are generally insufficient — always request course-by-course.
                  USCIS 要求使用 NACES 或 AICE 成员机构的认证。仅凭文件级别（document-by-document）的认证通常不够——务必申请课程级别（course-by-course）认证。
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
}
