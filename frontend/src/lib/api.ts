import type {
  AppStatus,
  AuthCredentials,
  AuthSession,
  AuthUser,
  CsvPrediction,
  ModelComparisonReport,
  PredictionHistoryResponse,
  UrlPrediction,
} from "./types";

const authTokenStorageKey = "network-security-auth-token";
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

const mockStatus: AppStatus = {
  gemini: { meta: "gemini-3.5-flash", ready: true, status: "Configured" },
  model: { meta: "1,655 KB | local artifact", ready: true, status: "Ready" },
  modelComparison: { meta: "Run training to generate report", ready: false, status: "Not generated" },
  mongo: { meta: "Local development connection", ready: true, status: "Configured" },
  output: { meta: "No predictions yet", ready: false, status: "Waiting" },
  preprocessor: { meta: "2,333 KB | local artifact", ready: true, status: "Ready" },
  repo: { name: "Sahilpatil009/network-security-edi", url: "https://dagshub.com/Sahilpatil009/network-security-edi" },
  sampleData: { meta: "Sample phishing feature CSV", ready: true, status: "Available" },
};

const mockModelComparison: ModelComparisonReport = {
  bestModelName: "",
  bestModelScore: 0,
  generatedAt: "",
  message: "Run model training to generate a model comparison report.",
  models: [],
  ready: false,
};

const mockPrediction: UrlPrediction = {
  createdAt: new Date().toISOString(),
  dnsStatus: "Resolved",
  explanationSource: "Gemini",
  features: [
    { name: "having_IP_Address", signal: "Normal", value: 1 },
    { name: "URL_Length", signal: "Normal", value: 1 },
    { name: "Shortining_Service", signal: "Normal", value: 1 },
    { name: "SSLfinal_State", signal: "Normal", value: 1 },
    { name: "Page_Rank", signal: "Suspicious", value: -1 },
  ],
  finalUrl: "https://example.com/login",
  historyId: "mock-history-item",
  hostname: "example.com",
  htmlStatus: "Fetched",
  label: "Legitimate",
  prediction: 1,
  signals: { neutral: 4, normal: 22, suspicious: 4 },
  shap: {
    available: true,
    message: "Top model feature contributions for this prediction.",
    method: "Tree SHAP",
    topFeatures: [
      { contribution: 0.18, direction: "Supports selected prediction", name: "SSLfinal_State", value: 1 },
      { contribution: -0.08, direction: "Counters selected prediction", name: "Page_Rank", value: -1 },
    ],
  },
  statusClass: "good",
  summary:
    "The model predicted this URL as Legitimate. Most structural signals look normal, but a few metadata checks remain uncertain, so verify the domain before sharing passwords.",
  url: "https://example.com/login",
};

function getStoredAuthToken() {
  return window.localStorage.getItem(authTokenStorageKey);
}

function saveAuthToken(token: string) {
  window.localStorage.setItem(authTokenStorageKey, token);
}

function clearAuthToken() {
  window.localStorage.removeItem(authTokenStorageKey);
}

function authHeaders(extraHeaders: Record<string, string> = {}): HeadersInit {
  const token = getStoredAuthToken();
  return {
    ...(apiBaseUrl.includes(".loca.lt") ? { "bypass-tunnel-reminder": "true" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  const responseText = await response.text();
  let payload = {} as T & { detail?: string; error?: string; message?: string };
  try {
    payload = responseText ? JSON.parse(responseText) : payload;
  } catch {
    payload = {} as T & { detail?: string; error?: string; message?: string };
  }
  if (!response.ok || payload.error) {
    const fallbackMessage = responseText ? responseText.slice(0, 180) : `Request failed with status ${response.status}.`;
    throw new Error(payload.message || payload.error || payload.detail || fallbackMessage);
  }
  return payload;
}

async function requestAuth(endpoint: "/api/auth/login" | "/api/auth/signup", payload: AuthCredentials): Promise<AuthSession> {
  const response = await fetch(apiUrl(endpoint), {
    body: JSON.stringify(payload),
    headers: authHeaders({ "Content-Type": "application/json" }),
    method: "POST",
  });
  const session = await parseJson<AuthSession>(response);
  saveAuthToken(session.token);
  return session;
}

async function login(credentials: AuthCredentials): Promise<AuthSession> {
  return requestAuth("/api/auth/login", credentials);
}

async function signup(credentials: AuthCredentials): Promise<AuthSession> {
  return requestAuth("/api/auth/signup", credentials);
}

async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getStoredAuthToken();
  if (!token) {
    return null;
  }
  try {
    const response = await fetch(apiUrl("/api/auth/me"), { headers: authHeaders() });
    const payload = await parseJson<{ user: AuthUser }>(response);
    return payload.user;
  } catch (error) {
    clearAuthToken();
    throw error;
  }
}

async function logout(): Promise<void> {
  await fetch(apiUrl("/api/auth/logout"), {
    headers: authHeaders(),
    method: "POST",
  }).catch(() => undefined);
  clearAuthToken();
}

async function getStatus(): Promise<AppStatus> {
  const response = await fetch(apiUrl("/api/status"), { headers: authHeaders() });
  return parseJson<AppStatus>(response);
}

async function getPredictionHistory(limit = 10): Promise<UrlPrediction[]> {
  const response = await fetch(apiUrl(`/api/prediction-history?limit=${limit}`), {
    headers: authHeaders(),
  });
  const payload = await parseJson<PredictionHistoryResponse>(response);
  return payload.items;
}

async function getModelComparison(): Promise<ModelComparisonReport> {
  const response = await fetch(apiUrl("/api/model-comparison"), { headers: authHeaders() });
  return parseJson<ModelComparisonReport>(response);
}

async function predictUrl(url: string): Promise<UrlPrediction> {
  const body = new FormData();
  body.append("url", url);
  const response = await fetch(apiUrl("/api/predict-url"), {
    body,
    headers: authHeaders(),
    method: "POST",
  });
  return parseJson<UrlPrediction>(response);
}

async function predictCsv(file: File): Promise<CsvPrediction> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(apiUrl("/api/predict-csv"), {
    body,
    headers: authHeaders(),
    method: "POST",
  });
  return parseJson<CsvPrediction>(response);
}

async function askSecurityQuestion(question: string, result: UrlPrediction): Promise<string> {
  const response = await fetch(apiUrl("/api/security-chat"), {
    body: JSON.stringify({
      label: result.label,
      question,
      shap_factors: result.shap?.topFeatures ?? [],
      suspicious_features: result.suspiciousFeatures ?? result.features.filter((feature) => feature.signal === "Suspicious").map((feature) => feature.name),
      url: result.url,
    }),
    headers: authHeaders({ "Content-Type": "application/json" }),
    method: "POST",
  });
  const payload = await parseJson<{ answer: string }>(response);
  return payload.answer;
}

export {
  clearAuthToken,
  apiUrl,
  askSecurityQuestion,
  getCurrentUser,
  getModelComparison,
  getPredictionHistory,
  getStatus,
  getStoredAuthToken,
  login,
  logout,
  mockModelComparison,
  mockPrediction,
  mockStatus,
  predictCsv,
  predictUrl,
  signup,
};
