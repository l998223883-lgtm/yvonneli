import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

const FULL_TIME_HOURS = 40;
const WEEKS_PER_YEAR = 52;

export function PartTimeCalculator() {
  const [annualWage, setAnnualWage] = useState<number>(60000);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(20);

  const hourlyRate = annualWage / (FULL_TIME_HOURS * WEEKS_PER_YEAR);
  const partTimeAnnual = hourlyRate * hoursPerWeek * WEEKS_PER_YEAR;
  const isPartTime = hoursPerWeek < 35;
  const isRecommended = hoursPerWeek >= 20;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Part-Time Wage Calculator
            <span className="text-sm font-body text-muted-foreground">兼职工资计算器</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Annual Wage Input */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Full-Time Annual Wage / 全职年薪
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={annualWage}
                  onChange={e => setAnnualWage(Math.max(0, Number(e.target.value)))}
                  className="pl-9 font-mono"
                  min={0}
                  step={1000}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Based on {FULL_TIME_HOURS}h/week · 基于每周{FULL_TIME_HOURS}小时
              </p>
            </div>

            <div className="space-y-1 rounded-lg bg-muted/50 p-4 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Hourly Rate / 时薪</p>
              <p className="text-2xl font-bold font-mono text-foreground">
                ${hourlyRate.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground ml-1">/hr</span>
              </p>
              <p className="text-xs text-muted-foreground">
                = ${annualWage.toLocaleString()} ÷ ({FULL_TIME_HOURS}h × {WEEKS_PER_YEAR} weeks)
              </p>
            </div>
          </div>

          {/* Hours Per Week Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Work Hours Per Week / 每周工作时数
              </Label>
              <span className="font-mono text-lg font-bold text-foreground">{hoursPerWeek}h</span>
            </div>
            <Slider
              value={[hoursPerWeek]}
              onValueChange={v => setHoursPerWeek(v[0])}
              min={1}
              max={40}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1h</span>
              <span className="text-primary font-medium">20h (推荐最低)</span>
              <span>35h (Part-Time上限)</span>
              <span>40h</span>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {isPartTime ? (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                Part-Time · 兼职
              </Badge>
            ) : (
              <Badge variant="default" className="gap-1">
                <Clock className="h-3 w-3" />
                Full-Time · 全职
              </Badge>
            )}
            {isRecommended ? (
              <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="h-3 w-3" />
                Recommended 20h+ · 建议20小时以上
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Below 20h — may raise scrutiny · 低于20小时可能引起审查
              </Badge>
            )}
          </div>

          {/* Result */}
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Part-Time Annual Wage / 兼职年薪
            </p>
            <p className="text-3xl font-bold font-mono text-foreground">
              ${partTimeAnnual.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              = ${hourlyRate.toFixed(2)}/hr × {hoursPerWeek}h/week × {WEEKS_PER_YEAR} weeks
            </p>
          </div>

          {/* Guidance */}
          <div className="text-xs text-muted-foreground leading-relaxed space-y-1 border-t border-border pt-4">
            <p><strong>Part-Time Definition 兼职定义:</strong> &lt;35 hours/week per DOL standards.</p>
            <p><strong>Recommendation 建议:</strong> 20–34 hours/week is the typical part-time H-1B range. Below 20h may attract additional scrutiny from USCIS.</p>
            <p><strong>Wage Compliance 工资合规:</strong> The prorated wage must still meet or exceed the prevailing wage for the SOC code at the applicable wage level.</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
