# H-1B Strategic Assessment Engine

> **"Lawyer-in-a-Box"** — An AI-powered tool that automates H-1B visa filing strategy under the 2026 weighted lottery rules.

## What Is This?

Every year, ~300,000 skilled workers compete for ~85,000 H-1B visa spots through a lottery. Starting **FY2026**, the U.S. government changed the lottery from pure random chance to a **wage-weighted** system — higher-paying positions get more lottery entries.

This tool automates the strategic analysis that immigration attorneys charge $2,000–$5,000 to perform:

1. **Parses** a candidate's resume + transcripts using AI
2. **Matches** their background against 800+ government job codes (SOC codes)
3. **Calculates** lottery odds at each wage level under the new weighted rules
4. **Generates** 2–3 filing strategies ranked by risk vs. lottery probability
5. **Produces** a downloadable strategy report with legal citations

## Key Concepts (No Legal Background Needed)

### SOC Codes
The government categorizes every job into a numbered code (e.g., "Software Developer" = 15-1252). Your SOC code determines your required salary and whether your job qualifies for an H-1B.

### Wage Levels 1–4
For each SOC code in each city, the Department of Labor defines 4 salary tiers:
- **Level 1** (17th percentile) → 1 lottery entry → ~10.5% odds
- **Level 2** (34th percentile) → 2 entries → ~20.9% odds
- **Level 3** (50th percentile) → 3 entries → ~31.4% odds
- **Level 4** (67th percentile) → 4 entries → ~41.9% odds

The same person can achieve different wage levels under different SOC codes. A $95K salary might be Level 3 for "Market Research Analyst" but Level 1 for "Software Developer" in the same city.

### Weighted Lottery (FY2026 Rule)
Based on Federal Register 2025-23853 (effective 02/27/2026). DHS projected ~320,712 beneficiaries competing for 65,000 regular + 20,000 advanced-degree spots. Master's/PhD holders from U.S. institutions enter both pools, roughly doubling their odds.

## Data Sources

All data comes from official U.S. government sources:
- **O*NET Database** — Occupation descriptions, education requirements, job zones, alternate titles
- **OFLC Prevailing Wage Data (FY2025–26)** — Wage levels for every SOC code × metro area
- **Federal Register 2025-23853** — The weighted lottery rule with DHS beneficiary projections
- **Appendix A Crosswalk** — Maps O*NET codes to DOL SOC codes used in LCA filings

## How It Works Technically

```
User Uploads (Resume + Transcripts)
        │
        ▼
┌─────────────────────────┐
│  AI Document Extraction │  ← LLM parses unstructured documents
│  (Edge Function)        │    Extracts: degree, major, courses, skills
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  SOC Code Matching      │  ← Cross-references against O*NET database
│  (Edge Function)        │    Matches major + courses + skills → SOC codes
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Wage Level Lookup      │  ← OFLC prevailing wage data by ZIP code
│  (Client-side)          │    Maps SOC code + location → wage levels 1-4
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Lottery Probability    │  ← FY2027 weighted lottery formula
│  Engine (Client-side)   │    Calculates per-level selection rates
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Strategy Report        │  ← Generates Conservative / Strategic / Aggressive
│  Generation             │    options with risk alerts & legal citations
└─────────────────────────┘
```

### Architecture
- **Frontend:** React + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Serverless edge functions for AI document processing
- **AI:** Large language models for document parsing and occupational matching
- **Data:** Government Excel/CSV files loaded and cross-referenced client-side
- **Bilingual:** All UI supports English and Chinese (中文)

### Lottery Probability Formula

```
Regular Pool Rate (all applicants):
  P_regular(L) = L × 65,000 / 620,755

Advanced Pool Rate (Master's+ only, unselected from Round 1):
  P_advanced(L) = L × 20,000 / Σ(unselected_masters_weighted)

Combined (Master's+):
  P_combined = 1 - (1 - P_regular)(1 - P_advanced)
```

Where `L` = wage level (1–4), and 620,755 = total weighted entries across all ~320K beneficiaries.

## Project Structure

```
src/
├── pages/
│   ├── Index.tsx          # Main intake form (upload or manual entry)
│   ├── Report.tsx         # Strategy report display
│   └── DesignLogic.tsx    # This documentation as an interactive page
├── components/
│   ├── FileUpload.tsx     # Document upload with drag-and-drop
│   ├── ManualInfoForm.tsx # Manual data entry form
│   ├── AnalysisProgress.tsx # Step-by-step progress indicator
│   ├── WageLevelOptimizer.tsx # Wage level comparison
│   ├── DecisionMatrix.tsx # Strategy comparison matrix
│   ├── RiskAlerts.tsx     # Compliance risk warnings
│   ├── LegalCitations.tsx # Legal authority references
│   └── DocumentGenerator.tsx # DOCX report export
├── types/
│   └── h1b.ts             # TypeScript types + lottery engine
├── lib/
│   └── dataLoader.ts      # O*NET + OFLC data loading
└── supabase/functions/
    ├── analyze-documents/  # AI document extraction
    ├── generate-document/  # Report document generation
    └── generate-report/    # Strategy report generation
```

## Disclaimer

This tool provides strategic analysis for **informational purposes only**. It is not legal advice. Always consult a licensed immigration attorney before filing any immigration petitions. Immigration law is complex and fact-specific; automated analysis cannot replace professional legal judgment.

## Tech Stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Recharts](https://recharts.org/) for data visualization
- [docx](https://docx.js.org/) for Word document generation
- Serverless edge functions for AI processing
