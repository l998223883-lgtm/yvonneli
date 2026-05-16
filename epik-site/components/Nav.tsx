"use client";

import { useState, useEffect } from "react";
import IsoMark from "./IsoMark";

const links = [
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Practice", href: "#practice" },
  { label: "Notes", href: "#notes" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          backgroundColor: scrolled
            ? "rgba(232, 223, 255, 0.85)"
            : "rgba(232, 223, 255, 0.55)",
          borderBottom: scrolled ? "1px solid var(--rule)" : "1px solid transparent",
        }}
      >
        <div className="container-site flex items-center justify-between h-14">

          {/* Left: logo + name */}
          <a href="#hero" className="flex items-center gap-2.5 group shrink-0">
            <IsoMark size={20} />
            <span
              className="text-label"
              style={{ color: "var(--ink-primary)", letterSpacing: "0.08em", fontSize: "11px" }}
            >
              Yvonne Li
            </span>
          </a>

          {/* Center: section links — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-4 py-1.5 text-label rounded transition-all duration-150 hover:bg-black/5"
                style={{ color: "var(--ink-secondary)", fontSize: "11px", letterSpacing: "0.06em" }}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right: connect CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#contact"
              className="text-label transition-all duration-150"
              style={{
                fontSize: "11px",
                letterSpacing: "0.06em",
                color: "var(--ink-primary)",
                padding: "6px 16px",
                border: "1px solid var(--ink-primary)",
                borderRadius: "100px",
              }}
            >
              Connect
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-px transition-all duration-200"
              style={{
                background: "var(--ink-primary)",
                transform: mobileOpen ? "rotate(45deg) translate(0, 6px)" : "",
              }}
            />
            <span
              className="block w-5 h-px transition-all duration-200"
              style={{ background: "var(--ink-primary)", opacity: mobileOpen ? 0 : 1 }}
            />
            <span
              className="block w-5 h-px transition-all duration-200"
              style={{
                background: "var(--ink-primary)",
                transform: mobileOpen ? "rotate(-45deg) translate(0, -6px)" : "",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 flex flex-col"
          style={{ paddingTop: "56px", background: "rgba(232, 223, 255, 0.97)" }}
        >
          {[...links, { label: "Connect", href: "#contact" }].map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-6 py-5 text-label"
              style={{
                borderBottom: "1px solid var(--rule)",
                color: "var(--ink-secondary)",
                fontSize: "13px",
                letterSpacing: "0.05em",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
