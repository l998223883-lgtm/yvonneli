import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingUp, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadOFLCWages, lookupWages, loadGeography, type WageRecord } from '@/lib/dataLoader';
import { calculateLotteryProbability } from '@/types/h1b';
import type { StrategyOption } from '@/types/h1b';

interface WageLevelOptimizerProps {
  strategies: StrategyOption[];
  degreeLevel: 'bachelor' | 'master' | 'doctorate' | 'professional';
}

interface StrategyWageData {
  strategy: StrategyOption;
  wageRecord: WageRecord | null;
  loading: boolean;
}

export function WageLevelOptimizer({ strategies, degreeLevel }: WageLevelOptimizerProps) {
  const [areaCode, setAreaCode] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [wages, setWages] = useState<WageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [salaryInput, setSalaryInput] = useState<number>(80000);

  const loadWageData = async () => {
    setLoading(true);
    try {
      const wageData = await loadOFLCWages();
      setWages(wageData);
      setLoaded(true);
    } catch (e) {
      console.error('Failed to load OFLC wage data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWageData();
  }, []);

  const strategyWages = useMemo(() => {
    if (!loaded) return strategies.map(s => ({ strategy: s, wageRecord: null, loading: true }));

    const code = areaCode || '99';
    return strategies.map(strategy => {
      const socCode = strategy.socMatch.socCode;
      const record = lookupWages(wages, socCode, code);
      return { strategy, wageRecord: record, loading: false };
    });
  }, [strategies, wages, loaded, areaCode]);

  const getWageLevel = (salary: number, record: WageRecord | null): number => {
    if (!record) return 2;
    if (record.level4 && salary >= record.level4) return 4;
    if (record.level3 && salary >= record.level3) return 3;
    if (record.level2 && salary >= record.level2) return 2;
    return 1;
  };

  const maxWage = useMemo(() => {
    const allL4 = strategyWages
      .filter(sw => sw.wageRecord?.level4)
      .map(sw => sw.wageRecord!.level4!);
    return allL4.length > 0 ? Math.max(...allL4) * 1.2 : 200000;
  }, [strategyWages]);

  const minWage = useMemo(() => {
    const allL1 = strategyWages
      .filter(sw => sw.wageRecord?.level1)
      .map(sw => sw.wageRecord!.level1!);
    return allL1.length > 0 ? Math.min(...allL1) * 0.8 : 40000;
  }, [strategyWages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent" />
            Salary Optimizer / 工资优化器
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            See how salary changes affect your lottery selection probability · 查看工资变化如何影响抽签概率
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Area input */}
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                <MapPin className="inline h-3 w-3 mr-1" />
                Area Code (OFLC)
              </Label>
              <Input
                placeholder="e.g. 35614"
                value={areaCode}
                onChange={e => setAreaCode(e.target.value.trim())}
                className="w-40 h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Offered Annual Salary</Label>
              <Input
                type="number"
                placeholder="80000"
                value={salaryInput}
                onChange={e => setSalaryInput(Number(e.target.value))}
                className="w-40 h-8 text-sm font-mono"
              />
            </div>
          </div>

          {/* Salary slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${Math.round(minWage).toLocaleString()}</span>
              <span className="font-semibold text-foreground text-sm">${salaryInput.toLocaleString()}</span>
              <span>${Math.round(maxWage).toLocaleString()}</span>
            </div>
            <Slider
              value={[salaryInput]}
              min={Math.round(minWage)}
              max={Math.round(maxWage)}
              step={1000}
              onValueChange={([v]) => setSalaryInput(v)}
            />
          </div>

          {loading && (
            <p className="text-sm text-muted-foreground animate-pulse">Loading OFLC wage data...</p>
          )}

          {/* Strategy wage cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {strategyWages.map((sw, idx) => {
              const record = sw.wageRecord;
              const currentLevel = getWageLevel(salaryInput, record);
              const prob = calculateLotteryProbability(currentLevel as 1|2|3|4, degreeLevel);

              return (
                <div
                  key={idx}
                  className="p-4 rounded-lg border bg-card space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">{sw.strategy.label}</span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {sw.strategy.socMatch.socCode}
                    </Badge>
                  </div>

                  {record ? (
                    <>
                      {/* Wage thresholds */}
                      <div className="space-y-1">
                        {([1, 2, 3, 4] as const).map(lvl => {
                          const threshold = record[`level${lvl}` as keyof WageRecord] as number | null;
                          const isActive = currentLevel === lvl;
                          const levelProb = calculateLotteryProbability(lvl, degreeLevel);
                          return (
                            <div
                              key={lvl}
                              className={cn(
                                "flex items-center justify-between text-xs px-2 py-1 rounded transition-colors",
                                isActive ? "bg-primary/10 border border-primary/30 font-semibold" : "text-muted-foreground"
                              )}
                            >
                              <span>L{lvl}: {threshold ? `$${threshold.toLocaleString()}` : 'N/A'}</span>
                              <span className={cn(
                                isActive ? "text-primary" : ""
                              )}>
                                {(levelProb.combinedProb * 100).toFixed(1)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Current selection */}
                      <div className="text-center pt-2 border-t">
                        <span className="text-xs text-muted-foreground">At ${salaryInput.toLocaleString()}</span>
                        <div className={cn(
                          "text-lg font-bold",
                          prob.combinedProb > 0.5 ? "text-success" :
                          prob.combinedProb > 0.3 ? "text-accent" : "text-destructive"
                        )}>
                          {(prob.combinedProb * 100).toFixed(1)}%
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Level {currentLevel} · {currentLevel}x weight
                        </span>

                        {/* Nudge to next level */}
                        {currentLevel < 4 && record[`level${(currentLevel + 1)}` as keyof WageRecord] && (
                          <div className="mt-2 p-2 rounded bg-success/10 border border-success/20">
                            <TrendingUp className="inline h-3 w-3 text-success mr-1" />
                            <span className="text-[10px] text-success">
                              +${((record[`level${(currentLevel + 1)}` as keyof WageRecord] as number) - salaryInput).toLocaleString()} → Level {currentLevel + 1}
                              {' '}({(calculateLotteryProbability((currentLevel + 1) as 1|2|3|4, degreeLevel).combinedProb * 100).toFixed(1)}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      {loaded ? 'No OFLC wage data found for this SOC/area combination. Try area code "99" for national.' : 'Loading...'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-muted-foreground italic">
            Source: OFLC Prevailing Wage Determinations FY2025-26. Probabilities per Federal Register 2025-23853.
            数据来源：OFLC现行工资标准FY2025-26，概率基于联邦公报2025-23853。
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
