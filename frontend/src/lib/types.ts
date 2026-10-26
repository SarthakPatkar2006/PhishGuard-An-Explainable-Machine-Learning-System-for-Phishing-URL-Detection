interface StatusItem {
  meta: string;
  ready: boolean;
  status: string;
}

interface AppStatus {
  gemini: StatusItem;
  model: StatusItem;
  modelComparison: StatusItem;
  mongo: StatusItem;
  output: StatusItem;
  preprocessor: StatusItem;
  repo: {
    name: string;
    url: string;
  };
  sampleData: StatusItem;
}

interface UrlFeature {
  name: string;
  signal: "Suspicious" | "Neutral" | "Normal";
  value: number;
}

interface ShapFactor {
  contribution: number;
  direction: "Supports selected prediction" | "Counters selected prediction";
  name: string;
  value: number;
}

interface ShapExplanation {
  available: boolean;
  message: string;
  method: "Tree SHAP";
  topFeatures: ShapFactor[];
}

interface GeminiExplanationUpdate {
  diagnostic: string;
  explanationSource: "Gemini" | "Gemini unavailable" | "Pending Gemini explanation";
  status: "pending" | "ready" | "unavailable";
  summary: string;
}

interface UrlPrediction {
  createdAt?: string;
  dnsStatus: string;
  explanationDiagnostic?: string;
  explanationJobId?: string;
  explanationSource?: "Gemini" | "Gemini unavailable" | "Local rule-based fallback" | "Pending Gemini explanation" | "Groq" | "Groq unavailable" | "Pending Groq explanation";
  explanationStatus?: "pending" | "ready" | "unavailable";
  features: UrlFeature[];
  finalUrl: string;
  historyId?: string;
  hostname: string;
  htmlStatus: string;
  label: "Legitimate" | "Phishing";
  prediction: number;
  signals: {
    neutral: number;
    normal: number;
    suspicious: number;
  };
  shap?: ShapExplanation;
  statusClass: "good" | "danger";
  summary: string;
  suspiciousFeatures?: string[];
  url: string;
}

interface CsvPrediction {
  columns: number;
  fileName: string;
  legitimate: number;
  outputMeta: string;
  phishing: number;
  preview: Array<Record<string, string | number>>;
  rows: number;
}

interface PredictionHistoryResponse {
  items: UrlPrediction[];
  requiresAuth?: boolean;
}

interface AuthUser {
  createdAt: string;
  email: string;
  id: string;
  name: string;
}

interface AuthSession {
  expiresAt: string;
  token: string;
  user: AuthUser;
}

interface AuthCredentials {
  email: string;
  name?: string;
  password: string;
}

interface ModelComparisonRow {
  bestParams: Record<string, string | number | boolean | null>;
  error: string;
  isBest: boolean;
  modelName: string;
  status: "trained" | "failed" | "unavailable";
  testAccuracy: number;
  testF1: number;
  testPrecision: number;
  testRecall: number;
  trainAccuracy: number;
  trainF1: number;
  trainPrecision: number;
  trainRecall: number;
}

interface ModelComparisonReport {
  bestModelName: string;
  bestModelScore: number;
  generatedAt: string;
  message?: string;
  models: ModelComparisonRow[];
  ready: boolean;
  reportMeta?: string;
}

interface TelemetryData {
  status: string;
  uptime_seconds: number;
  total_requests: number;
  total_errors: number;
  throughput_rpm: number;
  latency_ms: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  distribution: {
    phishing: number;
    legitimate: number;
    phishing_percentage: number;
    legitimate_percentage: number;
  };
  drift: {
    status: string;
    score: number;
    threshold: number;
    samples_analyzed: number;
    top_drifting_features: Array<{
      feature: string;
      baseline_mean: number;
      live_mean: number;
      shift: number;
      relative_deviation: number;
    }>;
  };
  system: {
    active_model: string;
    framework: string;
    drift_engine: string;
  };
}

export type {
  AppStatus,
  AuthCredentials,
  AuthSession,
  AuthUser,
  CsvPrediction,
  GeminiExplanationUpdate,
  ModelComparisonReport,
  ModelComparisonRow,
  PredictionHistoryResponse,
  TelemetryData,
  UrlFeature,
  UrlPrediction,
};
