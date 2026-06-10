// Mock labor-market trends for the insights dashboard.

export interface MarketTrend {
  skill: string;
  demandIndex: number; // 0..100
  growthPct: number; // yoy
  category: "trending" | "emerging";
}

export const MARKET_TRENDS: MarketTrend[] = [
  { skill: "Python", demandIndex: 92, growthPct: 18, category: "trending" },
  { skill: "SQL", demandIndex: 88, growthPct: 12, category: "trending" },
  { skill: "Power BI", demandIndex: 81, growthPct: 24, category: "trending" },
  { skill: "React", demandIndex: 79, growthPct: 15, category: "trending" },
  { skill: "Machine Learning", demandIndex: 76, growthPct: 41, category: "emerging" },
  { skill: "Prompt Engineering", demandIndex: 64, growthPct: 120, category: "emerging" },
  { skill: "Cloud / DevOps", demandIndex: 71, growthPct: 33, category: "emerging" },
];

export const EMERGING_CAREERS = [
  { title: "AI Product Manager", demand: "High", note: "Bridges AI tech and business." },
  { title: "Data Engineer", demand: "High", note: "Builds data pipelines for analytics." },
  { title: "Prompt Engineer", demand: "Growing", note: "Designs LLM workflows." },
];
