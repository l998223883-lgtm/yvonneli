export type Note = {
  id: string;
  number: string;
  year: string;
  title: string;
  excerpt: string;
};

export const notes: Note[] = [
  {
    id: "why-ai-tools-fail-design",
    number: "001",
    year: "2026",
    title: "Why current AI tools fail design work",
    excerpt: "The problem isn't capability. It's that most tools interrupt the thinking they're supposed to support.",
  },
  {
    id: "vertical-vs-horizontal",
    number: "002",
    year: "2025",
    title: "Vertical specialization beats horizontal demos",
    excerpt: "A tool that knows one domain deeply is worth ten that gesture at everything.",
  },
  {
    id: "architecture-as-ai-ux",
    number: "003",
    year: "2025",
    title: "Architecture as a model for AI UX",
    excerpt: "Buildings teach you that circulation is never neutral. Neither is interaction flow.",
  },
  {
    id: "the-real-adoption-question",
    number: "004",
    year: "2025",
    title: "The real adoption question",
    excerpt: "Not 'will they try it' but 'does it change what they do the next day.'",
  },
];
