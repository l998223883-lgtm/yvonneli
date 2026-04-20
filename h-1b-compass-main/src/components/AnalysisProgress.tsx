import { motion } from 'framer-motion';
import { Check, Loader2, AlertCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisStep } from '@/types/h1b';

interface AnalysisProgressProps {
  steps: AnalysisStep[];
}

const statusConfig = {
  pending: { icon: Circle, color: 'text-muted-foreground', bg: 'bg-muted' },
  processing: { icon: Loader2, color: 'text-accent', bg: 'bg-accent/10' },
  completed: { icon: Check, color: 'text-success', bg: 'bg-success/10' },
  error: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

export function AnalysisProgress({ steps }: AnalysisProgressProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-foreground">
        Analysis Progress <span className="text-muted-foreground text-sm font-body">分析进度</span>
      </h3>
      <div className="space-y-3">
        {steps.map((step, index) => {
          const config = statusConfig[step.status];
          const Icon = config.icon;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all",
                step.status === 'processing' && "border-accent/30 bg-accent/5",
                step.status === 'completed' && "border-success/30 bg-success/5",
                step.status === 'error' && "border-destructive/30 bg-destructive/5",
                step.status === 'pending' && "border-border bg-card"
              )}
            >
              <div className={cn("mt-0.5 p-1 rounded-full", config.bg)}>
                <Icon className={cn("h-4 w-4", config.color, step.status === 'processing' && "animate-spin")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.labelCn}</p>
                {step.detail && (
                  <p className="text-xs text-muted-foreground mt-1">{step.detail}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
