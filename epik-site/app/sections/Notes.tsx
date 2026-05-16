import { notes } from "@/lib/notes";
import FadeUp from "@/components/FadeUp";

export default function Notes() {
  return (
    <section id="notes" style={{ paddingTop: "80px", paddingBottom: "80px", background: "rgba(255,255,255,0.18)" }}>
      <div className="container-site">
        <FadeUp>
          <span className="text-meta block mb-4">04 / FIELD NOTES</span>
          <div className="pb-10 mb-10" style={{ borderBottom: "1px solid var(--rule-strong)" }}>
            <h2 className="text-section">Working theses</h2>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {notes.map((note, i) => (
            <FadeUp key={note.id} delay={i * 70}>
              <div
                className="group cursor-default transition-colors duration-200 hover:bg-white/20"
                style={{
                  padding: "32px 24px",
                  borderTop: "1px solid var(--ink-primary)",
                  borderRight: i % 2 === 0 ? "1px solid var(--rule)" : "none",
                  borderBottom: i < 2 ? "1px solid var(--rule)" : "none",
                }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-meta">Essay · {note.number}</span>
                  <span className="text-meta" style={{ opacity: 0.4 }}>·</span>
                  <span className="text-meta">{note.year}</span>
                </div>
                <h4
                  className="mb-3 transition-transform duration-200 group-hover:translate-x-1"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "18px", fontWeight: 500, color: "var(--ink-primary)", lineHeight: 1.35 }}
                >
                  {note.title}
                </h4>
                <p style={{ fontSize: "14px", color: "var(--ink-tertiary)", lineHeight: 1.6 }}>
                  {note.excerpt}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
