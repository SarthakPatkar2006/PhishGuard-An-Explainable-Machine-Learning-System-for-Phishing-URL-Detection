import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  getCurrentUser,
  getModelComparison,
  getPredictionHistory,
  getStatus,
  login,
  logout,
  mockModelComparison,
  mockStatus,
  predictCsv,
  predictUrl,
  signup,
} from "../lib/api";
import { signalColors } from "../lib/ui-data";
import type { AppStatus, AuthCredentials, AuthUser, CsvPrediction, ModelComparisonReport, UrlPrediction } from "../lib/types";

type ActiveResult = "empty" | "url" | "csv";

function usePredictionWorkspace() {
  const [status, setStatus] = useState<AppStatus>(mockStatus);
  const [modelComparison, setModelComparison] = useState<ModelComparisonReport>(mockModelComparison);
  const [url, setUrl] = useState("https://example.com/login");
  const [urlResult, setUrlResult] = useState<UrlPrediction | null>(null);
  const [csvResult, setCsvResult] = useState<CsvPrediction | null>(null);
  const [activeResult, setActiveResult] = useState<ActiveResult>("empty");
  const [history, setHistory] = useState<UrlPrediction[]>([]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState("");

  const resetProtectedWorkspace = useCallback(() => {
    setStatus(mockStatus);
    setModelComparison(mockModelComparison);
    setHistory([]);
    setUrlResult(null);
    setCsvResult(null);
    setActiveResult("empty");
  }, []);

  const loadProtectedWorkspace = useCallback(async () => {
    const [nextStatus, nextModelComparison, nextHistory] = await Promise.all([
      getStatus().catch(() => mockStatus),
      getModelComparison().catch(() => mockModelComparison),
      getPredictionHistory(20).catch(() => []),
    ]);

    setStatus(nextStatus);
    setModelComparison(nextModelComparison);
    setHistory(nextHistory);
  }, []);

  useEffect(() => {
    getCurrentUser()
      .then(async (user) => {
        setAuthUser(user);
        if (user) {
          await loadProtectedWorkspace();
        } else {
          resetProtectedWorkspace();
        }
      })
      .catch(() => {
        setAuthUser(null);
        resetProtectedWorkspace();
      })
      .finally(() => setIsAuthLoading(false));
  }, [loadProtectedWorkspace, resetProtectedWorkspace]);

  const latestUrlResult = urlResult ?? history[0] ?? null;

  const signalData = useMemo(
    () =>
      latestUrlResult
        ? [
            { name: "Suspicious", value: latestUrlResult.signals.suspicious, color: signalColors.suspicious },
            { name: "Neutral", value: latestUrlResult.signals.neutral, color: signalColors.neutral },
            { name: "Normal", value: latestUrlResult.signals.normal, color: signalColors.normal },
          ]
        : [
            { name: "Suspicious", value: 8, color: signalColors.suspicious },
            { name: "Neutral", value: 5, color: signalColors.neutral },
            { name: "Normal", value: 17, color: signalColors.normal },
          ],
    [latestUrlResult],
  );

  async function handleUrlSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsCheckingUrl(true);
    try {
      const result = await predictUrl(url);
      setUrlResult(result);
      setActiveResult("url");
      if (authUser) {
        setHistory((current) => [result, ...current].slice(0, 20));
      }
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to analyze this URL.");
    } finally {
      setIsCheckingUrl(false);
    }
  }

  async function handleCsvSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("csvFile") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      setError("Choose a CSV file before running batch prediction.");
      return;
    }

    setIsUploadingCsv(true);
    try {
      const result = await predictCsv(file);
      setCsvResult(result);
      setActiveResult("csv");
      form.reset();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to process the CSV.");
    } finally {
      setIsUploadingCsv(false);
    }
  }

  async function handleLogin(credentials: AuthCredentials) {
    setAuthError("");
    setIsAuthSubmitting(true);
    try {
      const session = await login(credentials);
      setAuthUser(session.user);
      await loadProtectedWorkspace();
    } catch (apiError) {
      setAuthError(apiError instanceof Error ? apiError.message : "Unable to sign in.");
      throw apiError;
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function handleSignup(credentials: AuthCredentials) {
    setAuthError("");
    setIsAuthSubmitting(true);
    try {
      const session = await signup(credentials);
      setAuthUser(session.user);
      await loadProtectedWorkspace();
    } catch (apiError) {
      setAuthError(apiError instanceof Error ? apiError.message : "Unable to create account.");
      throw apiError;
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function handleLogout() {
    setAuthError("");
    await logout();
    setAuthUser(null);
    resetProtectedWorkspace();
  }

  return {
    activeResult,
    authError,
    authUser,
    csvResult,
    error,
    handleCsvSubmit,
    handleLogin,
    handleLogout,
    handleSignup,
    handleUrlSubmit,
    history,
    isAuthLoading,
    isAuthSubmitting,
    isCheckingUrl,
    isUploadingCsv,
    latestUrlResult,
    modelComparison,
    setUrl,
    signalData,
    status,
    url,
    urlResult,
  };
}

export { usePredictionWorkspace };
export type { ActiveResult };
