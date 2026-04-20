import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ChevronDown, Info, Building2, Users, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface FeeItem {
  label: string;
  labelCn: string;
  amount: number;
  note?: string;
  applies: boolean;
  citation: string;
}

export function FeeCalculator() {
  const [isOpen, setIsOpen] = useState(true);
  const [employeeCount, setEmployeeCount] = useState<string>('large'); // 'small' (<25), 'medium' (25-50), 'large' (>50)
  const [isNonprofit, setIsNonprofit] = useState(false);
  const [isCapExempt, setIsCapExempt] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isHDependent, setIsHDependent] = useState(false);
  const [filingType, setFilingType] = useState<string>('initial'); // 'initial', 'extension', 'amendment'

  const isSmall = employeeCount === 'small';

  const fees: FeeItem[] = [
    {
      label: 'I-129 Base Filing Fee',
      labelCn: 'I-129 基础申请费',
      amount: filingType === 'initial' ? 780 : 780,
      applies: true,
      citation: '8 CFR § 106.2',
    },
    {
      label: 'ACWIA Training Fee',
      labelCn: 'ACWIA 培训费',
      amount: isSmall ? 750 : 1500,
      note: isSmall ? '< 25 employees' : '≥ 25 employees',
      applies: !isNonprofit || !isCapExempt, // nonprofits exempt only if cap-exempt
      citation: 'INA § 214(c)(9)',
    },
    {
      label: 'Fraud Prevention & Detection Fee',
      labelCn: '反欺诈检测费',
      amount: 500,
      applies: filingType === 'initial',
      citation: 'INA § 214(c)(12)',
    },
    {
      label: 'Asylum Program Fee',
      labelCn: '庇护项目费',
      amount: isSmall ? 300 : 600,
      note: isSmall ? 'Small employer rate' : 'Standard rate',
      applies: !isNonprofit,
      citation: 'Public Law 117-328 § 5301',
    },
    {
      label: 'H-1B Registration Fee (FY2027)',
      labelCn: 'H-1B 注册费 (FY2027)',
      amount: 215,
      applies: filingType === 'initial' && !isCapExempt,
      citation: '8 CFR § 214.2(h)(8)(iii)',
    },
    {
      label: 'Premium Processing Fee',
      labelCn: '加急处理费',
      amount: 2805,
      applies: isPremium,
      citation: '8 CFR § 106.4',
    },
    {
      label: 'Public Law 114-113 Fee (H-1B Dependent)',
      labelCn: 'PL 114-113 费 (H-1B 依赖型雇主)',
      amount: 4000,
      note: '≥ 50 employees & > 50% H-1B/L-1',
      applies: isHDependent && filingType === 'initial',
      citation: 'Public Law 114-113 § 411',
    },
  ];

  const applicableFees = fees.filter(f => f.applies);
  const totalFee = applicableFees.reduce((sum, f) => sum + f.amount, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border shadow-sm">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                H-1B Fee Calculator
                <span className="text-sm font-body text-muted-foreground">费用计算器</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Controls */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Filing Type / 申请类型</Label>
                  <Select value={filingType} onValueChange={setFilingType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initial">Initial Petition 初始申请</SelectItem>
                      <SelectItem value="extension">Extension 延期</SelectItem>
                      <SelectItem value="amendment">Amendment 修改</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1">
                    <Users className="h-3 w-3" /> Employer Size / 公司规模
                  </Label>
                  <Select value={employeeCount} onValueChange={setEmployeeCount}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (&lt; 25 employees)</SelectItem>
                      <SelectItem value="medium">Medium (25-50 employees)</SelectItem>
                      <SelectItem value="large">Large (&gt; 50 employees)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="flex items-center gap-2">
                    <Switch id="nonprofit" checked={isNonprofit} onCheckedChange={setIsNonprofit} />
                    <Label htmlFor="nonprofit" className="text-sm">Nonprofit / 非营利</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="capExempt" checked={isCapExempt} onCheckedChange={setIsCapExempt} />
                    <Label htmlFor="capExempt" className="text-sm">Cap-Exempt / 免抽签</Label>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="premium" checked={isPremium} onCheckedChange={setIsPremium} />
                  <Label htmlFor="premium" className="text-sm">Premium Processing / 加急</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="hDependent" checked={isHDependent} onCheckedChange={setIsHDependent} />
                  <Label htmlFor="hDependent" className="text-sm flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    H-1B Dependent / H-1B 依赖型
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Fee Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                  <Shield className="h-4 w-4 text-primary" />
                  Fee Breakdown / 费用明细
                </h4>

                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-medium text-foreground">Fee Item / 费用项目</th>
                        <th className="text-right p-3 font-medium text-foreground">Amount / 金额</th>
                        <th className="text-right p-3 font-medium text-foreground hidden sm:table-cell">Citation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.map((fee, i) => (
                        <tr
                          key={i}
                          className={`border-t ${fee.applies ? '' : 'opacity-30 line-through'}`}
                        >
                          <td className="p-3">
                            <div className="font-medium text-foreground">{fee.label}</div>
                            <div className="text-xs text-muted-foreground">{fee.labelCn}</div>
                            {fee.note && (
                              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <Info className="h-3 w-3" /> {fee.note}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono text-foreground">
                            ${fee.amount.toLocaleString()}
                          </td>
                          <td className="p-3 text-right text-xs text-muted-foreground hidden sm:table-cell">
                            {fee.citation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-primary/30 bg-primary/5">
                        <td className="p-3 font-bold text-foreground">
                          Total / 总计
                          <div className="text-xs font-normal text-muted-foreground">
                            {applicableFees.length} applicable fees
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-lg text-primary">
                          ${totalFee.toLocaleString()}
                        </td>
                        <td className="p-3 hidden sm:table-cell" />
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Notes */}
                <div className="p-3 rounded-md bg-muted/50 border border-border space-y-1">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> Attorney fees are not included. Typical attorney fees range from $2,000–$5,000 for standard cases. The employer must pay all filing fees per DOL regulations — fees cannot be passed to the beneficiary.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>注意:</strong> 律师费未包含在内。标准案件律师费通常为 $2,000–$5,000。根据 DOL 规定，所有申请费用须由雇主支付，不得转嫁给受益人。
                  </p>
                  {isCapExempt && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      Cap-exempt employers: Higher education, nonprofits affiliated with higher education, or government research organizations
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
}
