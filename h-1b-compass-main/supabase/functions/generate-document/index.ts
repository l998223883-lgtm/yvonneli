import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TEMPLATES: Record<string, string> = {
  support_letter: `You are an immigration attorney drafting a Support Letter for an H-1B petition.

Using the client data provided, generate a formal employer support letter that includes:
1. Company letterhead placeholder [COMPANY LETTERHEAD]
2. Date and USCIS address
3. RE: H-1B Petition for [Beneficiary Name] as [Job Title / SOC Title]
4. Introduction of the petitioning company (brief description, industry, size)
5. Description of the specialty occupation position — duties require theoretical and practical application of a body of highly specialized knowledge
6. Explanation of why the position requires at minimum a bachelor's degree in a specific specialty (cite 8 CFR § 214.2(h)(4)(ii))
7. The beneficiary's qualifications — degree, major, relevant coursework domains, work experience
8. Statement that the employer will pay the required wage (reference LCA wage level)
9. Conclusion requesting approval

Mark all fields that need employer/attorney input with [BRACKETS].
Use formal legal tone. Include bilingual section headers (English / 中文).`,

  specialty_occupation: `You are an immigration attorney drafting a Specialty Occupation Argument Letter for an H-1B petition.

Using the client data provided, generate a legal brief arguing the position qualifies as a specialty occupation under INA § 214(i)(1). Address all four regulatory criteria from 8 CFR § 214.2(h)(4)(ii):

1. Criterion 1: A baccalaureate or higher degree or its equivalent is normally the minimum requirement for entry into the particular position
   - Reference OOH data, SOC code job zone, and bachelor's degree percentage
2. Criterion 2: The degree requirement is common to the industry in parallel positions
   - Reference industry practices and comparable job postings
3. Criterion 3: The employer normally requires a degree for the position
   - [EMPLOYER TO CONFIRM hiring history]
4. Criterion 4: The nature of the specific duties are so specialized and complex that knowledge required is usually associated with a baccalaureate or higher degree
   - Tie duties to specific coursework domains from the transcript analysis

Include citations to Matter of Simeio Solutions (AAO 2015), Defensor v. Meissner, and Royal Siam Corp.
Mark fields requiring attorney/employer input with [BRACKETS].`,

  beneficiary_statement: `You are helping prepare a Beneficiary Personal Statement for an H-1B petition.

Using the client data provided, generate a first-person statement from the beneficiary that includes:
1. Educational background — degree, major, university [UNIVERSITY NAME], graduation year [YEAR]
2. Relevant coursework — highlight top course domains and how they relate to the proposed position
3. Work experience — [NUMBER] years of experience, key skills and technologies
4. Career goals — how this position advances their professional development
5. Connection between education and proposed role — why their specific degree qualifies them for this specialty occupation

Keep the tone professional but personal. The statement should demonstrate the beneficiary's understanding of the field.
Mark all personal details that need to be filled in with [BRACKETS].
Include bilingual guidance notes (English / 中文) for the beneficiary to understand what to fill in.`,

  expert_opinion: `You are drafting an Expert Opinion Letter template for an H-1B petition.

Using the client data provided, generate a template for an academic expert to opine on:
1. Expert's credentials — [EXPERT NAME, TITLE, INSTITUTION, QUALIFICATIONS]
2. Purpose of the letter — retained to evaluate the specialty occupation nature of the position and/or the beneficiary's qualifications
3. Analysis of the position — why it requires specialized knowledge at minimum a bachelor's level
4. Analysis of the beneficiary's credentials:
   - Degree equivalency if foreign degree [IF APPLICABLE]
   - Coursework alignment with SOC requirements (reference the domain analysis)
   - Whether the beneficiary's education constitutes a "specific specialty" under 8 CFR § 214.2(h)(4)(ii)
5. Conclusion — expert opinion that the position is a specialty occupation and beneficiary is qualified

Reference Defensor v. Meissner, Tapis Int'l v. INS, and relevant AAO decisions.
Mark all expert-specific fields with [BRACKETS].`,

  business_plan: `You are drafting a Business Plan summary for an H-1B petition, particularly useful for startups or new offices.

Using the client data provided, generate a business plan template that includes:
1. Executive Summary — [COMPANY NAME], industry, mission
2. Company Overview — founding date, location, current employees, capitalization [TO BE FILLED]
3. Products/Services — description of what the company does/will do
4. Market Analysis — target market, competitive landscape [TO BE RESEARCHED]
5. Organizational Structure — where the H-1B position fits, reporting structure
6. The H-1B Position — why this specialty occupation role is critical to the business plan
   - Tie to the SOC code and specialty occupation requirements
7. Financial Projections — [ATTACH OR INSERT revenue projections, ability to pay wage]
8. Growth Timeline — hiring plan, milestones for next 1-3 years

This template is especially relevant for petitions where USCIS may question whether the employer has sufficient work for a specialty occupation.
Mark all company-specific fields with [BRACKETS].`,

  rfe_specialty_occupation: `You are an immigration attorney drafting an RFE Response Letter specifically addressing a Specialty Occupation challenge for an H-1B petition.

Using the client data provided, generate a comprehensive rebuttal that:
1. Acknowledges the RFE and identifies the specific deficiency cited by USCIS
2. Restates the four regulatory criteria under 8 CFR § 214.2(h)(4)(ii) and addresses each:
   - Criterion 1: Bachelor's or higher is the normal minimum — cite OOH, Job Zone data, bachelor's percentage
   - Criterion 2: Degree requirement is common in the industry — reference comparable job postings, industry surveys
   - Criterion 3: Employer normally requires a degree — [EMPLOYER TO PROVIDE HIRING HISTORY]
   - Criterion 4: Duties are so specialized that knowledge is usually associated with a bachelor's — tie duties to specific coursework domains
3. Distinguish the case from adverse AAO decisions (e.g., Royal Siam Corp. v. Chertoff)
4. Cite favorable precedent: Defensor v. Meissner, Tapis Int'l v. INS, Matter of Simeio Solutions
5. Include a detailed course-to-duty mapping table based on the transcript analysis
6. Conclude with a legal summary requesting approval

Mark all fields requiring attorney/employer input with [BRACKETS].
Include bilingual section headers (English / 中文).`,

  rfe_beneficiary_qualifications: `You are an immigration attorney drafting an RFE Response Letter addressing a challenge to the Beneficiary's Qualifications for an H-1B petition.

Using the client data provided, generate a response that:
1. Establishes the beneficiary holds a degree equivalent to a U.S. bachelor's or higher in a specific specialty
2. If foreign degree: reference the credential evaluation from a NACES/AICE member agency
3. Provide a detailed coursework analysis showing the degree is in a "specific specialty" related to the position:
   - List top course domains with percentages
   - Map key courses to specific job duties
   - Explain how the curriculum provides the theoretical and practical knowledge required
4. Address work experience:
   - Detail ${'{clientData.workYears}'} years of progressive experience
   - Show how experience supplements formal education
5. If degree title doesn't directly match SOC: argue the "specific specialty" is met through coursework content, not just degree title
   - Cite Tapis Int'l v. INS (re: evaluating curriculum, not just degree name)
6. Include expert opinion letter reference [ATTACH EXPERT LETTER]

Mark all fields requiring input with [BRACKETS].
Include bilingual guidance (English / 中文).`,

  rfe_employer_employee: `You are an immigration attorney drafting an RFE Response Letter addressing an Employer-Employee Relationship challenge for an H-1B petition.

Using the client data provided, generate a response that demonstrates a valid employer-employee relationship by addressing:
1. The "right to control" test from Matter of Simeio Solutions, LLC (AAO 2015):
   - Right to hire and fire
   - Right to control when, where, and how work is performed
   - Right to assign additional projects and direct daily work
   - Supervision and performance evaluation process
2. Organizational chart showing reporting structure [ATTACH ORG CHART]
3. Employment terms:
   - Full-time employment at the petitioner's worksite
   - Petitioner provides all tools, equipment, and workspace
   - [IF THIRD-PARTY PLACEMENT]: Detailed itinerary, contracts/SOWs with end-clients, and evidence of petitioner's ongoing supervision
4. Address the USCIS memo on "Determining Employer-Employee Relationship for H-1B Petitions" (01/08/2010)
5. Distinguish from independent contractor arrangements
6. Cite Defensor v. Meissner regarding the broad definition of employer

Mark fields requiring employer documentation with [BRACKETS].
Include bilingual headers (English / 中文).`,
};


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentType, clientData, strategyData } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const template = TEMPLATES[documentType];
    if (!template) {
      return new Response(
        JSON.stringify({ error: `Unknown document type: ${documentType}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientContext = `
## Client Data
- Degree: ${clientData.degree} (${clientData.degreeLevel})
- Graduate Major: ${clientData.major}
${clientData.undergradMajor ? `- Undergraduate Major: ${clientData.undergradMajor}` : ""}
- Work Experience: ${clientData.workYears} years
- Top Course Domains: ${(clientData.topDomains || []).map((d: any) => `${d.domain} (${d.percentage.toFixed(0)}%)`).join(", ")}

## Selected Strategy
- SOC Code: ${strategyData.socMatch.socCode}
- SOC Title: ${strategyData.socMatch.title}
- Match Type: ${strategyData.socMatch.matchType}
- Match Reason: ${strategyData.socMatch.matchReason}
- Job Zone: ${strategyData.socMatch.jobZone}
- Bachelor's Degree %: ${strategyData.socMatch.bachelorPercentage}%
- Strategy Type: ${strategyData.type} (${strategyData.label})
- Attorney Notes: ${strategyData.attorneyNotes}
- Legal Citations: ${strategyData.legalCitations.join("; ")}
${strategyData.socMatch.warnings?.length ? `- Warnings: ${strategyData.socMatch.warnings.join("; ")}` : ""}
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: template },
          { role: "user", content: `Please generate the document based on this client data:\n${clientContext}` },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-document error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
