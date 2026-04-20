import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Copy, Check, ChevronDown, Download, FileType, PackageOpen, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import type { StrategyReport, StrategyOption } from '@/types/h1b';

interface DocumentGeneratorProps {
  report: StrategyReport;
}

const DOCUMENT_TYPES = [
  { value: 'support_letter', label: 'Employer Support Letter', labelCn: '雇主支持信', icon: '📄' },
  { value: 'specialty_occupation', label: 'Specialty Occupation Letter', labelCn: '专业职业论证信', icon: '⚖️' },
  { value: 'beneficiary_statement', label: 'Beneficiary Statement', labelCn: '受益人个人陈述', icon: '👤' },
  { value: 'expert_opinion', label: 'Expert Opinion Letter', labelCn: '专家意见信', icon: '🎓' },
  { value: 'business_plan', label: 'Business Plan', labelCn: '商业计划书', icon: '📊' },
  { value: 'rfe_specialty_occupation', label: 'RFE Response: Specialty Occupation', labelCn: 'RFE回复：专业职业', icon: '🛡️' },
  { value: 'rfe_beneficiary_qualifications', label: 'RFE Response: Beneficiary Qualifications', labelCn: 'RFE回复：受益人资质', icon: '📋' },
  { value: 'rfe_employer_employee', label: 'RFE Response: Employer-Employee', labelCn: 'RFE回复：雇佣关系', icon: '🤝' },
] as const;

/** Stream-fetch a single document from the edge function, returns full text */
async function fetchDocumentContent(
  docType: string,
  clientData: any,
  strategyData: StrategyOption,
  onChunk?: (partial: string) => void,
): Promise<string> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-document`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ documentType: docType, clientData, strategyData }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Generation failed' }));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }
  if (!resp.body) throw new Error('No response body');

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') break;
      try {
        const parsed = JSON.parse(jsonStr);
        const c = parsed.choices?.[0]?.delta?.content;
        if (c) { content += c; onChunk?.(content); }
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }

  // flush remainder
  for (let raw of buffer.split('\n')) {
    if (!raw || !raw.startsWith('data: ')) continue;
    if (raw.endsWith('\r')) raw = raw.slice(0, -1);
    const jsonStr = raw.slice(6).trim();
    if (jsonStr === '[DONE]') continue;
    try {
      const parsed = JSON.parse(jsonStr);
      const c = parsed.choices?.[0]?.delta?.content;
      if (c) { content += c; onChunk?.(content); }
    } catch { /* ignore */ }
  }

  return content;
}

/** Convert markdown text to docx Blob */
async function textToDocxBlob(text: string): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
  const lines = text.split('\n');
  const paragraphs: any[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      paragraphs.push(new Paragraph({ text: trimmed.slice(2), heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }));
    } else if (trimmed.startsWith('## ')) {
      paragraphs.push(new Paragraph({ text: trimmed.slice(3), heading: HeadingLevel.HEADING_2, spacing: { after: 150 } }));
    } else if (trimmed.startsWith('### ')) {
      paragraphs.push(new Paragraph({ text: trimmed.slice(4), heading: HeadingLevel.HEADING_3, spacing: { after: 100 } }));
    } else if (trimmed === '') {
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    } else {
      const parts = trimmed.split(/(\[[^\]]+\])/g);
      const runs = parts.map(part =>
        part.startsWith('[') && part.endsWith(']')
          ? new TextRun({ text: part, bold: true, highlight: 'yellow', font: 'Calibri', size: 22 })
          : new TextRun({ text: part, font: 'Calibri', size: 22 })
      );
      paragraphs.push(new Paragraph({ children: runs, spacing: { after: 80, line: 276 } }));
    }
  }

  const doc = new Document({
    sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children: paragraphs }],
  });
  return Packer.toBlob(doc);
}

export function DocumentGenerator({ report }: DocumentGeneratorProps) {
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [selectedStrategyIdx, setSelectedStrategyIdx] = useState<string>('0');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // Batch state
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchCurrentDoc, setBatchCurrentDoc] = useState('');

  const selectedStrategy = report.strategies[parseInt(selectedStrategyIdx)] || report.strategies[0];

  const generateDocument = useCallback(async () => {
    if (!selectedDocType || !selectedStrategy) {
      toast.error('Please select a document type and strategy');
      return;
    }
    setIsGenerating(true);
    setGeneratedDoc('');
    try {
      const content = await fetchDocumentContent(
        selectedDocType, report.clientSummary, selectedStrategy,
        (partial) => setGeneratedDoc(partial),
      );
      setGeneratedDoc(content);
      toast.success('Document generated successfully');
    } catch (err: any) {
      console.error('Document generation error:', err);
      if (err.message?.includes('429')) toast.error('Rate limit exceeded, please try again later.');
      else toast.error(err.message || 'Failed to generate document');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedDocType, selectedStrategy, report.clientSummary]);

  const generateAllAndZip = useCallback(async () => {
    if (!selectedStrategy) return;
    setIsBatchGenerating(true);
    setBatchProgress(0);
    setBatchCurrentDoc('');

    try {
      const JSZip = (await import('jszip')).default;
      const { saveAs } = await import('file-saver');
      const zip = new JSZip();
      const total = DOCUMENT_TYPES.length;

      for (let i = 0; i < total; i++) {
        const dt = DOCUMENT_TYPES[i];
        setBatchCurrentDoc(`${dt.icon} ${dt.label} (${dt.labelCn})`);
        setBatchProgress(Math.round((i / total) * 100));

        try {
          const text = await fetchDocumentContent(
            dt.value, report.clientSummary, selectedStrategy,
          );
          // Add both TXT and DOCX
          const fileName = dt.label.replace(/\s+/g, '_');
          zip.file(`${fileName}_Draft.txt`, text);

          const docxBlob = await textToDocxBlob(text);
          zip.file(`${fileName}_Draft.docx`, docxBlob);
        } catch (err) {
          console.error(`Failed to generate ${dt.label}:`, err);
          zip.file(`${dt.label.replace(/\s+/g, '_')}_ERROR.txt`, `Generation failed: ${err}`);
        }
      }

      setBatchProgress(100);
      setBatchCurrentDoc('Packaging ZIP... 打包中...');

      const blob = await zip.generateAsync({ type: 'blob' });
      const strategyLabel = selectedStrategy.socMatch.socCode;
      saveAs(blob, `H1B_Documents_${strategyLabel}.zip`);
      toast.success(`All ${total} documents generated and downloaded / 全部${total}份文档已生成并下载`);
    } catch (err) {
      console.error('Batch generation error:', err);
      toast.error('Batch generation failed / 批量生成失败');
    } finally {
      setIsBatchGenerating(false);
      setBatchProgress(0);
      setBatchCurrentDoc('');
    }
  }, [selectedStrategy, report.clientSummary]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDoc);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getDocFileName = () => {
    return (DOCUMENT_TYPES.find(d => d.value === selectedDocType)?.label || 'Document').replace(/\s+/g, '_');
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDoc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${getDocFileName()}_Draft.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocx = async () => {
    try {
      const { saveAs } = await import('file-saver');
      const blob = await textToDocxBlob(generatedDoc);
      saveAs(blob, `${getDocFileName()}_Draft.docx`);
      toast.success('Word document downloaded / Word文档已下载');
    } catch (err) {
      console.error('DOCX generation error:', err);
      toast.error('Failed to generate Word document');
    }
  };

  const anyGenerating = isGenerating || isBatchGenerating;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border shadow-sm">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Document Template Generator
                <span className="text-sm font-body text-muted-foreground">文档模板生成器</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Controls */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Document Type / 文档类型
                  </label>
                  <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map(dt => (
                        <SelectItem key={dt.value} value={dt.value}>
                          <span className="flex items-center gap-2">
                            <span>{dt.icon}</span>
                            <span>{dt.label}</span>
                            <span className="text-muted-foreground text-xs">· {dt.labelCn}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Strategy / 策略
                  </label>
                  <Select value={selectedStrategyIdx} onValueChange={setSelectedStrategyIdx}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {report.strategies.map((s, i) => (
                        <SelectItem key={i} value={String(i)}>
                          <span className="flex items-center gap-2">
                            <Badge variant={s.type === 'conservative' ? 'secondary' : s.type === 'strategic' ? 'default' : 'destructive'} className="text-xs">
                              {s.type}
                            </Badge>
                            <span className="truncate">{s.socMatch.socCode} — {s.socMatch.title}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Info callout */}
              <div className="p-3 rounded-md bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  AI will generate a template pre-filled with your case data. Fields marked with [BRACKETS] require manual input from the attorney, employer, or beneficiary.
                  <br />
                  <span className="text-muted-foreground/80">
                    AI将根据案件数据生成预填充模板。[方括号]标记的字段需要律师、雇主或受益人手动填写。
                  </span>
                </p>
              </div>

              {/* Buttons row */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={generateDocument}
                  disabled={!selectedDocType || anyGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Generating... 生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Document 生成文档
                    </>
                  )}
                </Button>

                <Button
                  variant="secondary"
                  onClick={generateAllAndZip}
                  disabled={anyGenerating}
                >
                  {isBatchGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Batch Generating... 批量生成中...
                    </>
                  ) : (
                    <>
                      <PackageOpen className="h-4 w-4 mr-2" />
                      Generate All & ZIP 批量生成打包
                    </>
                  )}
                </Button>
              </div>

              {/* Batch progress */}
              <AnimatePresence>
                {isBatchGenerating && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{batchCurrentDoc}</span>
                      <span className="font-mono text-xs text-foreground">{batchProgress}%</span>
                    </div>
                    <Progress value={batchProgress} className="h-2" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generated content */}
              <AnimatePresence>
                {generatedDoc && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">
                        Generated Draft / 生成草稿
                      </h4>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                          {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                          <Download className="h-3 w-3 mr-1" />
                          TXT
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownloadDocx}>
                          <FileType className="h-3 w-3 mr-1" />
                          Word
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      value={generatedDoc}
                      onChange={e => setGeneratedDoc(e.target.value)}
                      className="min-h-[400px] font-mono text-xs leading-relaxed bg-card"
                      placeholder="Generated document will appear here..."
                    />

                    <p className="text-xs text-muted-foreground italic">
                      ⚠️ This is an AI-generated draft for attorney review only. Not legal advice.
                      此为AI生成草稿，仅供律师审阅参考，不构成法律建议。
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
}
