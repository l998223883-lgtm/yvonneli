import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, ChevronDown, ChevronRight, ChevronLeft, Check, AlertTriangle,
  Building2, User, Briefcase, MapPin, DollarSign, ClipboardList, Download,
  Circle, CheckCircle, Package, FileType,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { StrategyReport, StrategyOption } from '@/types/h1b';

// ─── Types ───────────────────────────────────────────────────────

interface PetitionerInfo {
  companyName: string;
  dba: string;
  fein: string;
  businessType: string;
  yearEstablished: string;
  numEmployees: string;
  grossAnnualIncome: string;
  netAnnualIncome: string;
  naicsCode: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  isAgent: boolean;
}

interface BeneficiaryInfo {
  lastName: string;
  firstName: string;
  middleName: string;
  dob: string;
  countryOfBirth: string;
  countryOfCitizenship: string;
  ssn: string;
  alienNumber: string;
  passportNumber: string;
  passportExpiry: string;
  currentStatus: string;
  currentStatusExpiry: string;
  i94Number: string;
  arrivalDate: string;
  lastEntryCity: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  daytimePhone: string;
  email: string;
}

interface JobInfo {
  jobTitle: string;
  socCode: string;
  socTitle: string;
  numPositions: string;
  fullPartTime: string;
  hoursPerWeek: string;
  wageAmount: string;
  wagePer: string;
  prevailingWage: string;
  worksiteAddress: string;
  worksiteCity: string;
  worksiteState: string;
  worksiteZip: string;
  worksiteCounty: string;
  lcaCaseNumber: string;
  startDate: string;
  endDate: string;
  isNewEmployment: boolean;
  isContinuation: boolean;
  isAmendment: boolean;
  jobDuties: string;
  minimumEducation: string;
  minimumExperience: string;
  requiredTraining: string;
  additionalRequirements: string;
}

interface AttachmentItem {
  id: string;
  label: string;
  labelCn: string;
  description: string;
  category: string;
  required: boolean;
  status: 'pending' | 'ready' | 'na';
}

// ─── Defaults ────────────────────────────────────────────────────

const emptyPetitioner: PetitionerInfo = {
  companyName: '', dba: '', fein: '', businessType: '', yearEstablished: '',
  numEmployees: '', grossAnnualIncome: '', netAnnualIncome: '', naicsCode: '',
  address: '', city: '', state: '', zip: '', phone: '',
  contactName: '', contactTitle: '', contactEmail: '', isAgent: false,
};

const emptyBeneficiary: BeneficiaryInfo = {
  lastName: '', firstName: '', middleName: '', dob: '', countryOfBirth: '',
  countryOfCitizenship: '', ssn: '', alienNumber: '', passportNumber: '',
  passportExpiry: '', currentStatus: '', currentStatusExpiry: '', i94Number: '',
  arrivalDate: '', lastEntryCity: '', address: '', city: '', state: '', zip: '',
  daytimePhone: '', email: '',
};

const createJobInfo = (strategy?: StrategyOption): JobInfo => ({
  jobTitle: strategy?.socMatch.title || '',
  socCode: strategy?.socMatch.socCode || '',
  socTitle: strategy?.socMatch.title || '',
  numPositions: '1',
  fullPartTime: 'full',
  hoursPerWeek: '40',
  wageAmount: strategy?.wageLevels.find(w => w.level === 1)?.amount?.toString() || '',
  wagePer: 'year',
  prevailingWage: strategy?.wageLevels.find(w => w.level === 1)?.amount?.toString() || '',
  worksiteAddress: '', worksiteCity: '', worksiteState: '', worksiteZip: '', worksiteCounty: '',
  lcaCaseNumber: '', startDate: '2026-10-01', endDate: '2029-09-30',
  isNewEmployment: true, isContinuation: false, isAmendment: false,
  jobDuties: '',
  minimumEducation: strategy?.socMatch.educationLevel || "Bachelor's degree",
  minimumExperience: '', requiredTraining: '', additionalRequirements: '',
});

// ─── Attachment Checklist Data ───────────────────────────────────

const ATTACHMENTS: AttachmentItem[] = [
  // Filing Forms
  { id: 'i129', label: 'Form I-129 Petition', labelCn: 'I-129 申请表', description: 'Completed and signed Form I-129 with all applicable supplements', category: 'Filing Forms', required: true, status: 'pending' },
  { id: 'h_supplement', label: 'H Classification Supplement', labelCn: 'H 类别补充表', description: 'H-1B Data Collection and Filing Fee Exemption Supplement', category: 'Filing Forms', required: true, status: 'pending' },
  { id: 'h1b_supplement', label: 'H-1B and H-1B1 Data Collection Supplement', labelCn: 'H-1B 数据采集补充表', description: 'Required for all H-1B petitions filed on or after April 1', category: 'Filing Forms', required: true, status: 'pending' },
  { id: 'filing_fee', label: 'Filing Fee (I-129)', labelCn: 'I-129 申请费', description: 'Check or money order payable to "U.S. Department of Homeland Security"', category: 'Filing Forms', required: true, status: 'pending' },
  { id: 'acwia_fee', label: 'ACWIA Training Fee', labelCn: 'ACWIA 培训费', description: '$750 (< 25 employees) or $1,500 (≥ 25 employees). INA § 214(c)(9)', category: 'Filing Forms', required: true, status: 'pending' },
  { id: 'fraud_fee', label: 'Fraud Prevention Fee ($500)', labelCn: '反欺诈检测费', description: 'Required for initial H-1B petitions. INA § 214(c)(12)', category: 'Filing Forms', required: true, status: 'pending' },
  { id: 'asylum_fee', label: 'Asylum Program Fee', labelCn: '庇护项目费', description: '$300 (small employer) or $600 (standard). Public Law 117-328', category: 'Filing Forms', required: true, status: 'pending' },
  { id: 'premium_fee', label: 'Premium Processing Fee (I-907)', labelCn: '加急处理费 (I-907)', description: '$2,805 with Form I-907 if premium processing requested', category: 'Filing Forms', required: false, status: 'pending' },

  // LCA
  { id: 'lca_certified', label: 'Certified LCA (ETA-9035/9035E)', labelCn: '经认证的 LCA 表格', description: 'Must be certified by DOL before filing I-129. SOC code and wage must match.', category: 'LCA Documents', required: true, status: 'pending' },
  { id: 'lca_posting', label: 'LCA Posting Notice Proof', labelCn: 'LCA 公示证明', description: 'Evidence of 10-day posting at worksite with dates. 20 CFR § 655.734', category: 'LCA Documents', required: true, status: 'pending' },

  // Employer Evidence
  { id: 'support_letter', label: 'Employer Support Letter', labelCn: '雇主支持信', description: 'Detailed letter describing position, duties, and why it requires specialty occupation', category: 'Employer Evidence', required: true, status: 'pending' },
  { id: 'org_chart', label: 'Organizational Chart', labelCn: '组织结构图', description: 'Chart showing H-1B position, supervisor, and reporting structure', category: 'Employer Evidence', required: true, status: 'pending' },
  { id: 'company_reg', label: 'Company Registration / Articles of Incorporation', labelCn: '公司注册/章程', description: 'State registration, articles of incorporation, or business license', category: 'Employer Evidence', required: true, status: 'pending' },
  { id: 'tax_returns_co', label: 'Company Tax Returns (Most Recent Year)', labelCn: '公司最近一年报税单', description: 'Form 1120 or 1120-S to demonstrate ability to pay', category: 'Employer Evidence', required: true, status: 'pending' },
  { id: 'financial_docs', label: 'Financial Statements / Bank Statements', labelCn: '财务报表/银行账单', description: 'Audited financials or 3-6 months of bank statements (especially for startups)', category: 'Employer Evidence', required: false, status: 'pending' },
  { id: 'office_lease', label: 'Office Lease Agreement', labelCn: '办公室租约', description: 'Lease or deed showing the petitioner has a physical worksite', category: 'Employer Evidence', required: false, status: 'pending' },
  { id: 'office_photos', label: 'Worksite Photos', labelCn: '办公地点照片', description: 'Photos of the worksite showing established business operations', category: 'Employer Evidence', required: false, status: 'pending' },

  // Specialty Occupation
  { id: 'specialty_letter', label: 'Specialty Occupation Argument Letter', labelCn: '专业职业论证信', description: 'Legal brief addressing all 4 criteria under 8 CFR § 214.2(h)(4)(ii)', category: 'Specialty Occupation', required: true, status: 'pending' },
  { id: 'expert_opinion', label: 'Expert Opinion Letter', labelCn: '专家意见信', description: 'Letter from qualified academic expert opining on specialty nature of position', category: 'Specialty Occupation', required: true, status: 'pending' },
  { id: 'job_postings', label: 'Comparable Job Postings (5-10)', labelCn: '可比职位招聘信息 (5-10个)', description: 'Job listings from similar companies requiring same degree for similar positions', category: 'Specialty Occupation', required: true, status: 'pending' },
  { id: 'ooh_excerpt', label: 'OOH / O*NET Data Excerpts', labelCn: 'OOH/O*NET 数据摘录', description: 'Bureau of Labor Statistics Occupational Outlook Handbook data for the SOC code', category: 'Specialty Occupation', required: true, status: 'pending' },

  // Beneficiary Documents
  { id: 'degree_cert', label: 'Degree Certificate(s)', labelCn: '学位证书', description: 'Original or certified copies of all degrees', category: 'Beneficiary Documents', required: true, status: 'pending' },
  { id: 'transcripts', label: 'Official Transcripts', labelCn: '官方成绩单', description: 'Sealed transcripts from all degree-granting institutions', category: 'Beneficiary Documents', required: true, status: 'pending' },
  { id: 'credential_eval', label: 'Credential Evaluation (if foreign degree)', labelCn: '学历认证（海外学位）', description: 'Course-by-course evaluation from NACES/AICE member agency', category: 'Beneficiary Documents', required: false, status: 'pending' },
  { id: 'course_syllabi', label: 'Course Descriptions / Syllabi', labelCn: '课程描述/大纲', description: 'Detailed descriptions for key courses relevant to the position', category: 'Beneficiary Documents', required: true, status: 'pending' },
  { id: 'resume_cv', label: 'Resume / CV', labelCn: '简历', description: 'Current detailed resume listing education, skills, and experience', category: 'Beneficiary Documents', required: true, status: 'pending' },
  { id: 'experience_letters', label: 'Employment Verification Letters', labelCn: '工作经验证明信', description: 'Letters from each employer on company letterhead with duties, dates, hours', category: 'Beneficiary Documents', required: true, status: 'pending' },
  { id: 'passport_copy', label: 'Passport Copy (ID page)', labelCn: '护照复印件（身份页）', description: 'Clear copy of passport biometric page', category: 'Beneficiary Documents', required: true, status: 'pending' },
  { id: 'visa_stamp', label: 'Current Visa Stamp Copy', labelCn: '当前签证页复印件', description: 'Copy of most recent U.S. visa stamp if applicable', category: 'Beneficiary Documents', required: false, status: 'pending' },
  { id: 'i94', label: 'I-94 Arrival/Departure Record', labelCn: 'I-94 出入境记录', description: 'Printout from CBP website for change-of-status cases', category: 'Beneficiary Documents', required: false, status: 'pending' },
  { id: 'prior_i797', label: 'Prior I-797 Approval Notices', labelCn: '此前 I-797 批准通知', description: 'All prior approval notices for immigration benefits', category: 'Beneficiary Documents', required: false, status: 'pending' },
  { id: 'ead_copy', label: 'Current EAD Card (if on OPT)', labelCn: '当前 EAD 卡（如在 OPT）', description: 'Copy of Employment Authorization Document if currently on OPT/STEM OPT', category: 'Beneficiary Documents', required: false, status: 'pending' },
  { id: 'beneficiary_statement', label: 'Beneficiary Personal Statement', labelCn: '受益人个人陈述', description: 'Statement connecting education, experience, and career goals to the position', category: 'Beneficiary Documents', required: false, status: 'pending' },

  // Third-Party / Offsite (conditional)
  { id: 'client_contracts', label: 'Client Contracts / SOWs', labelCn: '客户合同/工作说明书', description: 'For third-party placement: signed contracts covering the H-1B validity period', category: 'Third-Party Placement', required: false, status: 'pending' },
  { id: 'client_letters', label: 'End-Client Confirmation Letters', labelCn: '最终客户确认信', description: 'Letters confirming project details, duration, and petitioner\'s supervisory role', category: 'Third-Party Placement', required: false, status: 'pending' },
  { id: 'work_itinerary', label: 'Detailed Work Itinerary', labelCn: '详细工作行程', description: 'Complete itinerary with dates, locations, projects for the full petition period', category: 'Third-Party Placement', required: false, status: 'pending' },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Filing Forms': <FileText className="h-3.5 w-3.5" />,
  'LCA Documents': <ClipboardList className="h-3.5 w-3.5" />,
  'Employer Evidence': <Building2 className="h-3.5 w-3.5" />,
  'Specialty Occupation': <Briefcase className="h-3.5 w-3.5" />,
  'Beneficiary Documents': <User className="h-3.5 w-3.5" />,
  'Third-Party Placement': <MapPin className="h-3.5 w-3.5" />,
};

// ─── Wizard Steps ────────────────────────────────────────────────

const WIZARD_STEPS = [
  { id: 'petitioner', label: 'Petitioner', labelCn: '申请人', icon: <Building2 className="h-4 w-4" /> },
  { id: 'beneficiary', label: 'Beneficiary', labelCn: '受益人', icon: <User className="h-4 w-4" /> },
  { id: 'job', label: 'Job Details', labelCn: '职位详情', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'attachments', label: 'Attachments', labelCn: '附件清单', icon: <Package className="h-4 w-4" /> },
];

// ─── Component ───────────────────────────────────────────────────

interface I129BuilderProps {
  report: StrategyReport;
}

export function I129Builder({ report }: I129BuilderProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStrategyIdx, setSelectedStrategyIdx] = useState(0);

  const strategy = report.strategies[selectedStrategyIdx] || report.strategies[0];

  const [petitioner, setPetitioner] = useState<PetitionerInfo>(emptyPetitioner);
  const [beneficiary, setBeneficiary] = useState<BeneficiaryInfo>(emptyBeneficiary);
  const [job, setJob] = useState<JobInfo>(() => createJobInfo(strategy));
  const [attachmentStatus, setAttachmentStatus] = useState<Record<string, 'pending' | 'ready' | 'na'>>({});

  // Update job info when strategy changes
  const handleStrategyChange = (idx: number) => {
    setSelectedStrategyIdx(idx);
    const s = report.strategies[idx];
    if (s) {
      setJob(prev => ({
        ...prev,
        socCode: s.socMatch.socCode,
        socTitle: s.socMatch.title,
        jobTitle: prev.jobTitle || s.socMatch.title,
        wageAmount: s.wageLevels.find(w => w.level === 1)?.amount?.toString() || prev.wageAmount,
        prevailingWage: s.wageLevels.find(w => w.level === 1)?.amount?.toString() || prev.prevailingWage,
        minimumEducation: s.socMatch.educationLevel || prev.minimumEducation,
      }));
    }
  };

  const toggleAttachment = (id: string) => {
    setAttachmentStatus(prev => {
      const current = prev[id] || 'pending';
      const next = current === 'pending' ? 'ready' : current === 'ready' ? 'na' : 'pending';
      return { ...prev, [id]: next };
    });
  };

  // Stats
  const totalRequired = ATTACHMENTS.filter(a => a.required).length;
  const readyRequired = ATTACHMENTS.filter(a => a.required && attachmentStatus[a.id] === 'ready').length;
  const totalAll = ATTACHMENTS.length;
  const readyAll = ATTACHMENTS.filter(a => attachmentStatus[a.id] === 'ready').length;
  const naAll = ATTACHMENTS.filter(a => attachmentStatus[a.id] === 'na').length;

  // Compute completion per step
  const petitionerFields = Object.values(petitioner).filter(v => typeof v === 'string' && v.trim()).length;
  const beneficiaryFields = Object.values(beneficiary).filter(v => typeof v === 'string' && v.trim()).length;
  const jobFields = Object.values(job).filter(v => typeof v === 'string' && v.trim()).length;
  const stepCompletions = [
    Math.min(100, Math.round((petitionerFields / 12) * 100)),
    Math.min(100, Math.round((beneficiaryFields / 14) * 100)),
    Math.min(100, Math.round((jobFields / 10) * 100)),
    totalRequired > 0 ? Math.round((readyRequired / totalRequired) * 100) : 0,
  ];

  const overallProgress = Math.round(stepCompletions.reduce((a, b) => a + b, 0) / 4);

  const PField = ({ label, labelCn, field, placeholder, type = 'text', span = 1 }: {
    label: string; labelCn: string; field: keyof PetitionerInfo; placeholder?: string; type?: string; span?: number;
  }) => (
    <div className={cn("space-y-1", span === 2 && "sm:col-span-2")}>
      <Label className="text-xs">{label} <span className="text-muted-foreground">· {labelCn}</span></Label>
      {typeof petitioner[field] === 'boolean' ? (
        <div className="flex items-center gap-2 pt-1">
          <Switch
            checked={petitioner[field] as boolean}
            onCheckedChange={v => setPetitioner(prev => ({ ...prev, [field]: v }))}
          />
          <span className="text-xs text-muted-foreground">{placeholder}</span>
        </div>
      ) : (
        <Input
          type={type}
          value={petitioner[field] as string}
          onChange={e => setPetitioner(prev => ({ ...prev, [field]: e.target.value }))}
          placeholder={placeholder || label}
          className="h-8 text-sm"
        />
      )}
    </div>
  );

  const BField = ({ label, labelCn, field, placeholder, type = 'text' }: {
    label: string; labelCn: string; field: keyof BeneficiaryInfo; placeholder?: string; type?: string;
  }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label} <span className="text-muted-foreground">· {labelCn}</span></Label>
      <Input
        type={type}
        value={beneficiary[field]}
        onChange={e => setBeneficiary(prev => ({ ...prev, [field]: e.target.value }))}
        placeholder={placeholder || label}
        className="h-8 text-sm"
      />
    </div>
  );

  const JField = ({ label, labelCn, field, placeholder, type = 'text', disabled = false }: {
    label: string; labelCn: string; field: keyof JobInfo; placeholder?: string; type?: string; disabled?: boolean;
  }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label} <span className="text-muted-foreground">· {labelCn}</span></Label>
      <Input
        type={type}
        value={job[field] as string}
        onChange={e => setJob(prev => ({ ...prev, [field]: e.target.value }))}
        placeholder={placeholder || label}
        className={cn("h-8 text-sm", disabled && "bg-muted/50")}
        disabled={disabled}
      />
    </div>
  );

  // Export summary
  const handleExportSummary = async () => {
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
      const { saveAs } = await import('file-saver');

      const sections: any[] = [];
      const addHeading = (text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1) =>
        sections.push(new Paragraph({ text, heading: level, spacing: { after: 200 } }));
      const addField = (label: string, value: string) =>
        sections.push(new Paragraph({
          children: [
            new TextRun({ text: `${label}: `, bold: true, font: 'Calibri', size: 22 }),
            new TextRun({ text: value || '[TO BE COMPLETED]', font: 'Calibri', size: 22, highlight: value ? undefined : 'yellow' }),
          ],
          spacing: { after: 60 },
        }));

      addHeading('I-129 Petition Package Summary');

      addHeading('Section 1: Petitioner Information', HeadingLevel.HEADING_2);
      addField('Company Name', petitioner.companyName);
      addField('DBA', petitioner.dba);
      addField('FEIN', petitioner.fein);
      addField('Business Type', petitioner.businessType);
      addField('Year Established', petitioner.yearEstablished);
      addField('Number of Employees', petitioner.numEmployees);
      addField('Gross Annual Income', petitioner.grossAnnualIncome);
      addField('Net Annual Income', petitioner.netAnnualIncome);
      addField('Address', `${petitioner.address}, ${petitioner.city}, ${petitioner.state} ${petitioner.zip}`);
      addField('Contact', `${petitioner.contactName} (${petitioner.contactTitle})`);
      addField('Phone', petitioner.phone);
      addField('Email', petitioner.contactEmail);

      addHeading('Section 2: Beneficiary Information', HeadingLevel.HEADING_2);
      addField('Name', `${beneficiary.lastName}, ${beneficiary.firstName} ${beneficiary.middleName}`);
      addField('Date of Birth', beneficiary.dob);
      addField('Country of Birth', beneficiary.countryOfBirth);
      addField('Country of Citizenship', beneficiary.countryOfCitizenship);
      addField('Passport Number', beneficiary.passportNumber);
      addField('Current Status', beneficiary.currentStatus);
      addField('I-94 Number', beneficiary.i94Number);
      addField('U.S. Address', `${beneficiary.address}, ${beneficiary.city}, ${beneficiary.state} ${beneficiary.zip}`);

      addHeading('Section 3: Job Details', HeadingLevel.HEADING_2);
      addField('Job Title', job.jobTitle);
      addField('SOC Code', job.socCode);
      addField('SOC Title', job.socTitle);
      addField('Wage', `$${job.wageAmount} per ${job.wagePer}`);
      addField('Prevailing Wage', `$${job.prevailingWage}`);
      addField('Hours/Week', job.hoursPerWeek);
      addField('LCA Case Number', job.lcaCaseNumber);
      addField('Employment Period', `${job.startDate} to ${job.endDate}`);
      addField('Worksite', `${job.worksiteAddress}, ${job.worksiteCity}, ${job.worksiteState} ${job.worksiteZip}`);
      addField('Minimum Education', job.minimumEducation);
      addField('Minimum Experience', job.minimumExperience);

      addHeading('Section 4: Attachment Checklist', HeadingLevel.HEADING_2);
      const categories = [...new Set(ATTACHMENTS.map(a => a.category))];
      for (const cat of categories) {
        sections.push(new Paragraph({ text: cat, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } }));
        for (const att of ATTACHMENTS.filter(a => a.category === cat)) {
          const status = attachmentStatus[att.id] || 'pending';
          const icon = status === 'ready' ? '✅' : status === 'na' ? '➖' : '⬜';
          sections.push(new Paragraph({
            children: [
              new TextRun({ text: `${icon} `, font: 'Calibri', size: 22 }),
              new TextRun({ text: att.label, bold: att.required, font: 'Calibri', size: 22 }),
              new TextRun({ text: att.required ? ' (Required)' : ' (Optional)', italics: true, font: 'Calibri', size: 20, color: '666666' }),
            ],
            spacing: { after: 40 },
          }));
        }
      }

      const doc = new Document({
        sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children: sections }],
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `I-129_Package_Summary_${strategy.socMatch.socCode}.docx`);
      toast.success('I-129 package summary downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export summary');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border shadow-sm">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                I-129 Petition Package Builder
                <span className="text-sm font-body text-muted-foreground">I-129 申请包构建器</span>
                <Badge variant="outline" className="ml-2 text-xs font-mono">{overallProgress}%</Badge>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Strategy selector */}
              <div className="flex flex-wrap gap-2">
                {report.strategies.map((s, i) => (
                  <Badge
                    key={i}
                    variant={i === selectedStrategyIdx ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleStrategyChange(i)}
                  >
                    {s.socMatch.socCode} — {s.socMatch.title}
                  </Badge>
                ))}
              </div>

              {/* Overall progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Completion / 总体完成度</span>
                  <span className="font-mono text-foreground">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {WIZARD_STEPS.map((step, i) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(i)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                      i === currentStep
                        ? "bg-primary text-primary-foreground"
                        : stepCompletions[i] === 100
                          ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border border-[hsl(var(--success))]/30"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {step.icon}
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="text-xs opacity-70">· {step.labelCn}</span>
                    <span className="text-[10px] font-mono ml-1">{stepCompletions[i]}%</span>
                  </button>
                ))}
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Step 0: Petitioner */}
                  {currentStep === 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-accent" />
                        Petitioner (Employer) Information / 申请人（雇主）信息
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        I-129 Part 1: Information About the Petitioner. This corresponds to Form I-129, pages 1-2.
                      </p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <PField label="Company Legal Name" labelCn="公司法定名称" field="companyName" />
                        <PField label="DBA (if any)" labelCn="商号（如有）" field="dba" />
                        <PField label="FEIN" labelCn="联邦雇主识别号" field="fein" placeholder="XX-XXXXXXX" />
                        <PField label="Business Type" labelCn="企业类型" field="businessType" placeholder="Corporation, LLC, etc." />
                        <PField label="Year Established" labelCn="成立年份" field="yearEstablished" type="number" />
                        <PField label="Number of Employees" labelCn="员工人数" field="numEmployees" type="number" />
                        <PField label="Gross Annual Income" labelCn="年总收入" field="grossAnnualIncome" placeholder="$" />
                        <PField label="Net Annual Income" labelCn="年净收入" field="netAnnualIncome" placeholder="$" />
                        <PField label="NAICS Code" labelCn="行业代码" field="naicsCode" />
                      </div>
                      <Separator />
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <PField label="Street Address" labelCn="街道地址" field="address" span={2} />
                        <PField label="City" labelCn="城市" field="city" />
                        <PField label="State" labelCn="州" field="state" placeholder="CA" />
                        <PField label="ZIP Code" labelCn="邮编" field="zip" />
                        <PField label="Phone" labelCn="电话" field="phone" />
                        <PField label="Contact Name" labelCn="联系人姓名" field="contactName" />
                        <PField label="Contact Title" labelCn="联系人职务" field="contactTitle" />
                        <PField label="Contact Email" labelCn="联系人邮箱" field="contactEmail" type="email" />
                      </div>
                      <PField label="Filing as Agent?" labelCn="是否为代理申请？" field="isAgent" placeholder="Check if filing as an agent rather than the employer" />
                    </div>
                  )}

                  {/* Step 1: Beneficiary */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                        <User className="h-4 w-4 text-accent" />
                        Beneficiary Information / 受益人信息
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        I-129 Part 2 & H Supplement: Information About the Beneficiary. Auto-populated from analysis where available.
                      </p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <BField label="Family Name (Last)" labelCn="姓" field="lastName" />
                        <BField label="Given Name (First)" labelCn="名" field="firstName" />
                        <BField label="Middle Name" labelCn="中间名" field="middleName" />
                        <BField label="Date of Birth" labelCn="出生日期" field="dob" type="date" />
                        <BField label="Country of Birth" labelCn="出生国" field="countryOfBirth" />
                        <BField label="Country of Citizenship" labelCn="国籍" field="countryOfCitizenship" />
                      </div>
                      <Separator />
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Immigration Status / 移民身份
                      </h5>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <BField label="SSN (if any)" labelCn="社会安全号" field="ssn" placeholder="XXX-XX-XXXX" />
                        <BField label="A-Number (if any)" labelCn="外国人号码" field="alienNumber" placeholder="A-XXXXXXXXX" />
                        <BField label="Passport Number" labelCn="护照号" field="passportNumber" />
                        <BField label="Passport Expiry" labelCn="护照有效期" field="passportExpiry" type="date" />
                        <BField label="Current Nonimmigrant Status" labelCn="当前非移民身份" field="currentStatus" placeholder="F-1, H-1B, etc." />
                        <BField label="Status Expiry Date" labelCn="身份到期日" field="currentStatusExpiry" type="date" />
                        <BField label="I-94 Number" labelCn="I-94 号码" field="i94Number" />
                        <BField label="Date of Last Arrival" labelCn="最近入境日期" field="arrivalDate" type="date" />
                        <BField label="Port of Entry" labelCn="入境口岸" field="lastEntryCity" />
                      </div>
                      <Separator />
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        U.S. Address / 美国地址
                      </h5>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <BField label="Street Address" labelCn="街道地址" field="address" />
                        <BField label="City" labelCn="城市" field="city" />
                        <BField label="State" labelCn="州" field="state" />
                        <BField label="ZIP Code" labelCn="邮编" field="zip" />
                        <BField label="Daytime Phone" labelCn="日间电话" field="daytimePhone" />
                        <BField label="Email" labelCn="电子邮箱" field="email" type="email" />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Job Details */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                        <Briefcase className="h-4 w-4 text-accent" />
                        Job Details & H Classification / 职位详情 & H 类别
                      </h4>
                      <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-primary" />
                          Fields auto-populated from strategy: SOC Code, Title, Wage, Education Level
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <JField label="Job Title" labelCn="职位名称" field="jobTitle" />
                        <JField label="SOC Code" labelCn="SOC 代码" field="socCode" disabled />
                        <JField label="SOC Title" labelCn="SOC 职位名称" field="socTitle" disabled />
                        <JField label="Number of Positions" labelCn="职位数量" field="numPositions" type="number" />
                        <div className="space-y-1">
                          <Label className="text-xs">Full/Part-Time · 全职/兼职</Label>
                          <Select value={job.fullPartTime} onValueChange={v => setJob(prev => ({ ...prev, fullPartTime: v }))}>
                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">Full-Time 全职</SelectItem>
                              <SelectItem value="part">Part-Time 兼职</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <JField label="Hours Per Week" labelCn="每周工时" field="hoursPerWeek" type="number" />
                      </div>

                      <Separator />
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> Wage / 工资
                      </h5>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <JField label="Offered Wage" labelCn="提供工资" field="wageAmount" placeholder="$" />
                        <div className="space-y-1">
                          <Label className="text-xs">Wage Per · 工资周期</Label>
                          <Select value={job.wagePer} onValueChange={v => setJob(prev => ({ ...prev, wagePer: v }))}>
                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="year">Per Year 每年</SelectItem>
                              <SelectItem value="month">Per Month 每月</SelectItem>
                              <SelectItem value="biweekly">Bi-Weekly 双周</SelectItem>
                              <SelectItem value="week">Per Week 每周</SelectItem>
                              <SelectItem value="hour">Per Hour 每小时</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <JField label="Prevailing Wage" labelCn="现行工资" field="prevailingWage" placeholder="$" />
                        <JField label="LCA Case Number" labelCn="LCA 案件号" field="lcaCaseNumber" placeholder="I-200-XXXXX-XXXXXX" />
                        <JField label="Start Date" labelCn="起始日期" field="startDate" type="date" />
                        <JField label="End Date" labelCn="结束日期" field="endDate" type="date" />
                      </div>

                      <Separator />
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Worksite / 工作地点
                      </h5>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <JField label="Worksite Address" labelCn="工作地点地址" field="worksiteAddress" />
                        <JField label="City" labelCn="城市" field="worksiteCity" />
                        <JField label="State" labelCn="州" field="worksiteState" />
                        <JField label="ZIP" labelCn="邮编" field="worksiteZip" />
                        <JField label="County" labelCn="县" field="worksiteCounty" />
                      </div>

                      <Separator />
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Requirements / 职位要求
                      </h5>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <JField label="Minimum Education" labelCn="最低学历" field="minimumEducation" />
                        <JField label="Minimum Experience" labelCn="最低经验" field="minimumExperience" placeholder="e.g. 2 years" />
                        <JField label="Required Training / Certifications" labelCn="要求的培训/证书" field="requiredTraining" />
                        <JField label="Additional Requirements" labelCn="其他要求" field="additionalRequirements" />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Job Duties (Detailed) · 职位职责（详细）</Label>
                        <Textarea
                          value={job.jobDuties}
                          onChange={e => setJob(prev => ({ ...prev, jobDuties: e.target.value }))}
                          placeholder="List each duty with percentage of time and specific technologies/methodologies involved..."
                          className="min-h-[120px] text-sm"
                        />
                        <p className="text-xs text-muted-foreground italic">
                          Tip: Be specific. Instead of "analyze data," write "Design and implement machine learning models using Python/TensorFlow to analyze customer behavior patterns (30%)."
                        </p>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <Switch checked={job.isNewEmployment} onCheckedChange={v => setJob(prev => ({ ...prev, isNewEmployment: v, isContinuation: false, isAmendment: false }))} />
                          <Label className="text-xs">New Employment 新雇佣</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={job.isContinuation} onCheckedChange={v => setJob(prev => ({ ...prev, isContinuation: v, isNewEmployment: false, isAmendment: false }))} />
                          <Label className="text-xs">Continuation 延期</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={job.isAmendment} onCheckedChange={v => setJob(prev => ({ ...prev, isAmendment: v, isNewEmployment: false, isContinuation: false }))} />
                          <Label className="text-xs">Amendment 修改</Label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Attachments */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                          <Package className="h-4 w-4 text-accent" />
                          Attachment Checklist / 附件清单
                        </h4>
                        <div className="flex gap-2 text-xs">
                          <Badge variant="default" className="font-mono">{readyAll} Ready</Badge>
                          <Badge variant="secondary" className="font-mono">{totalAll - readyAll - naAll} Pending</Badge>
                          <Badge variant="outline" className="font-mono">{naAll} N/A</Badge>
                        </div>
                      </div>

                      <div className="p-3 rounded-md bg-muted/50 border border-border text-xs text-muted-foreground space-y-1">
                        <p>Click each item to cycle through: <strong>⬜ Pending → ✅ Ready → ➖ N/A → ⬜ Pending</strong></p>
                        <p>点击每个项目循环切换：⬜ 待准备 → ✅ 已就绪 → ➖ 不适用</p>
                      </div>

                      {(() => {
                        const categories = [...new Set(ATTACHMENTS.map(a => a.category))];
                        return categories.map(cat => {
                          const items = ATTACHMENTS.filter(a => a.category === cat);
                          const catReady = items.filter(a => attachmentStatus[a.id] === 'ready').length;
                          return (
                            <div key={cat} className="space-y-2">
                              <h5 className="text-sm font-medium text-foreground flex items-center gap-2">
                                {CATEGORY_ICONS[cat]}
                                {cat}
                                <span className="text-xs font-mono text-muted-foreground">{catReady}/{items.length}</span>
                              </h5>
                              <div className="space-y-1">
                                {items.map(att => {
                                  const status = attachmentStatus[att.id] || 'pending';
                                  return (
                                    <button
                                      key={att.id}
                                      onClick={() => toggleAttachment(att.id)}
                                      className={cn(
                                        "w-full flex items-start gap-3 p-2.5 rounded-lg border text-left transition-colors",
                                        status === 'ready' && "bg-primary/5 border-primary/20",
                                        status === 'na' && "bg-muted/30 border-border opacity-50",
                                        status === 'pending' && "bg-card border-border hover:bg-muted/30",
                                      )}
                                    >
                                      <div className="mt-0.5 shrink-0">
                                        {status === 'ready' ? <CheckCircle className="h-4 w-4 text-primary" /> :
                                         status === 'na' ? <Circle className="h-4 w-4 text-muted-foreground line-through" /> :
                                         <Circle className="h-4 w-4 text-muted-foreground" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className={cn("text-sm font-medium", status === 'na' ? "text-muted-foreground line-through" : "text-foreground")}>
                                            {att.label}
                                          </span>
                                          {att.required && <Badge variant="destructive" className="text-[9px] px-1 py-0">Required</Badge>}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{att.labelCn}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{att.description}</p>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              <Separator />
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous 上一步
                </Button>

                <Button variant="outline" size="sm" onClick={handleExportSummary}>
                  <FileType className="h-4 w-4 mr-1" />
                  Export Summary / 导出摘要
                </Button>

                <Button
                  variant={currentStep === WIZARD_STEPS.length - 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (currentStep < WIZARD_STEPS.length - 1) {
                      setCurrentStep(prev => prev + 1);
                    } else {
                      handleExportSummary();
                    }
                  }}
                >
                  {currentStep === WIZARD_STEPS.length - 1 ? (
                    <>
                      <Download className="h-4 w-4 mr-1" />
                      Export Package 导出申请包
                    </>
                  ) : (
                    <>
                      Next 下一步
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
}
