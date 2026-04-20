export interface ResumeData {
  degree: string;
  major: string;
  undergradMajor?: string;
  degreeLevel: 'bachelor' | 'master' | 'doctorate' | 'professional';
  skills: string[];
  workYears: number;
  techStack: string[];
}

export interface CourseAnalysis {
  courseName: string;
  domain: string;
}

export interface DomainFrequency {
  domain: string;
  count: number;
  percentage: number;
  isAlternatePath: boolean;
}

export interface TranscriptData {
  courses: CourseAnalysis[];
  domainFrequencies: DomainFrequency[];
  totalCourses: number;
}

export interface DocumentAnalysis {
  resume: ResumeData;
  transcript: TranscriptData;
}

export interface SOCMatch {
  socCode: string;
  title: string;
  description: string;
  matchType: 'degree' | 'course' | 'founder';
  matchReason: string;
  matchScore: number;
  jobZone: number;
  educationLevel: string;
  bachelorPercentage: number;
  warnings: string[];
}

export interface WageLevel {
  level: number;
  label: string;
  amount: number | null;
  lotteryMultiplier: number;
  selectionProbability: number | null;
  advancedPoolProbability: number | null;
  combinedProbability: number | null;
  rfeRisk: string;
  description: string;
}

export interface StrategyOption {
  label: string;
  type: 'conservative' | 'strategic' | 'aggressive';
  socMatch: SOCMatch;
  wageLevels: WageLevel[];
  attorneyNotes: string;
  legalCitations: string[];
}

export interface StrategyReport {
  clientSummary: {
    degree: string;
    major: string;
    undergradMajor?: string;
    degreeLevel: 'bachelor' | 'master' | 'doctorate' | 'professional';
    workYears: number;
    topDomains: DomainFrequency[];
  };
  strategies: StrategyOption[];
  riskAlerts: RiskAlert[];
  legalDisclaimer: string;
  generatedAt: string;
}

export interface RiskAlert {
  severity: 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  recommendation: string;
}

export interface AnalysisStep {
  id: string;
  label: string;
  labelCn: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  detail?: string;
}

export interface ManualClientInfo {
  degree: string;
  degreeLevel: 'bachelor' | 'master' | 'doctorate' | 'professional';
  graduateMajor: string;
  undergradMajor: string;
  workYears: number;
  skills: string;
  courseDomains: string;
  jobTitle: string;
}

export const emptyManualInfo: ManualClientInfo = {
  degree: '',
  degreeLevel: 'master',
  graduateMajor: '',
  undergradMajor: '',
  workYears: 0,
  skills: '',
  courseDomains: '',
  jobTitle: '',
};

/**
 * H-1B FY2027 Weighted Lottery Probability Engine
 * Source: Federal Register 2025-23853 (published 12/29/2025, effective 02/27/2026)
 * 
 * DHS Projected Beneficiary Distribution:
 *   Level I:  89,911 beneficiaries
 *   Level II: 177,216 beneficiaries
 *   Level III: 37,928 beneficiaries
 *   Level IV:  15,657 beneficiaries
 *   Total: ~320,712 beneficiaries
 * 
 * Wage weighting: L1=1 entry, L2=2 entries, L3=3 entries, L4=4 entries
 * Total weighted entries: 89,911×1 + 177,216×2 + 37,928×3 + 15,657×4 = 620,755
 * 
 * Selection Process (two rounds):
 *   Round 1 (Regular Cap): 65,000 spots — ALL registrants compete
 *   Round 2 (Advanced Degree): 20,000 spots — only unselected US Master's+ compete
 * 
 * DHS Published Blended Rates (across all registrants):
 *   L1: 15.29%, L2: 30.58%, L3: 45.87%, L4: 61.16%
 *   Note: These are blended averages. Actual per-round rates differ.
 * 
 * Master's holders get TWO chances regardless of which degree is used for SOC matching.
 * A client with a Bachelor's undergrad used for SOC + Master's highest degree still gets dual pool.
 */

// DHS projected beneficiary counts by wage level
const DHS_BENEFICIARIES = {
  1: 89_911,
  2: 177_216,
  3: 37_928,
  4: 15_657,
} as const;

const TOTAL_BENEFICIARIES = 320_712;
const REGULAR_CAP = 65_000;
const ADVANCED_CAP = 20_000;
const MASTERS_PERCENTAGE = 0.40; // ~40% of registrants have US advanced degrees (historical)

// Total weighted entries in the pool
const TOTAL_WEIGHTED_ENTRIES =
  DHS_BENEFICIARIES[1] * 1 +
  DHS_BENEFICIARIES[2] * 2 +
  DHS_BENEFICIARIES[3] * 3 +
  DHS_BENEFICIARIES[4] * 4; // = 620,755

/**
 * Calculate Round 1 (Regular Pool) probability.
 * All registrants compete. 65,000 spots from ~620,755 weighted entries.
 * P(level L) ≈ L × REGULAR_CAP / TOTAL_WEIGHTED_ENTRIES
 */
function regularPoolRate(wageLevel: 1 | 2 | 3 | 4): number {
  return Math.min(wageLevel * REGULAR_CAP / TOTAL_WEIGHTED_ENTRIES, 1);
}

/**
 * Calculate Round 2 (Advanced Degree Pool) probability for unselected Master's holders.
 * 
 * Estimate unselected Master's weighted entries by assuming Master's distribution 
 * mirrors overall distribution, then removing those selected in Round 1.
 */
function advancedPoolRate(wageLevel: 1 | 2 | 3 | 4): number {
  // Estimate Master's count at each level (proportional to overall distribution)
  const levels = [1, 2, 3, 4] as const;
  let totalUnselectedMastersWeighted = 0;

  for (const lvl of levels) {
    const mastersAtLevel = TOTAL_BENEFICIARIES * MASTERS_PERCENTAGE * (DHS_BENEFICIARIES[lvl] / TOTAL_BENEFICIARIES);
    const unselectedAtLevel = mastersAtLevel * (1 - regularPoolRate(lvl));
    totalUnselectedMastersWeighted += unselectedAtLevel * lvl;
  }

  return Math.min(wageLevel * ADVANCED_CAP / totalUnselectedMastersWeighted, 1);
}

// Pre-computed rates for display (DHS published blended rates for reference)
export const WAGE_LEVEL_SELECTION_RATES = {
  1: { regular: regularPoolRate(1), advanced: advancedPoolRate(1) },
  2: { regular: regularPoolRate(2), advanced: advancedPoolRate(2) },
  3: { regular: regularPoolRate(3), advanced: advancedPoolRate(3) },
  4: { regular: regularPoolRate(4), advanced: advancedPoolRate(4) },
} as const;

/**
 * Calculate lottery selection probability.
 * 
 * Bachelor's: only Round 1 (regular pool, 65,000 spots)
 * Master's/Doctorate/Professional: Round 1 + Round 2 (advanced pool, 20,000 more spots)
 * Combined = 1 - (1 - P_regular)(1 - P_advanced)
 * 
 * Results (DHS FY2027 projections):
 * | Level | Bachelor's | Master's (Combined) |
 * |-------|-----------|---------------------|
 * | L1    | ~10.5%    | ~19.9%              |
 * | L2    | ~20.9%    | ~37.6%              |
 * | L3    | ~31.4%    | ~53.1%              |
 * | L4    | ~41.9%    | ~66.4%              |
 */
export function calculateLotteryProbability(
  wageLevel: 1 | 2 | 3 | 4,
  degreeLevel: 'bachelor' | 'master' | 'doctorate' | 'professional',
): { regularProb: number; advancedProb: number | null; combinedProb: number } {
  const regProb = regularPoolRate(wageLevel);

  const hasAdvancedDegree = degreeLevel === 'master' || degreeLevel === 'doctorate' || degreeLevel === 'professional';

  if (!hasAdvancedDegree) {
    return { regularProb: regProb, advancedProb: null, combinedProb: regProb };
  }

  const advProb = advancedPoolRate(wageLevel);
  const combinedProb = 1 - (1 - regProb) * (1 - advProb);

  return { regularProb: regProb, advancedProb: advProb, combinedProb };
}
