import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RiskAlert } from '@/types/h1b';

interface RiskAlertsProps {
  alerts: RiskAlert[];
}

const severityConfig = {
  critical: { icon: AlertCircle, border: 'border-destructive/40', bg: 'bg-destructive/5', text: 'text-destructive', label: '严重' },
  warning: { icon: AlertTriangle, border: 'border-warning/40', bg: 'bg-warning/5', text: 'text-warning', label: '警告' },
  info: { icon: Info, border: 'border-info/40', bg: 'bg-info/5', text: 'text-info', label: '提示' },
};

export function RiskAlerts({ alerts }: RiskAlertsProps) {
  if (!alerts.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-semibold text-foreground">
        Risk Alerts <span className="text-muted-foreground text-sm font-body">风险提示</span>
      </h3>
      {alerts.map((alert, index) => {
        const cfg = severityConfig[alert.severity];
        const Icon = cfg.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn("p-4 rounded-lg border", cfg.border, cfg.bg)}
          >
            <div className="flex gap-3">
              <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", cfg.text)} />
              <div className="space-y-1">
                <p className={cn("text-sm font-semibold", cfg.text)}>
                  {alert.title} <span className="font-normal">({cfg.label})</span>
                </p>
                <p className="text-sm text-foreground">{alert.description}</p>
                <p className="text-xs text-muted-foreground italic">
                  Recommendation: {alert.recommendation}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
