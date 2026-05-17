"use client";

import FadeUp from "@/components/FadeUp";
import Ticker from "@/components/Ticker";

export default function Hero() {
  return (
    <>
      <section id="hero" style={{ paddingTop: "108px", paddingBottom: "64px" }}>
        <div className="container-site">

          {/* ── Two-column split ── */}
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* ── LEFT: text ── */}
            <div className="flex-1 order-2 md:order-1">

              {/* Status badge */}
              <FadeUp delay={0}>
                <div className="flex items-center gap-2 mb-8">
                  <span
                    className="inline-block"
                    style={{
                      width: "7px", height: "7px",
                      borderRadius: "50%",
                      background: "#4ade80",
                      boxShadow: "0 0 0 3px rgba(74,222,128,0.25)",
                    }}
                  />
                  <span className="text-meta" style={{ fontSize: "11px" }}>
                    Open to roles
                  </span>
                </div>
              </FadeUp>

              {/* Heading */}
              <FadeUp delay={60}>
                <h1 className="text-display mb-6">
                  Hi, I&rsquo;m Yvonne —{" "}
                  <span className="highlight">AI&nbsp;product</span>{" "}
                  builder
                </h1>
              </FadeUp>

              {/* Tagline */}
              <FadeUp delay={130}>
                <p className="text-lead mb-8" style={{ maxWidth: "480px" }}>
                  I turn complex systems — legal logic, capital structures,
                  immigration frameworks — into tools people actually use.{" "}
                  <span style={{ color: "var(--ink-primary)", fontStyle: "italic" }}>
                    7 live products shipped.
                  </span>
                </p>
              </FadeUp>

              {/* CTAs */}
              <FadeUp delay={190}>
                <div className="flex flex-wrap items-center gap-3 mb-10">
                  <a
                    href="#contact"
                    style={{
                      padding: "9px 22px",
                      background: "var(--ink-primary)",
                      color: "#fff",
                      borderRadius: "100px",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "12px",
                      fontWeight: 500,
                      letterSpacing: "0.04em",
                      textDecoration: "none",
                      transition: "opacity 200ms",
                    }}
                    onMouseOver={e => (e.currentTarget.style.opacity = "0.75")}
                    onMouseOut={e => (e.currentTarget.style.opacity = "1")}
                  >
                    Let&rsquo;s connect
                  </a>
                  <a
                    href="/v1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "9px 22px",
                      border: "1px solid var(--rule-strong)",
                      borderRadius: "100px",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "12px",
                      letterSpacing: "0.04em",
                      color: "var(--ink-secondary)",
                      textDecoration: "none",
                      transition: "opacity 200ms",
                    }}
                    onMouseOver={e => (e.currentTarget.style.opacity = "0.6")}
                    onMouseOut={e => (e.currentTarget.style.opacity = "1")}
                  >
                    View portfolio ↗
                  </a>
                </div>
              </FadeUp>

              {/* Credential strip */}
              <FadeUp delay={240}>
                <div
                  className="flex flex-wrap gap-x-6 gap-y-2 pt-6"
                  style={{ borderTop: "1px solid var(--rule)" }}
                >
                  {[
                    "Columbia · Real Estate",
                    "WashU · Architecture + Economics",
                    "CA Registered LDA",
                    "CFA Level I",
                  ].map((item) => (
                    <span key={item} className="text-meta">{item}</span>
                  ))}
                </div>
              </FadeUp>
            </div>

            {/* ── RIGHT: avatar ── */}
            <FadeUp delay={100} className="order-1 md:order-2 shrink-0">
              <div
                style={{
                  position: "relative",
                  width: "340px",
                  maxWidth: "80vw",
                }}
              >
                {/* Soft glow behind avatar */}
                <div
                  style={{
                    position: "absolute",
                    inset: "10%",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(232,223,255,0.9) 0%, transparent 70%)",
                    filter: "blur(32px)",
                    zIndex: 0,
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    animation: "avatar-float 5s ease-in-out infinite",
                  }}
                >
                  {/* Drop avatar.png into epik-site/public/ to show your illustration */}
                  <img
                    src="/avatar.png"
                    alt="Yvonne Li"
                    width={340}
                    height={340}
                    style={{ objectFit: "contain", display: "block" }}
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = "none";
                      const placeholder = el.nextElementSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = "flex";
                    }}
                  />
                  {/* Placeholder shown until avatar.png is added */}
                  <div
                    style={{
                      display: "none",
                      width: "340px",
                      height: "340px",
                      borderRadius: "50%",
                      background: "rgba(61,61,61,0.06)",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "48px" }}>👤</span>
                    <span className="text-meta" style={{ fontSize: "10px", textAlign: "center", padding: "0 24px" }}>
                      Add avatar.png to<br />epik-site/public/
                    </span>
                  </div>
                </div>
              </div>
            </FadeUp>

          </div>
        </div>
      </section>

      {/* Ticker */}
      <Ticker />

      <style>{`
        @keyframes avatar-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
}
