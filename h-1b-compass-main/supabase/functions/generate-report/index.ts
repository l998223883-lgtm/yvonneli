import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LAWYER_SOC_KNOWLEDGE = `
CRITICAL: Use the following attorney-verified SOC code guidance by field. This takes priority over general O*NET data.

ARCHITECTURE:
- Drafter → easy RFE, avoid
- Interior Designer (27-1025) → approved, use undergrad Architecture major
- Architect (17-1011) → can waive license requirement
- Urban Planner (19-3051) → approved

ACCOUNTING:
- Accountant (13-2011) → NOT recommended, high RFE
- Bookkeeper → do NOT use

COMPUTER SCIENCE:
- Software Developer (15-1252) → approved, standard choice
- UX/UI → use "Web and Digital Interface Designers" (15-1255), NOT "Web Developer"
- Web Developer → NOT recommended
- Database Administrator (15-1242) → approved, low wage level. Check coursework for networking courses
- Business Intelligence Analyst → approved
- Quality Assurance Tester (15-1253) → approved

FINANCE:
- Quantitative roles → easy RFE, be cautious

DESIGN:
- Graphic Designer (27-1024) → direct approval, low wage level

DATA:
- Data Analyst → approved
- Data Scientist (15-2051) → approved
- Operations Research Analyst (15-2031) → approved (for modeling work)

MARKETING:
- Marketing Specialist (13-1161) → direct approval for Communication and Marketing majors
- Business Analyst background can also qualify, high approval rate. Must articulate connection between major and marketing

ECONOMICS / PUBLIC POLICY / STATISTICS:
- Operations Research Analyst (15-2031) → approved (for modeling/data analysis work)

PROJECT MANAGEMENT:
- Project Management Specialist → easy RFE, avoid

MBA:
- General MBA → high RFE risk

INDUSTRIAL ENGINEERING:
- Use Operational/Data analyst codes

BIOENGINEERING:
- Quality Control (17-2112 or similar) → approved

BIOLOGY / CHEMISTRY:
- Do NOT use Technician codes → high denial rate

SOCIAL WORK:
- Healthcare Social Worker (21-1022) → approved

SALES:
- Sales Manager (11-2022) → approved

ELECTRICAL ENGINEERING:
- Mechanical Engineer codes also acceptable

ANIMATION / GAME DESIGN:
- Game Designer → approved

NURSING:
- Social Worker codes → low wage but approvable
- Gerontology/Nursing backgrounds can qualify

MENTAL HEALTH COUNSELING:
- Low wage codes available

VIDEO / FILM:
- Film Editor (27-4032) → approved

QUALITY CONTROL / COST:
- Purchasing Agent/Buyer (13-1023) → approved
- Purchasing Specialist → approved

GENERAL RULES:
- NEVER use "All Other" SOC codes (ending in .99)
- Undergraduate major CAN be used for SOC code matching
- Always prefer specific SOC codes with high bachelor's degree requirements
`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { analysis, zipCode, isFounder, jobTitle, undergradMajor, degreeLevel } = await req.json();
    const clientDegreeLevel = degreeLevel || analysis.resume.degreeLevel || 'master';
    const hasAdvancedDegree = clientDegreeLevel === 'master' || clientDegreeLevel === 'doctorate' || clientDegreeLevel === 'professional';
    
    // H-1B FY2027 Lottery Probability Engine
    // Source: Federal Register 2025-23853, DHS projected beneficiary distribution
    const DHS_BENEFICIARIES: Record<number, number> = { 1: 89911, 2: 177216, 3: 37928, 4: 15657 };
    const TOTAL_BENEFICIARIES = 320712;
    const REGULAR_CAP = 65000;
    const ADVANCED_CAP = 20000;
    const MASTERS_PCT = 0.40;
    const TOTAL_WEIGHTED = DHS_BENEFICIARIES[1]*1 + DHS_BENEFICIARIES[2]*2 + DHS_BENEFICIARIES[3]*3 + DHS_BENEFICIARIES[4]*4; // 620,755
    
    function regularRate(level: number): number {
      return Math.min(level * REGULAR_CAP / TOTAL_WEIGHTED, 1);
    }
    function advancedRate(level: number): number {
      const levels = [1,2,3,4];
      let totalUnselectedWeighted = 0;
      for (const lvl of levels) {
        const mastersAtLvl = TOTAL_BENEFICIARIES * MASTERS_PCT * (DHS_BENEFICIARIES[lvl] / TOTAL_BENEFICIARIES);
        const unselected = mastersAtLvl * (1 - regularRate(lvl));
        totalUnselectedWeighted += unselected * lvl;
      }
      return Math.min(level * ADVANCED_CAP / totalUnselectedWeighted, 1);
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert H-1B immigration attorney and strategy advisor. You have deep knowledge of:
- O*NET SOC codes and occupation classifications
- 2026 H-1B weighted lottery rules (Level 1 = 1x, Level 2 = 2x, Level 3 = 3x, Level 4 = 4x)
- 8 CFR 214.2(h)(4)(ii) - specialty occupation requirements
- January 2025 H-1B Modernization Final Rule (founder/self-employed eligibility)
- Job Zone requirements (must be ≥ 4 for H-1B)
- Education requirements for specialty occupations

${LAWYER_SOC_KNOWLEDGE}

You will receive a client's extracted resume and transcript data. Generate a strategic H-1B lottery report.

CRITICAL RULES:
1. Suggest 2-3 SOC codes via different paths (degree-based, course-based, and optionally founder path)
2. Consider BOTH graduate AND undergraduate majors when matching SOC codes
3. Job Zone MUST be ≥ 4. If suggesting a code with Zone < 4, add a critical warning.
4. If bachelor's degree percentage for a SOC < 60%, warn about specialty occupation challenge.
5. For each SOC code, provide estimated wage levels (Level 1-4). If you don't have exact amounts for the zip code, estimate based on national medians and note they are estimates.
6. Include proper legal citations.
7. If the client is a founder, include Path C with founder-specific legal language.
8. NEVER suggest SOC codes ending in .99 ("All Other" categories)
9. Reference the attorney SOC guidance above - these are field-tested approval/denial patterns

LEGAL SNIPPETS TO USE:
- For course relevance: "Based on 8 CFR 214.2(h)(4)(ii), the beneficiary's intensive coursework in [courses] qualifies them for this specialty occupation."
- For founder identity: "Per January 2025 Final Rule, the beneficiary-owner's position is a bona fide offer, provided a separate Board of Directors oversees employment."
- For Level 1 warning: "Warning: Selecting a Level 1 wage for a complex role in Job Zone 5 may trigger a 'Level I Wage RFE'."
- For undergrad major use: "The beneficiary's undergraduate degree in [major] provides the foundational specialty knowledge required under 8 CFR 214.2(h)(4)(ii)."

The output MUST follow the exact structure defined in the tool schema.`;

    const userPrompt = `Client Analysis Data:

RESUME:
- Degree: ${analysis.resume.degree}
- Graduate Major: ${analysis.resume.major}
- Undergraduate Major: ${undergradMajor || analysis.resume.undergradMajor || 'Not provided'}
- Skills: ${analysis.resume.skills.join(', ')}
- Work Experience: ${analysis.resume.workYears} years
- Tech Stack: ${analysis.resume.techStack.join(', ')}

TRANSCRIPT:
- Total Courses: ${analysis.transcript.totalCourses}
- Domain Distribution:
${analysis.transcript.domainFrequencies.map((d: { domain: string; percentage: number; count: number; isAlternatePath: boolean }) => 
  `  ${d.domain}: ${d.percentage.toFixed(1)}% (${d.count} courses)${d.isAlternatePath ? ' ★ ALTERNATE PATH' : ''}`
).join('\n')}

CLIENT INFO:
- Office Zip Code: ${zipCode || 'Not provided'}
- Is Founder/Self-Employed: ${isFounder ? 'Yes' : 'No'}
- Intended Job Title: ${jobTitle || 'Not specified'}

IMPORTANT: Consider both the graduate AND undergraduate majors when suggesting SOC codes. The undergraduate major can unlock entirely different SOC code paths.

Generate a comprehensive H-1B strategy report with 2-3 strategic options comparing different SOC codes and wage levels.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_strategy_report",
              description: "Generate the H-1B strategy report with decision matrix",
              parameters: {
                type: "object",
                properties: {
                  strategies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string", description: "Strategy label e.g. 'Plan A: Software Developer'" },
                        type: { type: "string", enum: ["conservative", "strategic", "aggressive"] },
                        socMatch: {
                          type: "object",
                          properties: {
                            socCode: { type: "string" },
                            title: { type: "string" },
                            description: { type: "string" },
                            matchType: { type: "string", enum: ["degree", "course", "founder"] },
                            matchReason: { type: "string" },
                            matchScore: { type: "number" },
                            jobZone: { type: "number" },
                            educationLevel: { type: "string" },
                            bachelorPercentage: { type: "number" },
                            warnings: { type: "array", items: { type: "string" } },
                          },
                          required: ["socCode", "title", "description", "matchType", "matchReason", "matchScore", "jobZone", "educationLevel", "bachelorPercentage", "warnings"],
                        },
                        wageLevels: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              level: { type: "number" },
                              label: { type: "string" },
                              amount: { type: "number", nullable: true },
                              lotteryMultiplier: { type: "number" },
                              rfeRisk: { type: "string" },
                              description: { type: "string" },
                            },
                            required: ["level", "label", "lotteryMultiplier", "rfeRisk", "description"],
                          },
                        },
                        attorneyNotes: { type: "string" },
                        legalCitations: { type: "array", items: { type: "string" } },
                      },
                      required: ["label", "type", "socMatch", "wageLevels", "attorneyNotes", "legalCitations"],
                    },
                  },
                  riskAlerts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        severity: { type: "string", enum: ["warning", "critical", "info"] },
                        title: { type: "string" },
                        description: { type: "string" },
                        recommendation: { type: "string" },
                      },
                      required: ["severity", "title", "description", "recommendation"],
                    },
                  },
                  legalDisclaimer: { type: "string" },
                },
                required: ["strategies", "riskAlerts", "legalDisclaimer"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_strategy_report" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`Report generation failed: ${response.status}`);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured report data");
    }

    const reportData = JSON.parse(toolCall.function.arguments);

    // Post-process: inject accurate lottery probabilities based on degree level
    // Uses two-round calculation: Round 1 (65k regular) + Round 2 (20k advanced degree)
    const strategiesWithProbs = reportData.strategies.map((strategy: any) => ({
      ...strategy,
      wageLevels: strategy.wageLevels.map((wl: any) => {
        const level = Math.min(Math.max(wl.level as number, 1), 4);
        const regProb = regularRate(level);
        const advProb = hasAdvancedDegree ? advancedRate(level) : null;
        const combinedProb = hasAdvancedDegree
          ? 1 - (1 - regProb) * (1 - advancedRate(level))
          : regProb;
        return {
          ...wl,
          selectionProbability: regProb,
          advancedPoolProbability: advProb,
          combinedProbability: hasAdvancedDegree ? combinedProb : null,
        };
      }),
    }));

    const report = {
      clientSummary: {
        degree: analysis.resume.degree,
        major: analysis.resume.major,
        undergradMajor: undergradMajor || analysis.resume.undergradMajor || undefined,
        degreeLevel: clientDegreeLevel,
        workYears: analysis.resume.workYears,
        topDomains: analysis.transcript.domainFrequencies
          .sort((a: { percentage: number }, b: { percentage: number }) => b.percentage - a.percentage)
          .slice(0, 5),
      },
      strategies: strategiesWithProbs,
      riskAlerts: reportData.riskAlerts,
      legalDisclaimer: reportData.legalDisclaimer,
      generatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
