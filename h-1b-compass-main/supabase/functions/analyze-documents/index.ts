import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function extractJsonFromResponse(text: string): unknown {
  // Try direct parse first
  try { return JSON.parse(text); } catch { /* continue */ }

  // Remove markdown code blocks
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  const jsonStart = cleaned.search(/[\{\[]/);
  if (jsonStart === -1) throw new Error("No JSON found in response");

  // Find matching end
  const startChar = cleaned[jsonStart];
  const endChar = startChar === '{' ? '}' : ']';
  const jsonEnd = cleaned.lastIndexOf(endChar);
  if (jsonEnd === -1) throw new Error("Incomplete JSON in response");

  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fix trailing commas and control chars
    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/[\x00-\x1F\x7F]/g, "");

    // Try to close unbalanced braces
    let braces = 0, brackets = 0;
    for (const c of cleaned) {
      if (c === '{') braces++; if (c === '}') braces--;
      if (c === '[') brackets++; if (c === ']') brackets--;
    }
    while (brackets > 0) { cleaned += ']'; brackets--; }
    while (braces > 0) { cleaned += '}'; braces--; }

    return JSON.parse(cleaned);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      resumeBase64, transcriptBase64, undergradTranscriptBase64, jobDescBase64,
      resumeFileName, transcriptFileName, undergradFileName, jobDescFileName,
      manualSupplement,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert H-1B immigration document analyzer. Analyze the provided PDF documents and extract structured data.

For the RESUME, extract:
- degree: The highest degree obtained (e.g., "Master of Science")
- major: The field of study for the highest degree
- undergradMajor: The undergraduate major if found (IMPORTANT for SOC codes)
- skills: Array of technical and professional skills
- workYears: Estimated total years of work experience
- techStack: Array of specific technologies, tools, frameworks

For the TRANSCRIPT(S):
- List ALL course names from ALL transcripts (graduate AND undergraduate)
- Classify each course into a domain: "Computer Science", "Data Science", "Finance", "Business", "Mathematics", "Engineering", "Communications", "Design", "Natural Sciences", "Social Sciences", "Law", "Healthcare", "Architecture", "Statistics", "Marketing", "Accounting", "Other"
- Calculate domain frequency as percentage of total courses
- Flag any domain with >15% as alternate path (isAlternatePath: true)

For JOB DESCRIPTION (if provided):
- Extract job title, duties, qualifications into skills/techStack

IMPORTANT: Be thorough. Extract every course name. The undergraduate major is critical for SOC matching.`;

    // Build multimodal content parts: send PDFs as proper file attachments
    const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

    contentParts.push({ type: "text", text: `Analyze these documents and call the extract_document_data tool.\n\nRESUME (${resumeFileName}):` });
    contentParts.push({ type: "image_url", image_url: { url: `data:application/pdf;base64,${resumeBase64}` } });

    contentParts.push({ type: "text", text: `\nGRADUATE TRANSCRIPT (${transcriptFileName}):` });
    contentParts.push({ type: "image_url", image_url: { url: `data:application/pdf;base64,${transcriptBase64}` } });

    if (undergradTranscriptBase64) {
      contentParts.push({ type: "text", text: `\nUNDERGRADUATE TRANSCRIPT (${undergradFileName}):` });
      contentParts.push({ type: "image_url", image_url: { url: `data:application/pdf;base64,${undergradTranscriptBase64}` } });
    }

    if (jobDescBase64) {
      contentParts.push({ type: "text", text: `\nJOB DESCRIPTION (${jobDescFileName}):` });
      contentParts.push({ type: "image_url", image_url: { url: `data:application/pdf;base64,${jobDescBase64}` } });
    }

    if (manualSupplement) {
      contentParts.push({
        type: "text",
        text: `\nMANUAL SUPPLEMENT (provided by attorney):
- Degree: ${manualSupplement.degree || 'N/A'}
- Graduate Major: ${manualSupplement.graduateMajor || 'N/A'}
- Undergrad Major: ${manualSupplement.undergradMajor || 'N/A'}
- Work Years: ${manualSupplement.workYears || 'N/A'}
- Skills: ${manualSupplement.skills || 'N/A'}
- Course Domains: ${manualSupplement.courseDomains || 'N/A'}
- Job Title: ${manualSupplement.jobTitle || 'N/A'}
Use this to supplement or override extracted data where documents are incomplete.`
      });
    }

    contentParts.push({ type: "text", text: "\nExtract the structured data as specified. Remember to extract the undergraduate major if available." });

    const toolSchema = {
      type: "function",
      function: {
        name: "extract_document_data",
        description: "Extract structured data from resume and transcript PDFs",
        parameters: {
          type: "object",
          properties: {
            resume: {
              type: "object",
              properties: {
                degree: { type: "string" },
                major: { type: "string" },
                undergradMajor: { type: "string", description: "Undergraduate major if found" },
                skills: { type: "array", items: { type: "string" } },
                workYears: { type: "number" },
                techStack: { type: "array", items: { type: "string" } },
              },
              required: ["degree", "major", "skills", "workYears", "techStack"],
            },
            transcript: {
              type: "object",
              properties: {
                courses: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      courseName: { type: "string" },
                      domain: { type: "string" },
                    },
                    required: ["courseName", "domain"],
                  },
                },
                domainFrequencies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      domain: { type: "string" },
                      count: { type: "number" },
                      percentage: { type: "number" },
                      isAlternatePath: { type: "boolean" },
                    },
                    required: ["domain", "count", "percentage", "isAlternatePath"],
                  },
                },
                totalCourses: { type: "number" },
              },
              required: ["courses", "domainFrequencies", "totalCourses"],
            },
          },
          required: ["resume", "transcript"],
        },
      },
    };

    console.log("Sending multimodal request with", contentParts.length, "content parts");

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
          { role: "user", content: contentParts },
        ],
        tools: [toolSchema],
        tool_choice: { type: "function", function: { name: "extract_document_data" } },
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
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
      throw new Error(`AI analysis failed: ${response.status} - ${errText.substring(0, 200)}`);
    }

    const aiResult = await response.json();
    console.log("AI response received, choices:", aiResult.choices?.length);

    // Try tool_calls first
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      console.log("Got structured tool call response");
      const extractedData = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(extractedData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to extract JSON from message content
    const messageContent = aiResult.choices?.[0]?.message?.content;
    if (messageContent) {
      console.log("No tool call, attempting JSON extraction from content");
      const extracted = extractJsonFromResponse(messageContent);
      return new Response(JSON.stringify(extracted), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log full response for debugging
    console.error("Unexpected AI response structure:", JSON.stringify(aiResult).substring(0, 1000));
    throw new Error("AI did not return structured data in any expected format");

  } catch (e) {
    console.error("analyze-documents error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
