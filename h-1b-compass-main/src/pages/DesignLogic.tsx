import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Scale, BarChart3, FileText, Shield, Layers, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function DesignLogic() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
              Design & Product Logic
            </h1>
            <p className="text-sm text-muted-foreground">
              How and why this tool works — explained for everyone
            </p>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* TL;DR */}
        <motion.div {...fadeUp}>
          <Card className="border-2 border-accent/30 bg-accent/5">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" /> TL;DR — What This Tool Does
              </h2>
              <p className="text-sm text-foreground leading-relaxed">
                This is a <strong>"Lawyer-in-a-Box"</strong> for H-1B visa strategy. It takes a person's
                resume and transcripts, figures out which government job codes they qualify for,
                calculates the best wage level to maximize their lottery odds under the{' '}
                <strong>2026 weighted lottery rules</strong>, and generates a full strategy report
                an immigration attorney would normally charge $2,000–$5,000 to produce.
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                No legal knowledge required to use it. Upload documents → get a strategic plan.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* The Problem */}
        <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" /> The Problem We Solve
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground leading-relaxed">
              <p>
                The H-1B visa is the main way skilled workers (engineers, designers, analysts) work
                legally in the United States. Every year ~300,000+ people apply for only ~85,000 spots
                through a <strong>lottery</strong>.
              </p>
              <p>
                Starting in <strong>FY2026</strong>, the U.S. government changed the lottery from
                pure luck to a <strong>wage-weighted</strong> system: the higher your wage level
                (1–4), the more "entries" you get. Level 4 gets <strong>4× the odds</strong> of Level 1.
              </p>
              <p>
                But here's the catch: your wage level depends on which <strong>SOC code</strong>
                (Standard Occupational Classification — basically the government's job category) is
                used on the application. A software engineer can often be filed under 3–5 different
                codes, each with different wage requirements. Choosing the right one is the difference
                between a 10% lottery chance and a 60%+ chance.
              </p>
              <p className="font-medium text-accent-foreground bg-accent/10 p-3 rounded-md">
                This tool automates that strategic analysis — something that previously required an
                experienced immigration attorney, deep knowledge of DOL databases, and hours of research.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* How It Works */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-5 w-5 text-primary" /> How It Works — Step by Step
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    step: '1',
                    icon: <FileText className="h-5 w-5" />,
                    title: 'Document Upload & AI Extraction',
                    desc: 'You upload a resume and transcripts (or enter info manually). Our AI reads them and extracts: degree type, major, courses taken, work experience, and technical skills.',
                    detail: 'We use large language models to parse unstructured documents. The AI identifies course names from transcripts and categorizes them into domains (e.g., "Machine Learning" → Computer Science, "Financial Accounting" → Business/Finance). This creates a "domain frequency" profile of your education.',
                  },
                  {
                    step: '2',
                    icon: <Brain className="h-5 w-5" />,
                    title: 'SOC Code Matching',
                    desc: 'The system matches your profile against the U.S. Department of Labor\'s O*NET database of 800+ occupations to find which job codes you legally qualify for.',
                    detail: 'We cross-reference your major, course domains, and skills against O*NET\'s education requirements, knowledge areas, and alternate titles. For example, a Computer Science master\'s student who took 40% business courses might qualify for both "Software Developer" (15-1252) AND "Management Analyst" (13-1111). Each match gets a confidence score based on how well your profile fits.',
                  },
                  {
                    step: '3',
                    icon: <BarChart3 className="h-5 w-5" />,
                    title: 'Wage Level & Lottery Probability Calculation',
                    desc: 'For each matching SOC code, we look up the prevailing wage in your work location and calculate which wage level (1–4) your offered salary would fall into.',
                    detail: 'The DOL publishes prevailing wages for every SOC code in every metro area. Level 1 = 17th percentile, Level 2 = 34th, Level 3 = 50th, Level 4 = 67th. Under the 2026 weighted lottery rule (Federal Register 2025-23853), Level 1 gets ~10.5% selection rate for bachelor\'s holders, while Level 4 gets ~41.9%. For master\'s+ holders who enter both the regular and advanced degree pools, Level 4 can reach ~66.4%.',
                  },
                  {
                    step: '4',
                    icon: <Scale className="h-5 w-5" />,
                    title: 'Strategy Generation',
                    desc: 'We generate 2–3 filing strategies ranked by risk vs. lottery odds, with legal citations and attorney notes.',
                    detail: 'Each strategy is classified as Conservative (safest SOC match, lower wage level), Strategic (balanced risk/reward), or Aggressive (stretch SOC match, highest wage level). We flag risks like "specialty occupation" challenges, RFE (Request for Evidence) likelihood, and credential evaluation issues.',
                  },
                  {
                    step: '5',
                    icon: <Shield className="h-5 w-5" />,
                    title: 'Compliance & Risk Checks',
                    desc: 'The system runs automated compliance checks: Does the job actually require a bachelor\'s degree? Is the degree-to-SOC match defensible? Are there known audit triggers?',
                    detail: 'USCIS regularly denies H-1B petitions where the SOC code doesn\'t genuinely require a bachelor\'s in a specific field. We check O*NET\'s "Job Zone" (complexity level) and education statistics. If only 30% of workers in that occupation have a bachelor\'s, it\'s a red flag. We surface these risks before you file.',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {item.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-foreground text-sm">
                        Step {item.step}: {item.title}
                      </h3>
                      <p className="text-sm text-foreground">{item.desc}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Concepts */}
        <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-primary" /> Key Concepts Explained (No Legal Jargon)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="soc">
                  <AccordionTrigger>What is a SOC Code?</AccordionTrigger>
                  <AccordionContent className="text-sm text-foreground leading-relaxed space-y-2">
                    <p>
                      SOC stands for <strong>Standard Occupational Classification</strong>. It's the government's
                      way of categorizing every job in America into a numbered code. "Software Developer" is 15-1252.
                      "Financial Analyst" is 13-2051. There are ~800 codes total.
                    </p>
                    <p>
                      For H-1B purposes, the SOC code determines: (a) what wage you must be paid, and
                      (b) whether the job qualifies as a "specialty occupation" requiring a degree. Choosing
                      the wrong code can get your application denied; choosing strategically can dramatically
                      improve lottery odds.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="wage-levels">
                  <AccordionTrigger>What are Wage Levels 1–4?</AccordionTrigger>
                  <AccordionContent className="text-sm text-foreground leading-relaxed space-y-2">
                    <p>
                      The Department of Labor divides salaries for each job (SOC code) in each location
                      into 4 levels based on percentiles of what workers in that role actually earn:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Level 1</strong> — Entry level (17th percentile). Lowest salary requirement, but worst lottery odds.</li>
                      <li><strong>Level 2</strong> — Qualified (34th percentile). 2× lottery entries.</li>
                      <li><strong>Level 3</strong> — Experienced (50th percentile). 3× lottery entries.</li>
                      <li><strong>Level 4</strong> — Expert (67th percentile). 4× lottery entries, best odds.</li>
                    </ul>
                    <p>
                      The magic: the same person can have different wage levels under different SOC codes,
                      because prevailing wages vary by occupation. A $95K salary might be Level 3 for
                      "Market Research Analyst" but Level 1 for "Software Developer" in the same city.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="lottery">
                  <AccordionTrigger>How does the 2026 Weighted Lottery Work?</AccordionTrigger>
                  <AccordionContent className="text-sm text-foreground leading-relaxed space-y-2">
                    <p>
                      Before 2026, the H-1B lottery was pure random chance — every application had equal
                      odds (~27%). Starting FY2026, the government weights entries by wage level:
                    </p>
                    <p>
                      Level 1 = 1 entry, Level 2 = 2 entries, Level 3 = 3 entries, Level 4 = 4 entries.
                      With ~320,000 applicants competing for ~85,000 spots, this means:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Level 1 bachelor's: ~10.5% selection rate</li>
                      <li>Level 2 bachelor's: ~20.9%</li>
                      <li>Level 3 bachelor's: ~31.4%</li>
                      <li>Level 4 bachelor's: ~41.9%</li>
                    </ul>
                    <p>
                      Master's/PhD holders from U.S. institutions get <strong>two chances</strong>:
                      first in the 65,000 regular pool, then in a separate 20,000 advanced-degree pool.
                      This roughly doubles their odds at each level.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="specialty">
                  <AccordionTrigger>What is a "Specialty Occupation"?</AccordionTrigger>
                  <AccordionContent className="text-sm text-foreground leading-relaxed space-y-2">
                    <p>
                      H-1B visas are only for "specialty occupations" — jobs that normally require at
                      least a bachelor's degree in a <strong>specific</strong> field. "Software Developer"
                      qualifies because it typically requires a CS degree. "General Manager" often
                      doesn't because people from any background can be managers.
                    </p>
                    <p>
                      USCIS uses O*NET data to check this. If fewer than ~50% of workers in an occupation
                      hold a bachelor's, they may challenge whether it's truly a specialty occupation.
                      Our tool flags these risks automatically.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="rfe">
                  <AccordionTrigger>What is an RFE?</AccordionTrigger>
                  <AccordionContent className="text-sm text-foreground leading-relaxed space-y-2">
                    <p>
                      RFE = <strong>Request for Evidence</strong>. When USCIS isn't sure about your
                      application, instead of denying it outright, they send an RFE asking for more
                      proof. Common RFE triggers include:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Degree major doesn't obviously match the SOC code</li>
                      <li>Wage level seems too low for the claimed experience</li>
                      <li>Job duties are too vague or don't match the occupation</li>
                    </ul>
                    <p>
                      RFEs aren't fatal but cost time and additional legal fees ($1,500–$3,000+). Our tool
                      predicts RFE risk for each strategy so you can avoid them.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="prevailing-wage">
                  <AccordionTrigger>What is a Prevailing Wage?</AccordionTrigger>
                  <AccordionContent className="text-sm text-foreground leading-relaxed space-y-2">
                    <p>
                      The "prevailing wage" is the minimum salary the DOL says you must pay an H-1B worker
                      for a specific job in a specific location. It prevents companies from using H-1B
                      to hire cheap labor.
                    </p>
                    <p>
                      Prevailing wages vary dramatically by SOC code and city. A "Software Developer" in
                      San Francisco has a Level 1 prevailing wage of ~$130K, while the same code in
                      rural Texas might be ~$70K.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Sources */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" /> Data Sources & Methodology
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground leading-relaxed">
              <p>All data used by this tool comes from official U.S. government sources:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>O*NET Database</strong> (Department of Labor) — Occupation descriptions, education
                  requirements, knowledge areas, job zones, and alternate titles. Updated annually.
                </li>
                <li>
                  <strong>OFLC Prevailing Wage Data (FY2025–26)</strong> — Actual prevailing wage levels
                  for every SOC code in every Metropolitan Statistical Area (MSA).
                </li>
                <li>
                  <strong>Federal Register 2025-23853</strong> — The official rule establishing the
                  wage-weighted H-1B lottery for FY2026, including DHS projected beneficiary distributions.
                </li>
                <li>
                  <strong>Appendix A Crosswalk</strong> — Maps O*NET codes to ACWIA/DOL SOC codes used
                  in the actual LCA (Labor Condition Application) filing.
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4 p-3 border rounded-md bg-muted/30">
                <strong>Disclaimer:</strong> This tool provides strategic analysis for informational purposes.
                It is not legal advice. Always consult a licensed immigration attorney before filing any
                immigration petitions. Immigration law is complex and fact-specific; automated analysis
                cannot replace professional legal judgment.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Architecture */}
        <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-5 w-5 text-primary" /> Technical Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground leading-relaxed">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Frontend:</strong> React + TypeScript + Tailwind CSS. All UI is responsive and bilingual (English/Chinese).</li>
                <li><strong>AI Processing:</strong> Backend functions using large language models to parse resumes and transcripts, extract structured data, and match against occupational databases.</li>
                <li><strong>Data Pipeline:</strong> O*NET Excel files and OFLC wage ZIPs are loaded client-side and cross-referenced in real-time. No data leaves your browser except for AI document parsing.</li>
                <li><strong>Lottery Engine:</strong> Probability calculations based on DHS published beneficiary projections and the two-round selection process (regular cap + advanced degree pool).</li>
                <li><strong>Report Generation:</strong> Strategies are generated with confidence scores, legal citations, risk alerts, and downloadable documents (DOCX format).</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back button */}
        <div className="text-center pb-8">
          <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Strategy Engine
          </Button>
        </div>
      </main>
    </div>
  );
}
