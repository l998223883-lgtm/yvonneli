import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronDown, AlertTriangle, CheckCircle, ArrowRight, Calendar, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'f1_opt', label: 'F-1 OPT', description: 'Optional Practical Training' },
  { value: 'f1_stem', label: 'F-1 STEM OPT', description: 'STEM OPT Extension' },
  { value: 'f1_student', label: 'F-1 Student', description: 'Active student status' },
  { value: 'h1b', label: 'H-1B', description: 'Current H-1B holder' },
  { value: 'h4', label: 'H-4', description: 'H-1B dependent' },
  { value: 'l1', label: 'L-1', description: 'Intracompany Transferee' },
  { value: 'j1', label: 'J-1', description: 'Exchange Visitor' },
  { value: 'o1', label: 'O-1', description: 'Extraordinary Ability' },
  { value: 'b1b2', label: 'B-1/B-2', description: 'Visitor' },
  { value: 'outside', label: 'Outside US', description: 'Consular Processing' },
];

function daysBetween(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export function StatusTracker() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('');
  const [statusExpiry, setStatusExpiry] = useState('');
  const [h1bStartDate, setH1bStartDate] = useState('2026-10-01'); // default FY2027 start
  const [firstH1bApproval, setFirstH1bApproval] = useState('');
  const [priorH1bYears, setPriorH1bYears] = useState('0');

  const today = new Date();
  const expiryDate = statusExpiry ? new Date(statusExpiry) : null;
  const h1bStart = h1bStartDate ? new Date(h1bStartDate) : null;
  const daysUntilExpiry = expiryDate ? daysBetween(today, expiryDate) : null;
  const firstApproval = firstH1bApproval ? new Date(firstH1bApproval) : null;
  const priorYears = parseInt(priorH1bYears) || 0;

  // Cap-gap calculation
  const isCapGapEligible = ['f1_opt', 'f1_stem'].includes(currentStatus);
  const capGapEnd = new Date('2026-09-30'); // end of cap-gap for FY2027
  const hasCapGap = isCapGapEligible && expiryDate && h1bStart && expiryDate < h1bStart;

  // 6-year limit
  const sixYearLimit = firstApproval ? addYears(firstApproval, 6) : null;
  const remainingH1bYears = sixYearLimit ? Math.max(0, daysBetween(today, sixYearLimit) / 365) : 6 - priorYears;

  // COS vs Consular
  const needsConsular = currentStatus === 'outside' || currentStatus === 'b1b2';
  const canCOS = !needsConsular && currentStatus !== '';

  const alerts: { type: 'warning' | 'info' | 'critical'; message: string; messageCn: string }[] = [];

  if (daysUntilExpiry !== null && daysUntilExpiry < 0) {
    alerts.push({ type: 'critical', message: `Current status expired ${Math.abs(daysUntilExpiry)} days ago!`, messageCn: '当前身份已过期！' });
  } else if (daysUntilExpiry !== null && daysUntilExpiry < 60) {
    alerts.push({ type: 'warning', message: `Status expires in ${daysUntilExpiry} days — file immediately`, messageCn: `身份将在 ${daysUntilExpiry} 天后过期` });
  }

  if (hasCapGap) {
    alerts.push({ type: 'info', message: `Cap-gap extension applies: OPT/STEM OPT auto-extends through ${capGapEnd.toLocaleDateString()} if H-1B petition is timely filed`, messageCn: 'Cap-gap 延期适用：如及时提交 H-1B 申请，OPT 将自动延期' });
  }

  if (remainingH1bYears <= 1 && currentStatus === 'h1b') {
    alerts.push({ type: 'warning', message: `Only ~${remainingH1bYears.toFixed(1)} years remaining on 6-year H-1B limit. Consider I-140 filing for AC21 exemption.`, messageCn: '6年 H-1B 期限即将到期，考虑提交 I-140 以获得 AC21 豁免' });
  }

  if (currentStatus === 'j1') {
    alerts.push({ type: 'critical', message: 'J-1 holders may be subject to the 2-year home residency requirement (INA § 212(e)). Confirm waiver status before filing H-1B.', messageCn: 'J-1 持有人可能需满足两年回国居住要求，请确认豁免状态' });
  }

  if (needsConsular) {
    alerts.push({ type: 'info', message: 'Consular processing required. Beneficiary must attend a visa interview at a U.S. consulate/embassy abroad.', messageCn: '需要领事处理。受益人须在美国驻外使领馆进行签证面谈' });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border shadow-sm">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                Status & Extension Tracker
                <span className="text-sm font-body text-muted-foreground">身份状态追踪器</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Input fields */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm">Current Status / 当前身份</Label>
                  <Select value={currentStatus} onValueChange={setCurrentStatus}>
                    <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label} — {s.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">Status Expiry Date / 身份到期日</Label>
                  <Input type="date" value={statusExpiry} onChange={e => setStatusExpiry(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">H-1B Start Date / H-1B 起始日</Label>
                  <Input type="date" value={h1bStartDate} onChange={e => setH1bStartDate(e.target.value)} />
                </div>

                {currentStatus === 'h1b' && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-sm">First H-1B Approval / 首次 H-1B 批准日</Label>
                      <Input type="date" value={firstH1bApproval} onChange={e => setFirstH1bApproval(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Prior H-1B Years Used / 已使用 H-1B 年数</Label>
                      <Select value={priorH1bYears} onValueChange={setPriorH1bYears}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[0,1,2,3,4,5,6].map(n => (
                            <SelectItem key={n} value={String(n)}>{n} years</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              {/* Alerts */}
              {alerts.length > 0 && (
                <div className="space-y-2">
                  {alerts.map((alert, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-3 rounded-md border flex items-start gap-2",
                        alert.type === 'critical' && "bg-destructive/10 border-destructive/30",
                        alert.type === 'warning' && "bg-orange-500/10 border-orange-500/30",
                        alert.type === 'info' && "bg-primary/5 border-primary/20",
                      )}
                    >
                      {alert.type === 'critical' ? <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" /> :
                       alert.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" /> :
                       <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />}
                      <div>
                        <p className="text-sm text-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.messageCn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* Status Summary */}
              {currentStatus && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg border bg-card">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Processing Route</p>
                    <p className="font-semibold text-foreground mt-1">
                      {canCOS ? 'Change of Status (COS)' : needsConsular ? 'Consular Processing' : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {canCOS ? '境内转换身份' : needsConsular ? '领事处理' : ''}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border bg-card">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Cap-Gap Eligible</p>
                    <p className="font-semibold text-foreground mt-1 flex items-center gap-1">
                      {isCapGapEligible ? <><CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" /> Yes</> : 'No'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isCapGapEligible ? 'OPT 自动延期适用' : '不适用 Cap-Gap'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border bg-card">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Days Until Expiry</p>
                    <p className={cn(
                      "font-mono font-semibold text-lg mt-1",
                      daysUntilExpiry !== null && daysUntilExpiry < 60 ? "text-destructive" : "text-foreground"
                    )}>
                      {daysUntilExpiry !== null ? daysUntilExpiry : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">距身份到期</p>
                  </div>

                  <div className="p-3 rounded-lg border bg-card">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">H-1B Years Remaining</p>
                    <p className={cn(
                      "font-mono font-semibold text-lg mt-1",
                      remainingH1bYears <= 1 ? "text-destructive" : "text-foreground"
                    )}>
                      {remainingH1bYears.toFixed(1)} yrs
                    </p>
                    <p className="text-xs text-muted-foreground">剩余 H-1B 年限</p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {currentStatus && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-primary" />
                      Status Transition Timeline / 身份转换时间线
                    </h4>

                    <div className="flex items-center gap-2 overflow-x-auto py-2">
                      <div className="shrink-0 p-2 rounded-lg border bg-muted/50 text-center min-w-[120px]">
                        <p className="text-[10px] text-muted-foreground uppercase">Current</p>
                        <p className="text-sm font-semibold text-foreground">
                          {STATUS_OPTIONS.find(s => s.value === currentStatus)?.label}
                        </p>
                        {expiryDate && (
                          <p className="text-[10px] text-muted-foreground">
                            Exp: {expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                      {hasCapGap && (
                        <>
                          <div className="shrink-0 p-2 rounded-lg border border-primary/30 bg-primary/5 text-center min-w-[120px]">
                            <p className="text-[10px] text-primary uppercase">Cap-Gap</p>
                            <p className="text-sm font-semibold text-foreground">Auto-Extended</p>
                            <p className="text-[10px] text-muted-foreground">
                              Through Sep 30, 2026
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </>
                      )}

                      <div className="shrink-0 p-2 rounded-lg border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5 text-center min-w-[120px]">
                        <p className="text-[10px] text-[hsl(var(--success))] uppercase">Target</p>
                        <p className="text-sm font-semibold text-foreground">H-1B</p>
                        {h1bStart && (
                          <p className="text-[10px] text-muted-foreground">
                            Start: {h1bStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </div>

                      {sixYearLimit && (
                        <>
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="shrink-0 p-2 rounded-lg border border-destructive/30 bg-destructive/5 text-center min-w-[120px]">
                            <p className="text-[10px] text-destructive uppercase">6-Year Limit</p>
                            <p className="text-sm font-semibold text-foreground">Max Stay</p>
                            <p className="text-[10px] text-muted-foreground">
                              {sixYearLimit.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground italic">
                      AC21 §106(a): H-1B status may extend beyond 6 years if I-140 is approved and I-485 has been pending &gt;365 days, or if PERM/I-140 filed &gt;365 days before 6-year expiry.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
}
