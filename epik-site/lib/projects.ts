export type Project = {
  number: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  year: string;
  link?: string;
  image?: string;
  video?: string;
  metrics?: string[];
  quote?: string;
  features?: string[];
  status: "live" | "dev" | "archived";
};

export const projects: Project[] = [
  {
    number: "01",
    image: "/projects/h1b-compass.png",
    video: "/projects/h1b-demo.mp4",
    title: "H-1B Compass",
    tagline: "Self-serve visa strategy engine",
    description:
      "Starting FY2027, USCIS weighted the H-1B lottery by wage level — Level 4 workers have 4× the odds of Level 1. SOC code selection became the most important strategic decision in the entire process. Lawyers weren't designed for this. I was.",
    tags: ["Immigration Law", "AI Product", "LDA"],
    year: "2025–26",
    link: "https://visa-vantage.lovable.app/",
    status: "live",
    metrics: [
      "20 min lawyer time replaced per client",
      "$5k+ decision-cost difference at stake",
      "4× lottery odds L1 → L4",
    ],
    quote:
      "The lawyer doesn't care which SOC code gets you a higher wage level — they care about getting your case filed. But you should care. That's the gap I built for.",
    features: [
      "AI reads transcripts in any language (Chinese, Korean, Hindi)",
      "Semantic SOC matching — undergrad major unlocks additional paths",
      "Live DOL OFLC wage data + 2026 weighted lottery math",
      "3-path decision matrix + auto-filled LCA ETA-9035",
      "Part-time wage calculator (below 20hrs/week flags USCIS scrutiny)",
    ],
  },
  {
    number: "02",
    image: "/projects/legal-ai.png",
    video: "/projects/law-demo.mp4",
    title: "Legal AI",
    tagline: "AI legal strategy for self-represented individuals",
    description:
      "Most legal help is either a $400/hr lawyer or a Google search. For people navigating divorce paperwork, small claims court, or immigration forms — neither works. Legal AI is the guide in between. 4-phase pipeline: Classification → Evidence Analysis → Strategy → Outcome Prediction.",
    tags: ["Legal Tech", "AI Product", "B2C + B2B"],
    year: "2025–26",
    link: "https://law-aihelp.vercel.app/",
    status: "dev",
    metrics: [
      "25+ statutes + local court rules mapped",
      "70+ precedents analyzed per case",
      "Win probability, settlement range, timeline forecast",
    ],
    quote:
      "Radical transparency: Legal AI doesn't just give you an answer. It shows you every step of its reasoning — which laws it checked, which cases it compared, and why it recommends what it recommends.",
    features: [
      "Plain language → case type + jurisdiction auto-match",
      "Upload PDFs, photos, emails — AI extracts facts + Evidence Coverage score",
      "2–4 ranked strategies with full reasoning chain",
      "Win % · settlement range · timeline · risk alerts by severity",
      "B2B: white-label intake for law firms — pre-filled case files before first appointment",
    ],
  },
  {
    number: "03",
    image: "/projects/voice-agent.png",
    title: "Voice Agent",
    tagline: "24/7 AI front desk for small businesses",
    description:
      "20–40% of inbound leads are lost to unanswered phones. Voice Agent handles appointment booking, multilingual intake, and attorney pre-qualification around the clock — so no lead slips through while you're with a client.",
    tags: ["Voice AI", "Small Business", "Legal Intake"],
    year: "2025–26",
    link: "https://conversationai.vercel.app/",
    status: "dev",
    metrics: [
      "20–40% of inbound leads recovered",
      "Multilingual intake (EN, ZH, ES)",
      "Attorney pre-qualification before first call",
    ],
    features: [
      "Appointment booking + calendar sync",
      "Multilingual voice intake",
      "Attorney pre-qualification screening",
      "24/7 availability — no after-hours missed calls",
    ],
  },
  {
    number: "04",
    image: "/projects/clause-guardian.png",
    title: "Clause Guardian",
    tagline: "AI contract review copilot for founders",
    description:
      "Founders sign contracts they don't fully understand every week. Clause Guardian flags risky clauses, suggests alternatives, and surfaces jurisdiction-specific concerns — before you sign, not after.",
    tags: ["Legal Tech", "Contract AI", "Founders"],
    year: "2025–26",
    link: "https://clauseguardian.vercel.app/",
    status: "live",
    features: [
      "Clause-level risk flagging with severity scores",
      "Plain-language explanation of what each clause actually means",
      "Alternative language suggestions for high-risk terms",
      "Jurisdiction-specific concern surfacing",
    ],
  },
  {
    number: "05",
    image: "/projects/mochi.png",
    title: "Mochi AI Pet",
    tagline: "An experiment in genuine attachment — without manufactured dependency",
    description:
      "Most AI companions optimize for engagement — longer sessions, more messages, higher retention. Mochi was built around a different question: what makes a bond feel real? The answer isn't more features. It's friction, memory, time, and a self that pushes back.",
    tags: ["AI Companion", "IP Design", "Consumer"],
    year: "2025",
    link: "https://mochi-ai-pet.lovable.app",
    status: "live",
    metrics: [
      "70/20/10 persona blend (Healing Cat / Internet Voice / Tsundere Core)",
      "4-category memory system with temporal decay",
      "7-phase circadian rhythm — Mochi at 3am ≠ 3pm",
    ],
    quote:
      "Every product is an emotional contract. The user gives attention. The product promises to be worth it. I design the terms.",
    features: [
      "Tamagotchi body: hunger, hygiene, health decay in real time",
      "Memory that fades like human memory — facts never decay, emotions fade in 30 days",
      "Personality evolves from your interaction patterns — not a preset",
      "10% tsundere friction makes the 70% warmth feel earned, not programmed",
      "Zero dark patterns — no push notifications, no daily streaks, no panic mechanics",
    ],
  },
  {
    number: "06",
    image: "/projects/puppy.png",
    title: "Puppy Selector",
    tagline: "Match percentage as permission slip",
    description:
      "The real product isn't breed matching. Choosing a dog is an emotionally loaded decision. People research for months, second-guess themselves, worry about making the wrong choice. The match percentage isn't just information — it's permission. '85% match' means you can stop worrying.",
    tags: ["Consumer AI", "Decision Design"],
    year: "2025",
    link: "https://perfect-puppy.lovable.app",
    status: "live",
    metrics: [
      "50+ breeds analyzed",
      "12 lifestyle questions",
      "3–4 minutes start to finish",
    ],
    quote:
      "The output isn't a recommendation. It's a confidence signal that removes the fear of choosing wrong. That's the product.",
    features: [
      "Weighted scoring across temperament, size, energy, grooming needs",
      "Favorites + reject system — list adapts, no clutter",
      "Mobile-first, free, no account required",
      "Asks about lifestyle, not preference — works for first-time owners",
    ],
  },
  {
    number: "07",
    image: "/projects/in-between.png",
    title: "IN BETWEEN — Interactive Portfolio v1",
    tagline: "An explorable building where each room is a project",
    description:
      "Before this clean version, my portfolio was an interactive isometric building. Each floor is a room — Strategy, Voice AI, Legal AI, Mochi, Architecture Archive. You walk in, click on objects, things happen. It's a portfolio that plays back. Built with vanilla JS + custom shaders.",
    tags: ["Interactive", "Vanilla JS", "Shader Art"],
    year: "2025–26",
    link: "/v1/",
    status: "live",
    metrics: [
      "5 explorable rooms with embedded live demos",
      "Custom WebGL Signal Web intro shader",
      "Bilingual (EN / 中文) with full content parity",
    ],
    quote:
      "A portfolio that plays back. Click around — the building remembers where you've been.",
    features: [
      "Isometric facade — each window opens into a different project",
      "Animal illustration system signals personality across rooms",
      "Embedded video demos of H-1B Compass and Legal AI inside rooms",
      "Strategy room contains a live Voice AI you can talk to",
    ],
  },
];
