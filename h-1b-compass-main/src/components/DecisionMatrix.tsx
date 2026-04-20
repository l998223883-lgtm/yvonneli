import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StrategyOption } from '@/types/h1b';

interface DecisionMatrixProps {
  strategies: StrategyOption[];
  degreeLevel: 'bachelor' | 'master' | 'doctorate' | 'professional';
}

const typeConfig = {
  conservative: { icon: Shield, color: 'bg-info/10 text-info border-info/30', label: 'Conservative / 保守型' },
  strategic: { icon: TrendingUp, color: 'bg-success/10 text-success border-success/30', label: 'Strategic / 战略型' },
  aggressive: { icon: AlertTriangle, color: 'bg-warning/10 text-warning border-warning/30', label: 'Aggressive / 激进型' },
};

export function DecisionMatrix({ strategies, degreeLevel }: DecisionMatrixProps) {
  if (!strategies.length) return null;

  const hasAdvancedDegree = degreeLevel === 'master' || degreeLevel === 'doctorate' || degreeLevel === 'professional';
  const degreeLabelMap = {
    bachelor: "Bachelor's 本科",
    master: "Master's 硕士",
    doctorate: "Doctorate 博士",
    professional: "Professional 专业学位",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl">
            Strategic Decision Matrix
            <span className="block text-sm font-body text-muted-foreground mt-1">战略决策矩阵</span>
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={hasAdvancedDegree ? 'default' : 'secondary'} className="text-xs">
              {degreeLabelMap[degreeLevel]}
            </Badge>
            {hasAdvancedDegree && (
              <Badge variant="outline" className="text-xs border-success/50 text-success">
                ✓ Dual Pool Eligible · 双池抽签资格
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2">
                  <TableHead className="font-semibold min-w-[160px]">Dimension / 维度</TableHead>
                  {strategies.map((s, i) => {
                    const cfg = typeConfig[s.type];
                    const Icon = cfg.icon;
                    return (
                      <TableHead key={i} className="min-w-[220px]">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1 rounded border", cfg.color)}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-semibold">{s.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground block mt-0.5">{cfg.label}</span>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">SOC Code / 岗位代码</TableCell>
                  {strategies.map((s, i) => (
                    <TableCell key={i}>
                      <span className="font-mono text-sm">{s.socMatch.socCode}</span>
                      <span className="block text-xs text-muted-foreground">{s.socMatch.title}</span>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Match Basis / 匹配依据</TableCell>
                  {strategies.map((s, i) => (
                    <TableCell key={i}>
                      <Badge variant={s.socMatch.matchType === 'degree' ? 'default' : 'secondary'} className="text-xs">
                        {s.socMatch.matchType === 'degree' ? 'Degree 专业' : s.socMatch.matchType === 'course' ? 'Coursework 课程' : 'Founder 创始人'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{s.socMatch.matchReason}</p>
                    </TableCell>
                  ))}
                </TableRow>

                {/* H-1B Approval Risk Factors (SOC-specific, does NOT affect lottery odds) */}
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={strategies.length + 1} className="font-semibold text-xs text-muted-foreground py-1.5">
                    ⚖️ H-1B Approval Risk Factors / 审批风险因素 <span className="font-normal">（不影响抽签概率）</span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Job Zone</TableCell>
                  {strategies.map((s, i) => (
                    <TableCell key={i}>
                      <span className={cn("font-semibold", s.socMatch.jobZone >= 4 ? "text-success" : "text-destructive")}>
                        Zone {s.socMatch.jobZone}
                      </span>
                      {s.socMatch.jobZone < 4 && (
                        <span className="text-xs text-destructive block">⚠ Below H-1B threshold</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Education Req / 学历要求</TableCell>
                  {strategies.map((s, i) => (
                    <TableCell key={i}>
                      <span className="text-sm">{s.socMatch.educationLevel}</span>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Lottery Selection Probability (based ONLY on wage level + client degree) */}
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={strategies.length + 1} className="font-semibold text-xs text-muted-foreground py-1.5">
                    🎰 Lottery Selection / 抽签概率 <span className="font-normal">（仅取决于工资等级 + 申请人最高学历）</span>
                  </TableCell>
                </TableRow>
                {[1, 2, 3, 4].map(level => (
                  <TableRow key={level} className={level === 2 ? "bg-success/5" : ""}>
                    <TableCell className="font-medium">
                      <div>Level {level} Wage</div>
                      <span className="block text-xs text-muted-foreground">
                        {level}x weight · {level}倍权重
                      </span>
                    </TableCell>
                    {strategies.map((s, i) => {
                      const wage = s.wageLevels.find(w => w.level === level);
                      return (
                        <TableCell key={i}>
                          {wage?.amount ? (
                            <span className="font-semibold font-mono">${wage.amount.toLocaleString()}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Est. pending</span>
                          )}
                          {wage && (
                            <div className="mt-1 space-y-0.5">
                              {wage.combinedProbability != null ? (
                                <>
                                  <span className={cn(
                                    "block text-xs font-semibold",
                                    wage.combinedProbability > 0.5 ? "text-success" :
                                    wage.combinedProbability > 0.3 ? "text-accent" : "text-destructive"
                                  )}>
                                    🎰 {(wage.combinedProbability * 100).toFixed(1)}% combined
                                  </span>
                                  <span className="block text-[10px] text-muted-foreground">
                                    Regular: {((wage.selectionProbability ?? 0) * 100).toFixed(1)}% + Advanced: {((wage.advancedPoolProbability ?? 0) * 100).toFixed(1)}%
                                  </span>
                                </>
                              ) : wage.selectionProbability != null ? (
                                <span className={cn(
                                  "block text-xs font-semibold",
                                  wage.selectionProbability > 0.4 ? "text-success" :
                                  wage.selectionProbability > 0.2 ? "text-accent" : "text-destructive"
                                )}>
                                  🎰 {(wage.selectionProbability * 100).toFixed(1)}% (regular pool only)
                                </span>
                              ) : null}
                              <span className="block text-[10px] text-muted-foreground">
                                RFE Risk: {wage.rfeRisk}
                              </span>
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}

                <TableRow>
                  <TableCell className="font-medium">Attorney Notes / 律师评估</TableCell>
                  {strategies.map((s, i) => (
                    <TableCell key={i}>
                      <p className="text-xs italic text-muted-foreground">{s.attorneyNotes}</p>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Lottery probability explanation */}
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>⚠️ Important / 重要说明:</strong>{' '}
              Selection probability depends <strong>ONLY</strong> on the <strong>offered wage level</strong> (4:3:2:1 weighting) and the <strong>applicant's highest degree</strong> (Master's+ = dual pool). 
              It does NOT depend on SOC code, Job Zone, or education requirements of the position.
              <span className="block mt-1">
                中签概率<strong>仅取决于</strong>：(1) 提供的工资等级（Level 1-4，权重1-4倍）；(2) 申请人本人的最高学历（硕士+可参加两轮抽签）。与SOC代码、Job Zone、岗位学历要求<strong>无关</strong>。
              </span>
              {hasAdvancedDegree ? (
                <span className="block mt-1">✅ This client holds a US advanced degree → enters <strong>both</strong> regular pool (65,000) and advanced degree pool (20,000). 该客户持有美国高级学位，参加两轮抽签。</span>
              ) : (
                <span className="block mt-1">This client enters regular pool only (65,000 spots). 该客户仅参加普通池抽签。</span>
              )}
              <span className="block mt-1 italic">Source: Federal Register 2025-23853. Estimates based on DHS projected beneficiary distribution.</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
