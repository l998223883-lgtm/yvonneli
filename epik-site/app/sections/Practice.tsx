import FadeUp from "@/components/FadeUp";

const capabilities = [
  { label: "Mindset", value: "Operational reality over novelty" },
  { label: "Method", value: "Workflow first, then interface" },
  { label: "Stack", value: "Claude · GPT-4 · Lovable · Cursor · Figma" },
  { label: "Domain", value: "Legal, real estate, immigration, IP" },
  { label: "Range", value: "0→1, ambiguous, interdisciplinary" },
  { label: "Outcome", value: "Systems people actually adopt" },
];

const skills = [
  "AI-native product strategy & 0→1 prototyping",
  "LLM application design & prompt engineering",
  "AI-assisted development (Lovable, Claude Code, Figma)",
  "Conversation UX and human-AI interaction design",
  "AI evaluation and iteration",
];

const education = [
  {
    school: "Columbia University",
    location: "New York, NY",
    degree: "Master of Science — Real Estate Development",
    period: "Aug 2020 – May 2022",
  },
  {
    school: "Washington University in St. Louis",
    location: "St. Louis, MO",
    degree: "Bachelor of Science — Economics & Architecture (Double Major)",
    period: "Aug 2016 – Aug 2019",
  },
];

export default function Practice() {
  return (
    <section id="practice" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
      <div className="container-site">
        <FadeUp>
          <span className="text-meta block mb-4">03 / PRACTICE</span>
          <div className="pb-8 mb-8" style={{ borderBottom: "1px solid var(--rule-strong)" }}>
            <h2 className="text-section">A polymath operator for AI-native environments</h2>
          </div>
        </FadeUp>

        <FadeUp delay={80}>
          <blockquote
            style={{
              borderTop: "2px solid var(--ink-primary)",
              borderBottom: "2px solid var(--ink-primary)",
              padding: "28px 0",
              marginBottom: "48px",
              fontStyle: "italic",
              color: "var(--ink-primary)",
              fontFamily: "'Bodoni Moda', serif",
              fontSize: "clamp(20px, 2.4vw, 30px)",
              lineHeight: 1.35,
            }}
          >
            &ldquo;I care less about whether AI looks impressive. I care whether it changes what someone
            can actually do.&rdquo;
          </blockquote>
        </FadeUp>

        <FadeUp delay={140}>
          <div className="grid grid-cols-2 md:grid-cols-3 mb-12">
            {capabilities.map((cap, i) => (
              <div
                key={cap.label}
                style={{
                  padding: "20px 16px",
                  borderRight: (i + 1) % 3 !== 0 ? "1px solid var(--rule)" : "none",
                  borderBottom: i < 3 ? "1px solid var(--rule)" : "none",
                }}
              >
                <p className="text-label mb-2">{cap.label}</p>
                <p style={{ fontSize: "13px", color: "var(--ink-primary)", lineHeight: 1.5 }}>{cap.value}</p>
              </div>
            ))}
          </div>
        </FadeUp>

        <FadeUp delay={200}>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <p className="text-label mb-5" style={{ color: "var(--ink-muted)" }}>AI Skills</p>
              <ul className="flex flex-col gap-3">
                {skills.map((s) => (
                  <li key={s} className="flex gap-3 items-start" style={{ fontSize: "14px", color: "var(--ink-secondary)", lineHeight: 1.6 }}>
                    <span className="shrink-0 mt-[7px]" style={{ width: "4px", height: "4px", background: "var(--ink-muted)", borderRadius: "50%", display: "inline-block" }} />
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                {["CA LDA (Registered)", "CFA Level I"].map((cert) => (
                  <span key={cert} className="text-label" style={{ padding: "3px 10px", borderRadius: "100px", border: "1px solid var(--rule-strong)", color: "var(--ink-tertiary)", fontSize: "10px" }}>
                    {cert}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-label mb-5" style={{ color: "var(--ink-muted)" }}>Education</p>
              <div className="flex flex-col gap-6">
                {education.map((e) => (
                  <div key={e.school} style={{ borderBottom: "1px solid var(--rule)", paddingBottom: "20px" }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--ink-primary)", marginBottom: "2px" }}>{e.school}</p>
                    <p className="text-meta mb-1">{e.location} · {e.period}</p>
                    <p style={{ fontSize: "13px", color: "var(--ink-secondary)", lineHeight: 1.5 }}>{e.degree}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
