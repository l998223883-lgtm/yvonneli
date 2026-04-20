import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { FileCheck, AlertTriangle, ShieldCheck, Building2, GraduationCap, DollarSign, MapPin, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StrategyOption } from '@/types/h1b';
import { useState } from 'react';

interface RFEChecklistProps {
  strategies: StrategyOption[];
}

interface ChecklistItem {
  id: string;
  label: string;
  labelCn: string;
  description: string;
  priority: 'critical' | 'important' | 'recommended';
  category: string;
  categoryCn: string;
  triggers: string[];
}

// Comprehensive checklist based on USCIS RFE patterns, practitioner guides, and 2025 policy updates
const RFE_CHECKLIST: ChecklistItem[] = [
  // ── Category 1: Specialty Occupation (专业职位) ──
  {
    id: 'specialty_expert_letter',
    label: 'Expert Opinion Letter — Specialty Occupation',
    labelCn: '专家意见信 — 专业职位认定',
    description: 'Third-party letter from a qualified expert (professor/industry leader) establishing the position requires theoretical & practical application of a body of specialized knowledge and at minimum a bachelor\'s degree in a specific field. Cite 8 CFR §214.2(h)(4)(ii).',
    priority: 'critical',
    category: 'Specialty Occupation',
    categoryCn: '专业职位认定',
    triggers: ['always'],
  },
  {
    id: 'detailed_job_description',
    label: 'Detailed Job Description with Specialty Requirements',
    labelCn: '详细职位描述及专业要求',
    description: 'Comprehensive description listing each duty, the percentage of time spent, specific tools/technologies used, and how each duty requires specialized knowledge. Avoid generic language like "prepare reports."',
    priority: 'critical',
    category: 'Specialty Occupation',
    categoryCn: '专业职位认定',
    triggers: ['always'],
  },
  {
    id: 'soc_justification',
    label: 'SOC Code Selection Justification with O*NET Cross-Reference',
    labelCn: 'SOC代码选择论证（含O*NET交叉引用）',
    description: 'Detailed memo explaining why the selected SOC code accurately reflects position duties, with O*NET task/knowledge/skill cross-references. Critical when using a strategic or aggressive SOC code.',
    priority: 'critical',
    category: 'Specialty Occupation',
    categoryCn: '专业职位认定',
    triggers: ['strategic', 'aggressive'],
  },
  {
    id: 'industry_degree_evidence',
    label: 'Industry Standards — Degree Requirement Evidence',
    labelCn: '行业标准 — 学历要求证据',
    description: 'Published job postings from similar employers (5-10 listings), BLS Occupational Outlook Handbook excerpts, and industry association publications showing the position typically requires a bachelor\'s or higher in a specific field.',
    priority: 'important',
    category: 'Specialty Occupation',
    categoryCn: '专业职位认定',
    triggers: ['always'],
  },
  {
    id: 'past_hiring_history',
    label: 'Employer\'s Past Hiring History for the Position',
    labelCn: '雇主该职位历史招聘记录',
    description: 'Evidence that the employer has consistently required a specific degree for this position — past job postings, previous H-1B approvals for similar roles, current employees\' degree information.',
    priority: 'recommended',
    category: 'Specialty Occupation',
    categoryCn: '专业职位认定',
    triggers: ['always'],
  },

  // ── Category 2: Employer-Employee Relationship (雇佣关系) ──
  {
    id: 'org_chart',
    label: 'Organizational Chart with Supervisor Qualifications',
    labelCn: '组织结构图（含主管资质）',
    description: 'Chart showing the H-1B position within company hierarchy, direct supervisor\'s name/title/qualifications, and reporting structure. Shows employer\'s right to control.',
    priority: 'critical',
    category: 'Employer-Employee Relationship',
    categoryCn: '雇佣关系',
    triggers: ['always'],
  },
  {
    id: 'employer_support_letter',
    label: 'Employer Support Letter',
    labelCn: '雇主支持信',
    description: 'Detailed letter from a senior officer describing: right to hire/fire, right to control daily work, right to supervise, tools/equipment provided, performance review process, and work location arrangements.',
    priority: 'critical',
    category: 'Employer-Employee Relationship',
    categoryCn: '雇佣关系',
    triggers: ['always'],
  },
  {
    id: 'employer_legitimacy',
    label: 'Employer Legitimacy Documentation',
    labelCn: '雇主合法性文件',
    description: 'Business registration/articles of incorporation, EIN confirmation, most recent tax returns (Form 1120/1120-S), office lease agreement, photos of business premises, company website.',
    priority: 'important',
    category: 'Employer-Employee Relationship',
    categoryCn: '雇佣关系',
    triggers: ['always'],
  },
  {
    id: 'performance_review_process',
    label: 'Performance Review Process Documentation',
    labelCn: '绩效评估流程文件',
    description: 'Sample performance review forms, evaluation schedules, and evidence of past evaluations conducted — demonstrates ongoing employer control over work quality.',
    priority: 'recommended',
    category: 'Employer-Employee Relationship',
    categoryCn: '雇佣关系',
    triggers: ['offsite', 'remote'],
  },

  // ── Category 3: Beneficiary Qualifications (受益人资质) ──
  {
    id: 'credential_eval',
    label: 'Credential Evaluation (Foreign Degree)',
    labelCn: '学历认证（海外学历）',
    description: 'Course-by-course evaluation from a NACES/AICE member agency establishing U.S. degree equivalency. Must specify the exact U.S. degree equivalent and field of study.',
    priority: 'critical',
    category: 'Beneficiary Qualifications',
    categoryCn: '受益人资质',
    triggers: ['always'],
  },
  {
    id: 'course_duty_mapping',
    label: 'Course-to-Duty Mapping Table',
    labelCn: '课程-职责对照表',
    description: 'Detailed table mapping each relevant course to specific job duties, showing how academic training directly prepares the beneficiary for the position. Include course descriptions and syllabi.',
    priority: 'critical',
    category: 'Beneficiary Qualifications',
    categoryCn: '受益人资质',
    triggers: ['always'],
  },
  {
    id: 'transcripts_course_desc',
    label: 'Official Transcripts + Course Descriptions',
    labelCn: '官方成绩单 + 课程描述',
    description: 'Sealed official transcripts from all degree-granting institutions, plus detailed course descriptions/syllabi for key courses relevant to the position.',
    priority: 'critical',
    category: 'Beneficiary Qualifications',
    categoryCn: '受益人资质',
    triggers: ['always'],
  },
  {
    id: 'alternative_degree_path',
    label: 'Alternative Degree Path Justification',
    labelCn: '替代学位路径论证',
    description: 'When the degree major doesn\'t directly match the SOC code — demonstrate >15% coursework in the relevant field, plus professor letters explaining how the training qualifies the beneficiary. Include course syllabi as exhibits.',
    priority: 'critical',
    category: 'Beneficiary Qualifications',
    categoryCn: '受益人资质',
    triggers: ['course_match', 'strategic', 'aggressive'],
  },
  {
    id: 'work_experience_letters',
    label: 'Work Experience Verification Letters',
    labelCn: '工作经验证明信',
    description: 'Letters from current/past employers on company letterhead detailing: exact job title, dates of employment, hours/week, specific duties performed, tools/technologies used, and supervisor contact info.',
    priority: 'important',
    category: 'Beneficiary Qualifications',
    categoryCn: '受益人资质',
    triggers: ['always'],
  },
  {
    id: 'cpt_documentation',
    label: 'CPT Documentation (if applicable)',
    labelCn: 'CPT相关文件（如适用）',
    description: 'For beneficiaries who used CPT: DSO letter confirming CPT authorization, course registration records, proof CPT was integral to curriculum, pay stubs during CPT period. Especially important for Day-1 CPT students.',
    priority: 'critical',
    category: 'Beneficiary Qualifications',
    categoryCn: '受益人资质',
    triggers: ['cpt'],
  },

  // ── Category 4: Wage Level Issues (工资水平) ──
  {
    id: 'wage_justification_memo',
    label: 'Wage Level Justification Memo',
    labelCn: '工资等级论证备忘录',
    description: 'Detailed memo explaining why the offered wage level reflects the position complexity. For Level 1: explain it\'s entry-level within the specialty, supervised by senior staff. Include comparison with industry salary data.',
    priority: 'critical',
    category: 'Wage Level',
    categoryCn: '工资水平',
    triggers: ['low_wage'],
  },
  {
    id: 'lca_consistency_check',
    label: 'LCA Consistency Verification',
    labelCn: 'LCA一致性核查',
    description: 'Verify and document that the LCA job title, SOC code, work location, and wage level exactly match the H-1B petition. Any discrepancy will trigger an RFE. Include copies of posted LCA notices.',
    priority: 'critical',
    category: 'Wage Level',
    categoryCn: '工资水平',
    triggers: ['always'],
  },

  // ── Category 5: Work Availability / Third-Party Placement (工作内容/行程) ──
  {
    id: 'client_contracts',
    label: 'Client Contracts & Statements of Work',
    labelCn: '客户合同及工作说明书',
    description: 'Signed contracts/SOWs with end-clients covering the entire requested H-1B period. Must include: project description, worker\'s specific role, work location, duration, and supervision details.',
    priority: 'critical',
    category: 'Work Availability',
    categoryCn: '工作内容/行程',
    triggers: ['offsite'],
  },
  {
    id: 'client_letter',
    label: 'Third-Party Client Confirmation Letter',
    labelCn: '第三方客户确认信',
    description: 'Letter from end-client on their letterhead confirming: the project, the H-1B worker\'s specific role, that the petitioner maintains control over the worker, expected duration, and work location.',
    priority: 'critical',
    category: 'Work Availability',
    categoryCn: '工作内容/行程',
    triggers: ['offsite'],
  },
  {
    id: 'work_itinerary',
    label: 'Detailed Work Itinerary',
    labelCn: '详细工作行程计划',
    description: 'For IT consulting/staffing: complete itinerary with dates, locations, projects, and duties at each site for the full requested period. Must be specific, not speculative. Include LCAs for each worksite.',
    priority: 'critical',
    category: 'Work Availability',
    categoryCn: '工作内容/行程',
    triggers: ['offsite'],
  },

  // ── Category 6: Maintenance of Status (身份维持) ──
  {
    id: 'i94_records',
    label: 'I-94 Travel Records',
    labelCn: 'I-94出入境记录',
    description: 'Current I-94 printout from CBP website showing lawful entry, admission class, and authorized stay period. Critical for change-of-status requests.',
    priority: 'critical',
    category: 'Maintenance of Status',
    categoryCn: '身份维持',
    triggers: ['cos'],
  },
  {
    id: 'prior_approval_notices',
    label: 'Prior Visa Approval Notices (I-797)',
    labelCn: '此前签证批准通知（I-797）',
    description: 'Copies of all I-797 approval/receipt notices for prior immigration benefits (OPT EAD, prior H-1B, L-1, etc.) showing continuous lawful status.',
    priority: 'important',
    category: 'Maintenance of Status',
    categoryCn: '身份维持',
    triggers: ['cos'],
  },
  {
    id: 'pay_stubs_status',
    label: 'Pay Stubs Demonstrating Continuous Employment',
    labelCn: '工资单证明持续雇佣',
    description: 'Recent pay stubs (3-6 months) showing continuous employment without gaps. Especially important for F-1 OPT→H-1B transfers. Explain any gaps in employment.',
    priority: 'important',
    category: 'Maintenance of Status',
    categoryCn: '身份维持',
    triggers: ['cos'],
  },
  {
    id: 'tax_returns',
    label: 'Tax Returns / W-2s',
    labelCn: '税务申报单 / W-2',
    description: 'Recent federal tax returns and W-2 forms showing lawful employment and tax compliance during prior status periods.',
    priority: 'recommended',
    category: 'Maintenance of Status',
    categoryCn: '身份维持',
    triggers: ['cos'],
  },

  // ── Category 7: Ability to Pay (支付能力) ──
  {
    id: 'financial_statements',
    label: 'Company Financial Statements / Tax Returns',
    labelCn: '公司财务报表 / 税务申报',
    description: 'Most recent year\'s federal tax return (Form 1120/1120-S), audited financial statements, or annual report showing the company can pay the proffered wage. Especially critical for startups and small employers.',
    priority: 'critical',
    category: 'Ability to Pay',
    categoryCn: '支付能力',
    triggers: ['small_employer', 'founder'],
  },
  {
    id: 'bank_statements',
    label: 'Business Bank Statements',
    labelCn: '公司银行账单',
    description: 'Recent 3-6 months of business bank statements showing sufficient cash reserves to pay the offered salary. Helpful when net income alone doesn\'t cover the wage.',
    priority: 'important',
    category: 'Ability to Pay',
    categoryCn: '支付能力',
    triggers: ['small_employer', 'founder'],
  },
  {
    id: 'payroll_records',
    label: 'Payroll Records / Quarterly Tax Filings (Form 941)',
    labelCn: '工资记录 / 季度税务申报（941表）',
    description: 'Quarterly payroll tax filings showing the company regularly pays employees, demonstrating ongoing ability to meet wage obligations.',
    priority: 'important',
    category: 'Ability to Pay',
    categoryCn: '支付能力',
    triggers: ['small_employer', 'founder'],
  },
  {
    id: 'business_plan',
    label: 'Business Plan & Funding Evidence (Startups)',
    labelCn: '商业计划书及融资证明（初创公司）',
    description: 'For startups: detailed business plan, proof of venture funding/angel investment, advisory board credentials, revenue projections, and market research demonstrating legitimate need for the H-1B role.',
    priority: 'critical',
    category: 'Ability to Pay',
    categoryCn: '支付能力',
    triggers: ['founder'],
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Specialty Occupation': <ShieldCheck className="h-3.5 w-3.5" />,
  'Employer-Employee Relationship': <Building2 className="h-3.5 w-3.5" />,
  'Beneficiary Qualifications': <GraduationCap className="h-3.5 w-3.5" />,
  'Wage Level': <DollarSign className="h-3.5 w-3.5" />,
  'Work Availability': <MapPin className="h-3.5 w-3.5" />,
  'Maintenance of Status': <Clock className="h-3.5 w-3.5" />,
  'Ability to Pay': <FileText className="h-3.5 w-3.5" />,
};

function getRelevantChecklist(strategy: StrategyOption): ChecklistItem[] {
  const triggers = new Set<string>(['always']);

  if (strategy.type === 'strategic') triggers.add('strategic');
  if (strategy.type === 'aggressive') triggers.add('aggressive');
  if (strategy.socMatch.matchType === 'founder') triggers.add('founder');
  if (strategy.socMatch.matchType === 'course') triggers.add('course_match');
  if (strategy.socMatch.jobZone < 4) triggers.add('low_jobzone');

  // Wage level triggers
  const hasLowWage = strategy.wageLevels.some(w => w.level === 1 && w.amount);
  if (hasLowWage) triggers.add('low_wage');

  // Always include change-of-status items (common scenario)
  triggers.add('cos');

  // Small employer / founder triggers
  if (strategy.socMatch.matchType === 'founder') {
    triggers.add('small_employer');
  }

  return RFE_CHECKLIST.filter(item =>
    item.triggers.some(t => triggers.has(t))
  );
}

const priorityConfig = {
  critical: { color: 'bg-destructive/10 text-destructive border-destructive/30', label: 'Critical 必备', icon: <AlertTriangle className="h-3 w-3" /> },
  important: { color: 'bg-orange-500/10 text-orange-600 border-orange-500/30', label: 'Important 重要' },
  recommended: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', label: 'Recommended 建议' },
};

export function RFEChecklist({ strategies }: RFEChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggleCheck = (stratIdx: number, itemId: string) => {
    const key = `${stratIdx}-${itemId}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-accent" />
            RFE Risk Mitigation Checklist / RFE风险规避清单
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Based on 2025 USCIS RFE patterns · 基于2025年USCIS补件通知趋势整理
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">Critical 必备</Badge>
            <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-600 border-orange-500/30">Important 重要</Badge>
            <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/30">Recommended 建议</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {strategies.map((strategy, sIdx) => {
              const items = getRelevantChecklist(strategy);
              const checkedCount = items.filter(item => checked[`${sIdx}-${item.id}`]).length;

              // Group items by category
              const grouped = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push(item);
                return acc;
              }, {});

              return (
                <AccordionItem key={sIdx} value={`strategy-${sIdx}`}>
                  <AccordionTrigger className="text-sm hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{strategy.label}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{strategy.socMatch.socCode}</Badge>
                      <Badge variant={checkedCount === items.length ? 'default' : 'secondary'} className="text-[10px]">
                        {checkedCount}/{items.length} prepared
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-5 pt-2">
                      {Object.entries(grouped).map(([category, categoryItems]) => (
                        <div key={category}>
                          <div className="flex items-center gap-2 mb-2 pb-1 border-b border-border">
                            {CATEGORY_ICONS[category]}
                            <span className="text-xs font-semibold uppercase tracking-wide text-foreground">{category}</span>
                            <span className="text-xs text-muted-foreground">
                              / {categoryItems[0].categoryCn}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {categoryItems.map(item => {
                              const key = `${sIdx}-${item.id}`;
                              const cfg = priorityConfig[item.priority];
                              return (
                                <div
                                  key={item.id}
                                  className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                                    checked[key] ? "bg-primary/5 border-primary/20" : "bg-card"
                                  )}
                                >
                                  <Checkbox
                                    checked={!!checked[key]}
                                    onCheckedChange={() => toggleCheck(sIdx, item.id)}
                                    className="mt-0.5"
                                  />
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={cn("text-sm font-medium", checked[key] && "line-through text-muted-foreground")}>
                                        {item.label}
                                      </span>
                                      <Badge variant="outline" className={cn("text-[9px]", cfg.color)}>
                                        {cfg.label}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{item.labelCn}</p>
                                    <p className="text-xs text-muted-foreground/80 leading-relaxed">{item.description}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Summary guidance */}
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border space-y-1">
            <p className="text-xs font-semibold text-foreground">📋 RFE Response Tips / 补件回复要点：</p>
            <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
              <li>RFE is NOT a denial — respond thoroughly within 60-90 days · RFE不是拒签，在60-90天内充分回复</li>
              <li>Address every point raised, include a table of contents · 逐条回复，附目录标签方便审查官查阅</li>
              <li>Retain copies of all submitted materials · 保留所有提交材料副本</li>
              <li>FY2025 RFE approval rate: ~85.4% — well-prepared responses succeed · FY2025 RFE后批准率约85.4%</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
