import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const FY2027_MILESTONES = [
  {
    date: '2026-03-01',
    label: 'Registration Opens',
    labelCn: '注册开放',
    description: 'USCIS begins accepting H-1B registrations for FY2027',
  },
  {
    date: '2026-03-21',
    label: 'Registration Closes',
    labelCn: '注册截止',
    description: 'Last day to submit H-1B registrations',
  },
  {
    date: '2026-03-31',
    label: 'Lottery Results',
    labelCn: '抽签结果',
    description: 'USCIS notifies selected registrants',
  },
  {
    date: '2026-04-01',
    label: 'Filing Window Opens',
    labelCn: '递件窗口开放',
    description: 'Selected registrants can begin filing H-1B petitions',
  },
  {
    date: '2026-06-30',
    label: 'Filing Deadline',
    labelCn: '递件截止',
    description: '90-day filing window closes',
  },
  {
    date: '2026-10-01',
    label: 'Visa Effective',
    labelCn: '签证生效',
    description: 'Approved H-1B status begins (FY2027 start)',
  },
];

export function TimelineTracker() {
  const now = new Date();
  const currentDateStr = now.toISOString().slice(0, 10);

  // Find which milestone is current/next
  const currentIdx = FY2027_MILESTONES.findIndex(m => m.date >= currentDateStr);
  const activeIdx = currentIdx === -1 ? FY2027_MILESTONES.length : currentIdx;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            FY2027 H-1B Timeline / 时间线
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div
              className="absolute left-4 top-0 w-px bg-primary transition-all"
              style={{ height: `${Math.min((activeIdx / FY2027_MILESTONES.length) * 100, 100)}%` }}
            />

            <div className="space-y-4">
              {FY2027_MILESTONES.map((milestone, idx) => {
                const isPast = idx < activeIdx;
                const isCurrent = idx === activeIdx;
                const date = new Date(milestone.date + 'T00:00:00');
                const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={idx} className="relative pl-10 flex items-start gap-3">
                    {/* Dot */}
                    <div className={cn(
                      "absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 transition-colors",
                      isPast ? "bg-primary border-primary" :
                      isCurrent ? "bg-accent border-accent animate-pulse" :
                      "bg-background border-muted-foreground/30"
                    )} />

                    <div className="flex-1 flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-semibold",
                            isPast ? "text-muted-foreground" : "text-foreground"
                          )}>
                            {milestone.label}
                          </span>
                          {isPast && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                          {isCurrent && (
                            <Badge variant="default" className="text-[9px] px-1.5 py-0">
                              {daysUntil <= 0 ? 'TODAY' : `${daysUntil}d`}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{milestone.labelCn}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{milestone.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={cn(
                          "text-xs font-mono",
                          isPast ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {!isPast && daysUntil > 0 && (
                          <span className="block text-[10px] text-muted-foreground">
                            <Clock className="inline h-2.5 w-2.5 mr-0.5" />
                            {daysUntil}d away
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
