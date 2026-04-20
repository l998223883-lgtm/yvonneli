import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronDown, CheckCircle, Circle, AlertTriangle, FileText, Users, DollarSign, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { StrategyOption } from '@/types/h1b';

interface EmployerComplianceProps {
  strategies: StrategyOption[];
}

interface PAFItem {
  id: string;
  label: string;
  labelCn: string;
  description: string;
  required: boolean;
  citation: string;
}

const PAF_CHECKLIST: PAFItem[] = [
  { id: 'lca_copy', label: 'Certified LCA (Form ETA-9035/9035E)', labelCn: '经认证的 LCA 表格', description: 'Original certified LCA from DOL FLAG system', required: true, citation: '20 CFR § 655.760(a)(1)' },
  { id: 'wage_rate', label: 'Documentation of Wage Rate Paid', labelCn: '支付工资率文件', description: 'Pay stubs, payroll records, or offer letter showing actual wage meets or exceeds prevailing wage', required: true, citation: '20 CFR § 655.731(a)' },
  { id: 'prevailing_wage', label: 'Prevailing Wage Determination', labelCn: '现行工资标准', description: 'OFLC prevailing wage determination or other documentation of prevailing wage source', required: true, citation: '20 CFR § 655.731(a)(2)' },
  { id: 'actual_wage', label: 'Actual Wage System Documentation', labelCn: '实际工资体系文件', description: 'Explanation of how actual wage is determined — pay scale, merit system, collective bargaining agreement', required: true, citation: '20 CFR § 655.731(a)(1)' },
  { id: 'working_conditions', label: 'Working Conditions Documentation', labelCn: '工作条件文件', description: 'Evidence H-1B workers have same working conditions as similarly employed U.S. workers', required: true, citation: '20 CFR § 655.732' },
  { id: 'posting_notice', label: 'LCA Posting Notice (with dates)', labelCn: 'LCA 公示通知（含日期）', description: 'Copy of posting notice with posting and removal dates. Must be posted 10 consecutive business days', required: true, citation: '20 CFR § 655.734(a)(1)' },
  { id: 'benefit_summary', label: 'Summary of Benefits Offered', labelCn: '福利摘要', description: 'Benefits documentation showing H-1B workers receive same benefits as U.S. workers in similar positions', required: true, citation: '20 CFR § 655.731(c)(3)' },
  { id: 'no_strike', label: 'No Strike/Lockout Attestation', labelCn: '无罢工/停工证明', description: 'Statement that there is no strike or lockout at the worksite', required: true, citation: '20 CFR § 655.733' },
  { id: 'h1b_dependent', label: 'H-1B Dependency Determination', labelCn: 'H-1B 依赖型判定', description: 'Calculation showing whether employer is H-1B dependent (>15% of workforce on H-1B)', required: true, citation: 'INA § 212(n)(3)' },
  { id: 'displacement', label: 'Non-Displacement Documentation (if H-1B dependent)', labelCn: '非替代文件（如为 H-1B 依赖型）', description: 'For H-1B dependent employers: attestation and evidence of no displacement of U.S. workers', required: false, citation: 'INA § 212(n)(1)(E)' },
  { id: 'recruitment', label: 'Recruitment Attestation (if H-1B dependent)', labelCn: '招聘证明（如为 H-1B 依赖型）', description: 'For H-1B dependent employers: good faith recruitment steps taken before and after filing', required: false, citation: 'INA § 212(n)(1)(G)' },
];

const H1B_DEPENDENT_THRESHOLDS = [
  { employees: '1-25', threshold: '8+', percentage: '~32%+' },
  { employees: '26-50', threshold: '13+', percentage: '~26%+' },
  { employees: '51+', threshold: '15%+', percentage: '15%+' },
];

export function EmployerCompliance({ strategies }: EmployerComplianceProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isHDependent, setIsHDependent] = useState(false);

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalItems = PAF_CHECKLIST.filter(i => i.required || (isHDependent && !i.required)).length;
  const completedItems = PAF_CHECKLIST.filter(i => (i.required || (isHDependent && !i.required)) && checkedItems[i.id]).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border shadow-sm">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Employer Compliance Dashboard
                <span className="text-sm font-body text-muted-foreground">雇主合规管理</span>
                <Badge variant="outline" className="ml-2 text-xs font-mono">{completedItems}/{totalItems}</Badge>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Compliance Progress / 合规进度</span>
                  <span className="font-mono text-foreground">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", progress === 100 ? "bg-[hsl(var(--success))]" : "bg-primary")}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* H-1B Dependent toggle */}
              <div className="p-3 rounded-md bg-muted/50 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch id="h1bDepComp" checked={isHDependent} onCheckedChange={setIsHDependent} />
                    <Label htmlFor="h1bDepComp" className="text-sm font-medium">
                      H-1B Dependent Employer / H-1B 依赖型雇主
                    </Label>
                  </div>
                  <Badge variant={isHDependent ? 'destructive' : 'secondary'} className="text-xs">
                    {isHDependent ? 'Yes — Additional Requirements' : 'No'}
                  </Badge>
                </div>

                {isHDependent && (
                  <div className="mt-3 p-2 rounded bg-destructive/5 border border-destructive/20">
                    <p className="text-xs text-muted-foreground mb-2">
                      <AlertTriangle className="h-3 w-3 inline mr-1 text-destructive" />
                      H-1B dependent employers must provide additional displacement and recruitment attestations.
                    </p>
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="text-left p-1">Employees</th>
                          <th className="text-left p-1">H-1B Threshold</th>
                          <th className="text-left p-1">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {H1B_DEPENDENT_THRESHOLDS.map((t, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="p-1 text-foreground">{t.employees}</td>
                            <td className="p-1 font-mono text-foreground">{t.threshold}</td>
                            <td className="p-1 font-mono text-foreground">{t.percentage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <Separator />

              {/* PAF Checklist */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                  <ClipboardList className="h-4 w-4 text-accent" />
                  Public Access File (PAF) Checklist / 公共查阅档案清单
                </h4>
                <p className="text-xs text-muted-foreground">
                  Per 20 CFR § 655.760, employers must maintain a Public Access File available for inspection within one working day of filing the LCA.
                  根据 20 CFR § 655.760，雇主须在提交 LCA 后一个工作日内建立可供查阅的公共档案。
                </p>

                <div className="space-y-2">
                  {PAF_CHECKLIST.filter(item => item.required || isHDependent).map(item => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                        checkedItems[item.id] ? "bg-primary/5 border-primary/20" : "bg-card border-border hover:bg-muted/30"
                      )}
                    >
                      <Checkbox
                        id={item.id}
                        checked={!!checkedItems[item.id]}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <label htmlFor={item.id} className="text-sm font-medium text-foreground cursor-pointer">
                          {item.label}
                        </label>
                        <p className="text-xs text-muted-foreground">{item.labelCn}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        <Badge variant="outline" className="text-[10px] mt-1">{item.citation}</Badge>
                      </div>
                      {!item.required && (
                        <Badge variant="destructive" className="text-[10px] shrink-0">H-1B Dep.</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Wage attestation */}
              <Separator />
              <div className="p-3 rounded-md bg-muted/50 border border-border space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-accent" />
                  Wage Attestation Quick Check / 工资证明快速检查
                </h4>
                {strategies.map((s, i) => {
                  const lvl1 = s.wageLevels.find(w => w.level === 1);
                  return (
                    <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                      <span className="text-muted-foreground">{s.socMatch.socCode} — {s.socMatch.title}</span>
                      <span className="font-mono text-foreground">
                        Prevailing Wage L1: {lvl1?.amount ? `$${lvl1.amount.toLocaleString()}/yr` : 'N/A'}
                      </span>
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground italic">
                  The offered wage must meet or exceed the <strong>higher</strong> of the actual wage or prevailing wage. 20 CFR § 655.731(a).
                  提供的工资须不低于实际工资或现行工资中的较高者。
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
}
