import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Scale, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DecisionMatrix } from '@/components/DecisionMatrix';
import { RiskAlerts } from '@/components/RiskAlerts';
import { LegalCitations } from '@/components/LegalCitations';
import { WageLevelOptimizer } from '@/components/WageLevelOptimizer';
import { PartTimeCalculator } from '@/components/PartTimeCalculator';
import { RFEChecklist } from '@/components/RFEChecklist';
import { TimelineTracker } from '@/components/TimelineTracker';
import { DocumentGenerator } from '@/components/DocumentGenerator';
import { I129Builder } from '@/components/I129Builder';
import { FeeCalculator } from '@/components/FeeCalculator';
import { LCAAutoFill } from '@/components/LCAAutoFill';
import { CredentialEvaluation } from '@/components/CredentialEvaluation';
import { EmployerCompliance } from '@/components/EmployerCompliance';
import { StatusTracker } from '@/components/StatusTracker';
import type { StrategyReport, DocumentAnalysis } from '@/types/h1b';

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report as StrategyReport | undefined;
  const analysis = location.state?.analysis as DocumentAnalysis | undefined;

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md border shadow-sm">
          <CardContent className="p-8 text-center space-y-4">
            <Scale className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="font-display text-xl font-semibold">No Report Found</h2>
            <p className="text-sm text-muted-foreground">Please generate a strategy report first.</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Upload
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allCitations = report.strategies.flatMap(s => s.legalCitations);
  const uniqueCitations = [...new Set(allCitations)];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card print:border-b-0">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="print:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Strategy Report</h1>
              <p className="text-xs text-muted-foreground">
                Generated {new Date(report.generatedAt).toLocaleString()} · 战略评估报告
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.print()} className="print:hidden">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* FY2027 Timeline */}
        <TimelineTracker />

        {/* Client Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-accent" />
                Client Profile Summary
                <span className="text-sm font-body text-muted-foreground">客户概况</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Degree / 学位</p>
                  <p className="font-semibold text-foreground">{report.clientSummary.degree}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {report.clientSummary.degreeLevel === 'master' || report.clientSummary.degreeLevel === 'doctorate' || report.clientSummary.degreeLevel === 'professional'
                      ? '✓ Advanced Degree · 高学历(双池)'
                      : 'Bachelor · 本科(单池)'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Major / 专业</p>
                  <p className="font-semibold text-foreground">{report.clientSummary.major}</p>
                  {report.clientSummary.undergradMajor && (
                    <p className="text-xs text-muted-foreground">UG: {report.clientSummary.undergradMajor}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Experience / 经验</p>
                  <p className="font-semibold text-foreground">{report.clientSummary.workYears} years</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Lottery Pool / 抽签池</p>
                  <p className="font-semibold text-foreground">
                    {report.clientSummary.degreeLevel === 'master' || report.clientSummary.degreeLevel === 'doctorate' || report.clientSummary.degreeLevel === 'professional'
                      ? 'Regular + Advanced'
                      : 'Regular Only'}
                  </p>
                </div>
              </div>

              {report.clientSummary.topDomains.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Top Course Domains / 高频课程领域
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {report.clientSummary.topDomains.map((d, i) => (
                      <Badge
                        key={i}
                        variant={d.isAlternatePath ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {d.domain}: {d.percentage.toFixed(0)}%
                        {d.isAlternatePath && ' ★'}
                      </Badge>
                    ))}
                  </div>
                  {report.clientSummary.topDomains.some(d => d.isAlternatePath) && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      ★ = Alternate qualification path (&gt;15% coursework) · 替代资质路径
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Decision Matrix */}
        <DecisionMatrix strategies={report.strategies} degreeLevel={report.clientSummary.degreeLevel || 'master'} />

        {/* Wage Level Optimizer */}
        <WageLevelOptimizer strategies={report.strategies} degreeLevel={report.clientSummary.degreeLevel || 'master'} />

        {/* Part-Time Wage Calculator */}
        <PartTimeCalculator />

        {/* Fee Calculator */}
        <FeeCalculator />

        {/* LCA Auto-Fill */}
        <LCAAutoFill strategies={report.strategies} />

        {/* Credential Evaluation */}
        <CredentialEvaluation
          degreeLevel={report.clientSummary.degreeLevel}
          major={report.clientSummary.major}
        />

        {/* Employer Compliance Dashboard */}
        <EmployerCompliance strategies={report.strategies} />

        {/* Status & Extension Tracker */}
        <StatusTracker />

        {/* I-129 Petition Package Builder */}
        <I129Builder report={report} />

        {/* Document Template Generator */}
        <DocumentGenerator report={report} />

        {/* RFE Checklist */}
        <RFEChecklist strategies={report.strategies} />

        {/* Risk Alerts */}
        <RiskAlerts alerts={report.riskAlerts} />

        {/* Legal Citations */}
        <LegalCitations citations={uniqueCitations} />

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-lg bg-muted/50 border border-border"
        >
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            {report.legalDisclaimer}
          </p>
        </motion.div>
      </main>
    </div>
  );
}
