import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronDown, Copy, Check, Download, FileType, MapPin, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { StrategyOption } from '@/types/h1b';

interface LCAAutoFillProps {
  strategies: StrategyOption[];
}

interface EmployerData {
  companyName: string;
  fein: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  naicsCode: string;
  contactName: string;
  contactTitle: string;
  worksiteAddress: string;
  worksiteCity: string;
  worksiteState: string;
  worksiteZip: string;
  worksiteCounty: string;
  jobTitle: string;
  numWorkers: string;
  beginDate: string;
  endDate: string;
}

const emptyEmployer: EmployerData = {
  companyName: '', fein: '', address: '', city: '', state: '', zip: '', phone: '',
  naicsCode: '', contactName: '', contactTitle: '',
  worksiteAddress: '', worksiteCity: '', worksiteState: '', worksiteZip: '', worksiteCounty: '',
  jobTitle: '', numWorkers: '1', beginDate: '', endDate: '',
};

function generatePostingNotice(employer: EmployerData, strategy: StrategyOption, wageAmount: number | null): string {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 10);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
═══════════════════════════════════════════════════════════════
                    NOTICE OF LCA FILING
          Labor Condition Application Posting Notice
              (Required per 20 CFR § 655.734)
═══════════════════════════════════════════════════════════════

POSTING DATE: ${fmt(today)}
REMOVAL DATE: ${fmt(endDate)} (must remain posted for 10 consecutive business days)

EMPLOYER: ${employer.companyName || '[COMPANY NAME]'}
FEIN: ${employer.fein || '[FEIN]'}
ADDRESS: ${employer.address || '[ADDRESS]'}, ${employer.city || '[CITY]'}, ${employer.state || '[STATE]'} ${employer.zip || '[ZIP]'}

────────────────────────────────────────────────────────────

JOB INFORMATION:

Job Title: ${employer.jobTitle || strategy.socMatch.title}
SOC Code: ${strategy.socMatch.socCode}
SOC Title: ${strategy.socMatch.title}
Number of Workers: ${employer.numWorkers || '1'}

Wage: ${wageAmount ? `$${wageAmount.toLocaleString()} per year` : '[WAGE AMOUNT]'}
Prevailing Wage: ${wageAmount ? `$${wageAmount.toLocaleString()} per year` : '[PREVAILING WAGE]'}

Period of Employment: ${employer.beginDate || '[START DATE]'} to ${employer.endDate || '[END DATE]'}

WORKSITE LOCATION:
${employer.worksiteAddress || '[WORKSITE ADDRESS]'}
${employer.worksiteCity || '[CITY]'}, ${employer.worksiteState || '[STATE]'} ${employer.worksiteZip || '[ZIP]'}
County: ${employer.worksiteCounty || '[COUNTY]'}

────────────────────────────────────────────────────────────

EMPLOYEE RIGHTS:

The employer is required to pay nonimmigrant workers the higher of:
(1) the actual wage paid to other employees in the same position, or
(2) the prevailing wage for the occupation in the area of employment.

Complaints may be filed with the U.S. Department of Labor,
Wage and Hour Division:
- Phone: 1-866-4US-WAGE (1-866-487-9243)
- Website: www.dol.gov/agencies/whd
- Form WH-4 complaint form

The LCA is available for public inspection at the employer's principal place of business or at the worksite.

═══════════════════════════════════════════════════════════════
This notice is posted pursuant to 20 CFR § 655.734(a)(1).
═══════════════════════════════════════════════════════════════
`.trim();
}

export function LCAAutoFill({ strategies }: LCAAutoFillProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedStrategyIdx, setSelectedStrategyIdx] = useState(0);
  const [employer, setEmployer] = useState<EmployerData>(emptyEmployer);
  const [copied, setCopied] = useState(false);

  const strategy = strategies[selectedStrategyIdx] || strategies[0];
  const wageLevel1 = strategy?.wageLevels.find(w => w.level === 1);
  const wageAmount = wageLevel1?.amount;

  const updateField = (field: keyof EmployerData, value: string) => {
    setEmployer(prev => ({ ...prev, [field]: value }));
  };

  const lcaFields = [
    { label: 'SOC Code', value: strategy.socMatch.socCode, auto: true },
    { label: 'SOC Title', value: strategy.socMatch.title, auto: true },
    { label: 'Job Zone', value: `Zone ${strategy.socMatch.jobZone}`, auto: true },
    { label: 'Wage Level', value: wageAmount ? `$${wageAmount.toLocaleString()}/yr` : 'N/A', auto: true },
    { label: 'Company Name', value: employer.companyName, auto: false },
    { label: 'FEIN', value: employer.fein, auto: false },
    { label: 'Worksite Address', value: `${employer.worksiteAddress}, ${employer.worksiteCity} ${employer.worksiteState}`, auto: false },
  ];

  const postingNotice = generatePostingNotice(employer, strategy, wageAmount);

  const handleCopyPosting = () => {
    navigator.clipboard.writeText(postingNotice);
    setCopied(true);
    toast.success('Posting notice copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPosting = async () => {
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
      const { saveAs } = await import('file-saver');

      const lines = postingNotice.split('\n');
      const paragraphs = lines.map(line => {
        const trimmed = line.trim();
        const isBorder = /^[═─]+$/.test(trimmed);
        const isHeader = trimmed === 'NOTICE OF LCA FILING' || trimmed.includes('Labor Condition Application');
        const isSectionHead = /^[A-Z ]+:$/.test(trimmed) || trimmed.startsWith('JOB INFORMATION') || trimmed.startsWith('EMPLOYEE RIGHTS') || trimmed.startsWith('WORKSITE LOCATION');

        const parts = trimmed.split(/(\[[^\]]+\])/g);
        const runs = parts.map(part =>
          part.startsWith('[') && part.endsWith(']')
            ? new TextRun({ text: part, bold: true, highlight: 'yellow', font: 'Calibri', size: 22 })
            : new TextRun({
                text: part,
                bold: isHeader || isSectionHead,
                font: 'Calibri',
                size: isHeader ? 28 : 22,
              })
        );

        return new Paragraph({
          children: isBorder ? [new TextRun({ text: '─'.repeat(60), font: 'Calibri', size: 18, color: '999999' })] : runs,
          alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { after: isHeader ? 100 : 40 },
        });
      });

      const doc = new Document({
        sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children: paragraphs }],
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `LCA_Posting_Notice_${strategy.socMatch.socCode}.docx`);
      toast.success('Posting notice downloaded as Word');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Word document');
    }
  };

  const InputField = ({ label, labelCn, field, placeholder }: { label: string; labelCn: string; field: keyof EmployerData; placeholder?: string }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label} <span className="text-muted-foreground">· {labelCn}</span></Label>
      <Input
        value={employer[field]}
        onChange={e => updateField(field, e.target.value)}
        placeholder={placeholder || label}
        className="h-8 text-sm"
      />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border shadow-sm">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                LCA (ETA-9035) Auto-Fill
                <span className="text-sm font-body text-muted-foreground">LCA 自动填充</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Strategy selector */}
              <div className="flex flex-wrap gap-2">
                {strategies.map((s, i) => (
                  <Badge
                    key={i}
                    variant={i === selectedStrategyIdx ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedStrategyIdx(i)}
                  >
                    {s.socMatch.socCode} — {s.socMatch.title}
                  </Badge>
                ))}
              </div>

              {/* Auto-populated fields */}
              <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  Auto-Populated from Strategy / 自动填充字段
                </h4>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  {lcaFields.filter(f => f.auto).map((f, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-muted-foreground">{f.label}:</span>
                      <span className="font-mono text-foreground">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Employer info form */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1">
                  <Building2 className="h-4 w-4 text-accent" />
                  Employer Information / 雇主信息
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <InputField label="Company Name" labelCn="公司名称" field="companyName" />
                  <InputField label="FEIN" labelCn="联邦雇主识别号" field="fein" placeholder="XX-XXXXXXX" />
                  <InputField label="NAICS Code" labelCn="行业代码" field="naicsCode" />
                  <InputField label="Address" labelCn="地址" field="address" />
                  <InputField label="City" labelCn="城市" field="city" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">State</Label>
                      <Input value={employer.state} onChange={e => updateField('state', e.target.value)} className="h-8 text-sm" placeholder="CA" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">ZIP</Label>
                      <Input value={employer.zip} onChange={e => updateField('zip', e.target.value)} className="h-8 text-sm" />
                    </div>
                  </div>
                  <InputField label="Contact Name" labelCn="联系人" field="contactName" />
                  <InputField label="Contact Title" labelCn="职称" field="contactTitle" />
                  <InputField label="Phone" labelCn="电话" field="phone" />
                </div>
              </div>

              <Separator />

              {/* Worksite info */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-accent" />
                  Worksite Information / 工作地点信息
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <InputField label="Worksite Address" labelCn="工作地点地址" field="worksiteAddress" />
                  <InputField label="City" labelCn="城市" field="worksiteCity" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">State</Label>
                      <Input value={employer.worksiteState} onChange={e => updateField('worksiteState', e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">ZIP</Label>
                      <Input value={employer.worksiteZip} onChange={e => updateField('worksiteZip', e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">County</Label>
                      <Input value={employer.worksiteCounty} onChange={e => updateField('worksiteCounty', e.target.value)} className="h-8 text-sm" />
                    </div>
                  </div>
                  <InputField label="Job Title" labelCn="职位名称" field="jobTitle" placeholder={strategy.socMatch.title} />
                  <InputField label="Number of Workers" labelCn="工人数量" field="numWorkers" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Begin Date</Label>
                      <Input type="date" value={employer.beginDate} onChange={e => updateField('beginDate', e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">End Date</Label>
                      <Input type="date" value={employer.endDate} onChange={e => updateField('endDate', e.target.value)} className="h-8 text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Posting Notice */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">
                    LCA Posting Notice / LCA 内部公示
                  </h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyPosting}>
                      {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadPosting}>
                      <FileType className="h-3 w-3 mr-1" />
                      Word
                    </Button>
                  </div>
                </div>

                <pre className="p-4 rounded-lg bg-card border border-border text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap text-foreground max-h-[400px] overflow-y-auto">
                  {postingNotice}
                </pre>

                <p className="text-xs text-muted-foreground italic">
                  Per 20 CFR § 655.734, this notice must be posted at the worksite for 10 consecutive business days before filing the LCA.
                  根据 20 CFR § 655.734，此公示须在提交 LCA 前在工作地点连续张贴10个工作日。
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
}
