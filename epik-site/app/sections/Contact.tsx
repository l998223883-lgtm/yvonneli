import IsoMark from "@/components/IsoMark";
import FadeUp from "@/components/FadeUp";

export default function Contact() {
  return (
    <section id="contact" style={{ paddingTop: "80px", paddingBottom: "0", background: "rgba(255,255,255,0.18)" }}>
      <div className="container-site">
        <FadeUp>
          <span className="text-meta block mb-4">05 / GET IN TOUCH</span>
          <h2 className="text-display mb-14" style={{ maxWidth: "680px", lineHeight: 1.05 }}>
            Building something{" "}
            <span className="highlight">AI-native</span>?{" "}
            Let&rsquo;s talk.
          </h2>
        </FadeUp>

        <FadeUp delay={100}>
          <div style={{ borderTop: "1px solid var(--rule-strong)" }}>
            {[
              { label: "Portfolio v1", value: "yvonneli.vercel.app/v1", href: "/v1/" },
              { label: "Email", value: "yl4553@columbia.edu", href: "mailto:yl4553@columbia.edu" },
              { label: "LinkedIn", value: "linkedin.com/in/yixuanli327", href: "https://linkedin.com/in/yixuanli327" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-5"
                style={{ borderBottom: "1px solid var(--rule)" }}
              >
                <span className="text-label" style={{ width: "80px" }}>{item.label}</span>
                <a
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="text-body transition-opacity hover:opacity-60"
                  style={{ color: "var(--ink-primary)", textDecoration: "none", fontSize: "14px" }}
                >
                  {item.value} ↗
                </a>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>

      <footer style={{ borderTop: "1px solid var(--rule)", marginTop: "48px" }}>
        <div className="container-site flex flex-col md:flex-row items-center justify-between gap-4 py-7">
          <div className="flex items-center gap-3">
            <IsoMark size={24} />
            <span className="text-meta">© 2026 Yvonne Li</span>
          </div>
          <span className="text-meta">Built with Claude Code · Last updated May 2026</span>
        </div>
      </footer>
    </section>
  );
}
