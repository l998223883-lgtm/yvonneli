import FadeUp from "@/components/FadeUp";

const roles = [
  {
    company: "NextStep Services",
    location: "Irvine, CA",
    title: "Co-Founder & Principal · CA Registered LDA",
    period: "Feb 2025 – Present",
    bullets: [
      "Self-sourced clients; advise international founders 0→1 on work visa strategy, entity formation, equity structure, and early operations.",
      "Deployed LLM workflows (Claude, GPT-4) across client engagements to replace repetitive research, document prep, and analysis.",
      "Built and shipped three AI products in parallel: H-1B Compass (live), Voice AI Agent, and Legal Support platform.",
    ],
  },
  {
    company: "New Dream Services",
    location: "Irvine, CA",
    title: "Financial Analyst → Acquisition Manager",
    period: "Aug 2022 – Dec 2024",
    bullets: [
      "Managed $25M+ commercial real estate portfolio across 7 properties (DCF, exit strategy) — outperformed market benchmarks by 5.5%.",
      "Built financial models for 23 projects; supported full due diligence cycle across leases, comps, zoning, and market research.",
      "Prepared investment memoranda and stakeholder presentations; coordinated acquisition pipeline and broker relationships.",
    ],
  },
  {
    company: "CBRE",
    location: "Los Angeles, CA",
    title: "Finance Intern, FP&A · Investment Management",
    period: "Jun – Aug 2022",
    bullets: [
      "Developed a $1B cross-border M&A investment case for CBRE's expansion into Australia — valuation, scenario modeling, and pro-forma financials.",
      "Conducted 50+ industry expert interviews; translated insights into executive-level investment thesis for CEO and CFO.",
      "Built 7+5 and 6+6 rolling forecast cycles; delivered nine executive dashboards in Power BI for senior leadership planning.",
    ],
  },
  {
    company: "Cushman & Wakefield",
    location: "Chengdu, China",
    title: "Real Estate Strategic Consultant",
    period: "Feb – Jul 2021",
    bullets: [
      "Co-led a 7.5-acre multiuse development generating $10M in revenue; managed concept-to-completion as part of a three-person team.",
      "Produced a 118-page deliverable integrating due diligence, market research, and financial valuation.",
      "Conducted 18 community interviews, 5 on-site investigations, and 30 consumer surveys across the submarket.",
    ],
  },
  {
    company: "SPS Dolls",
    location: "Dongguan & Yangzhou, China",
    title: "Founder & IP Designer",
    period: "Oct 2019 – Jul 2021",
    bullets: [
      "Founded original BJD IP brand for young adult collectors; launched parallel children's sub-brand for market segmentation.",
      "Designed 15+ physical products; managed 5 factories end-to-end across sculpting, resin casting, ceramics, and hand-blown glass eyes.",
      "Built omnichannel distribution (Instagram, Etsy, Weibo); sponsored 4 national collector conventions; grew to ~$350K ARR with a 4-person team.",
    ],
  },
];

export default function Experience() {
  return (
    <section
      id="experience"
      style={{ paddingTop: "80px", paddingBottom: "80px", background: "rgba(255,255,255,0.18)" }}
    >
      <div className="container-site">
        <FadeUp>
          <span className="text-meta block mb-4">02 / EXPERIENCE</span>
          <div className="pb-8" style={{ borderBottom: "1px solid var(--rule-strong)" }}>
            <h2 className="text-section">Five domains, one thread</h2>
          </div>
        </FadeUp>

        <div>
          {roles.map((role, i) => (
            <FadeUp key={role.company} delay={i * 60}>
              <div
                className="grid md:grid-cols-[200px_1fr] gap-6 py-8"
                style={{ borderBottom: i < roles.length - 1 ? "1px solid var(--rule)" : "none" }}
              >
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600, color: "var(--ink-primary)", marginBottom: "4px" }}>
                    {role.company}
                  </p>
                  <p className="text-meta mb-1" style={{ fontSize: "11px" }}>{role.location}</p>
                  <p className="text-meta" style={{ fontSize: "11px" }}>{role.period}</p>
                </div>
                <div>
                  <p className="text-label mb-4" style={{ color: "var(--ink-secondary)", fontSize: "11px" }}>
                    {role.title}
                  </p>
                  <ul className="flex flex-col gap-3">
                    {role.bullets.map((b, j) => (
                      <li key={j} className="flex gap-3" style={{ fontSize: "14px", color: "var(--ink-secondary)", lineHeight: 1.65 }}>
                        <span className="shrink-0 mt-[7px]" style={{ width: "4px", height: "4px", background: "var(--ink-muted)", borderRadius: "50%", display: "inline-block" }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
