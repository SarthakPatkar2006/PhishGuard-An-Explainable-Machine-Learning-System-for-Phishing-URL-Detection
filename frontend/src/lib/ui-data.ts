import { BrainCircuit, Globe2, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FeatureCardConfig {
  description: string;
  icon: LucideIcon;
  title: string;
}

const featureCards: FeatureCardConfig[] = [
  {
    title: "URL Feature Extraction",
    description: "Turns a raw website URL into model-ready signals like IP usage, redirects, SSL state, and link behavior.",
    icon: Globe2,
  },
  {
    title: "ML Risk Classification",
    description: "Uses your trained phishing model to classify links as legitimate or suspicious in a clear, reviewable flow.",
    icon: BrainCircuit,
  },
  {
    title: "Gemini Explanation",
    description: "Summarizes the model decision in plain language so users understand what the detector noticed.",
    icon: Sparkles,
  },
];

const chartData = [
  { name: "Mon", phishing: 14, legitimate: 42 },
  { name: "Tue", phishing: 19, legitimate: 38 },
  { name: "Wed", phishing: 11, legitimate: 47 },
  { name: "Thu", phishing: 28, legitimate: 33 },
  { name: "Fri", phishing: 16, legitimate: 51 },
  { name: "Sat", phishing: 24, legitimate: 29 },
];

const signalColors = {
  suspicious: "#ef4444",
  neutral: "#f59e0b",
  normal: "#14b8a6",
};

export { chartData, featureCards, signalColors };
export type { FeatureCardConfig };
