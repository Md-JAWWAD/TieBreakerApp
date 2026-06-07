export type AnalysisType = "pros_cons" | "comparison" | "swot" | "verdict";

export interface ProConPoint {
  point: string;
  weight: number; // 1 to 5
  explanation: string;
}

export interface Alternative {
  name: string;
  score: number;
  pros: ProConPoint[];
  cons: ProConPoint[];
}

export interface ScoreDetail {
  option: string;
  score: number; // 1 to 10
  comment: string;
}

export interface ComparisonMatrixItem {
  criterion: string;
  scores: ScoreDetail[];
}

export interface ComparisonConfig {
  criteria: string[];
  matrix: ComparisonMatrixItem[];
}

export interface SwotItem {
  option: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  insights: string;
}

export interface DecisionResult {
  id: string; // generated client-side for history persistence
  timestamp: string; // ISO string
  decisionTitle: string;
  winner: string;
  confidenceScore: number; // 0 to 100
  synopsis: string;
  alternatives?: Alternative[];
  comparison?: ComparisonConfig;
  swot?: SwotItem[];
  tiebreakerVerdict: string;
  actionPlan: string[];
  inputType: AnalysisType;
  originalDilemma: string;
}

export const PRESET_DILEMMAS = [
  {
    title: "Quit corporate job vs. Full-time freelancing",
    dilemma: "Should I quit my secure corporate job to pursue full-time freelancing?",
    type: "verdict" as AnalysisType,
    options: ["Secure Corporate Job", "Freelancing Career"],
    criteria: ["Financial Freedom", "Work-Life Balance", "Professional Growth", "Mental Health"]
  },
  {
    title: "Relocate to San Francisco vs. Stay in London",
    dilemma: "Should I accept the relocation offer to move to San Francisco or stay in London with my current network?",
    type: "comparison" as AnalysisType,
    options: ["Relocate to San Francisco", "Stay in London"],
    criteria: ["Career Catalyst", "Cost of Living", "Social Network", "Adventure Factor"]
  },
  {
    title: "Buy an Electric SUV vs. Mid-size Hybrid",
    dilemma: "Should we buy a fully electric SUV or stick with a highly reliable mid-size hybrid hatchback?",
    type: "pros_cons" as AnalysisType,
    options: ["Electric SUV (EV)", "Mid-Size Hybrid (PHEV)"],
    criteria: ["Upfront Cost", "Long-term Savings", "Environmental Impact", "Versatility"]
  },
  {
    title: "Bootstrap the startup vs. Venture Capital round",
    dilemma: "For our SaaS product expansion, should we bootstrap/self-fund or seek VC funding?",
    type: "swot" as AnalysisType,
    options: ["Bootstrap & Grow Organic", "Accept VC Investment"],
    criteria: ["Control & Equity", "Growth Velocity", "Market Penetration", "Execution Risk"]
  }
];
