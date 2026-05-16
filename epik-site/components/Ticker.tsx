const items = [
  { label: "H-1B Compass", href: "https://visa-vantage.lovable.app/" },
  { label: "Legal Support", href: "https://law-aihelp.vercel.app/" },
  { label: "Voice Agent", href: "https://conversationai.vercel.app/" },
  { label: "Clause Guardian", href: "https://clauseguardian.vercel.app/" },
  { label: "Mochi AI Pet", href: "https://mochi-ai-pet.lovable.app" },
  { label: "Puppy Selector", href: "https://perfect-puppy.lovable.app" },
];

// Duplicate for seamless loop
const track = [...items, ...items, ...items];

export default function Ticker() {
  return (
    <div
      className="overflow-hidden py-4"
      style={{ borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)" }}
    >
      <div
        className="flex gap-12 whitespace-nowrap"
        style={{
          animation: "ticker-scroll 28s linear infinite",
          width: "max-content",
        }}
      >
        {track.map((item, i) => (
          <a
            key={i}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 group shrink-0"
            style={{ textDecoration: "none" }}
          >
            {/* Dot separator */}
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "var(--ink-muted)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span
              className="text-label transition-opacity duration-200 group-hover:opacity-40"
              style={{ fontSize: "12px", letterSpacing: "0.06em", color: "var(--ink-secondary)" }}
            >
              {item.label}
            </span>
          </a>
        ))}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
