"use client";

import { projects } from "@/lib/projects";
import FadeUp from "@/components/FadeUp";

export default function Work() {
  return (
    <section id="work" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
      <div className="container-site">
        <FadeUp>
          <span className="text-meta block mb-4">01 / WORK</span>
          <div className="pb-8" style={{ borderBottom: "1px solid var(--rule-strong)" }}>
            <h2 className="text-section">7 products shipped</h2>
            <p className="text-body mt-3" style={{ maxWidth: "620px", color: "var(--ink-secondary)", fontSize: "14px" }}>
              Each tool solves a friction point I lived through — visa strategy, self-rep
              legal work, missed calls, founder contracts, AI companionship, decision paralysis.
              The last one is the portfolio itself, made playable.
            </p>
          </div>
        </FadeUp>

        <div className="flex flex-col gap-20 mt-16">
          {projects.map((project, i) => (
            <FadeUp key={project.number} delay={i * 50}>
              <ProjectCard project={project} flipped={i % 2 === 1} />
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: "live" | "dev" | "archived" }) {
  const config = {
    live: { label: "● LIVE", color: "#22a55a", bg: "rgba(74,222,128,0.14)" },
    dev: { label: "● IN DEV", color: "#b88808", bg: "rgba(250,204,21,0.16)" },
    archived: { label: "ARCHIVED", color: "var(--ink-muted)", bg: "rgba(0,0,0,0.05)" },
  };
  const c = config[status];
  return (
    <span
      style={{
        padding: "3px 9px",
        borderRadius: "100px",
        background: c.bg,
        color: c.color,
        fontSize: "9px",
        letterSpacing: "0.12em",
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {c.label}
    </span>
  );
}

function ProjectCard({
  project,
  flipped,
}: {
  project: import("@/lib/projects").Project;
  flipped: boolean;
}) {
  return (
    <article className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
      {/* IMAGE — preview of the live site */}
      <div
        className={`md:col-span-7 ${flipped ? "md:order-2" : "md:order-1"}`}
        style={{ minWidth: 0 }}
      >
        <div
          style={{
            position: "relative",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid var(--rule-strong)",
            background: "rgba(255,255,255,0.5)",
            aspectRatio: "16 / 11",
            boxShadow: "0 4px 24px rgba(61,61,61,0.06)",
          }}
        >
          {project.link && project.image ? (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", width: "100%", height: "100%", position: "relative" }}
            >
              <img
                src={project.image}
                alt={`${project.title} screenshot`}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top center",
                  display: "block",
                }}
              />
              {/* Hover overlay */}
              <div
                className="group-hover-overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(61,61,61,0)",
                  transition: "background 200ms",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                  padding: "16px",
                }}
              >
                <span
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    border: "1px solid var(--rule-strong)",
                    borderRadius: "100px",
                    padding: "6px 14px",
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    color: "var(--ink-primary)",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                  }}
                >
                  TRY LIVE ↗
                </span>
              </div>
            </a>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ink-muted)",
                fontSize: "12px",
                letterSpacing: "0.1em",
              }}
            >
              IN DEVELOPMENT
            </div>
          )}
        </div>
      </div>

      {/* INFO column */}
      <div
        className={`md:col-span-5 ${flipped ? "md:order-1" : "md:order-2"}`}
        style={{ minWidth: 0 }}
      >
        {/* Number + status */}
        <div className="flex items-center gap-3 mb-3">
          <span
            className="text-meta"
            style={{ fontSize: "11px", color: "var(--ink-muted)" }}
          >
            {project.number} · {project.year}
          </span>
          <StatusBadge status={project.status} />
        </div>

        {/* Title */}
        <h3
          className="mb-2"
          style={{
            fontFamily: "'Bodoni Moda', serif",
            fontSize: "30px",
            fontWeight: 500,
            lineHeight: 1.1,
            color: "var(--ink-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          {project.title}
        </h3>

        {/* Tagline */}
        <p
          className="mb-5"
          style={{
            fontFamily: "'Bodoni Moda', serif",
            fontStyle: "italic",
            fontSize: "16px",
            color: "var(--ink-secondary)",
            lineHeight: 1.4,
          }}
        >
          {project.tagline}
        </p>

        {/* Description — the "why" */}
        <p
          className="mb-6 text-body"
          style={{ fontSize: "13.5px", lineHeight: 1.65, color: "var(--ink-secondary)" }}
        >
          {project.description}
        </p>

        {/* Metrics — stacked highlights */}
        {project.metrics && project.metrics.length > 0 && (
          <div
            className="mb-5"
            style={{
              padding: "14px 16px",
              background: "rgba(255,255,255,0.55)",
              border: "1px solid var(--rule)",
              borderRadius: "8px",
            }}
          >
            <span
              className="block mb-2"
              style={{
                fontSize: "9px",
                letterSpacing: "0.14em",
                color: "var(--ink-muted)",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}
            >
              IMPACT
            </span>
            <div className="flex flex-col gap-1.5">
              {project.metrics.map((m) => (
                <div key={m} className="flex items-start gap-2">
                  <span style={{ color: "var(--ink-primary)", fontSize: "12px", marginTop: "1px" }}>→</span>
                  <span style={{ fontSize: "12.5px", color: "var(--ink-primary)", lineHeight: 1.5 }}>{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features — bullet list */}
        {project.features && project.features.length > 0 && (
          <div className="mb-5">
            <span
              className="block mb-2"
              style={{
                fontSize: "9px",
                letterSpacing: "0.14em",
                color: "var(--ink-muted)",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}
            >
              WHAT IT DOES
            </span>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="flex flex-col gap-1.5">
              {project.features.slice(0, 4).map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span style={{ color: "#22a55a", fontSize: "11px", marginTop: "3px", flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: "12.5px", color: "var(--ink-secondary)", lineHeight: 1.5 }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quote */}
        {project.quote && (
          <blockquote
            className="mb-5"
            style={{
              borderLeft: "2px solid var(--ink-primary)",
              paddingLeft: "14px",
              margin: 0,
              fontFamily: "'Bodoni Moda', serif",
              fontSize: "13.5px",
              fontStyle: "italic",
              color: "var(--ink-secondary)",
              lineHeight: 1.55,
            }}
          >
            &ldquo;{project.quote}&rdquo;
          </blockquote>
        )}

        {/* Tags + CTA */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: "3px 9px",
                borderRadius: "100px",
                border: "1px solid var(--rule-strong)",
                color: "var(--ink-tertiary)",
                fontSize: "10px",
                letterSpacing: "0.04em",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-5"
            style={{
              padding: "8px 18px",
              background: "var(--ink-primary)",
              color: "#fff",
              borderRadius: "100px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textDecoration: "none",
              transition: "opacity 200ms",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Open live site ↗
          </a>
        )}
      </div>
    </article>
  );
}
