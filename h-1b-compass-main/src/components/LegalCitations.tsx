import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LegalCitationsProps {
  citations: string[];
}

export function LegalCitations({ citations }: LegalCitationsProps) {
  if (!citations.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Scale className="h-5 w-5 text-accent" />
            Legal Citations
            <span className="text-sm font-body text-muted-foreground">法律引用</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {citations.map((citation, i) => (
              <li key={i} className="text-sm text-muted-foreground pl-4 border-l-2 border-accent/30 italic">
                {citation}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
