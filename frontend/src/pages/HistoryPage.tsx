import { Database } from "lucide-react";

import { AuthRequiredPanel } from "../components/auth/AuthRequiredPanel";
import { HistoryList } from "../components/dashboard/HistoryList";
import { MiniMetric } from "../components/common/MiniMetric";
import { Badge } from "../components/ui/badge";
import type { AuthUser, UrlPrediction } from "../lib/types";

function HistoryPage({ history, user }: { history: UrlPrediction[]; user: AuthUser | null }) {
  const phishingCount = history.filter((item) => item.label === "Phishing").length;
  const legitimateCount = history.filter((item) => item.label === "Legitimate").length;
  const suspiciousSignalCount = history.reduce((total, item) => total + item.signals.suspicious, 0);

  return (
    <main className="relative isolate px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <Badge className="mb-3 border-cyan-500/30 bg-cyan-950/40 text-cyan-300">
              <Database className="h-3.5 w-3.5 mr-1 text-cyan-400" />
              MongoDB Scan History
            </Badge>
            <h1 className="text-3xl font-extrabold sm:text-4xl text-white">Saved URL Predictions</h1>
          </div>
          <p className="max-w-xl text-xs sm:text-sm leading-6 text-slate-300">
            {user
              ? `Showing saved URL predictions for ${user.name}.`
              : "Sign in to load saved URL predictions from your account."}
          </p>
        </div>

        {user ? (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <MiniMetric label="Total saved" value={history.length.toLocaleString()} tone="neutral" />
              <MiniMetric label="Phishing saved" value={phishingCount.toLocaleString()} tone="danger" />
              <MiniMetric label="Suspicious signals" value={history.length ? suspiciousSignalCount.toLocaleString() : "No scans"} tone={legitimateCount >= phishingCount ? "good" : "danger"} />
            </div>

            <HistoryList history={history} variant="full" />
          </>
        ) : (
          <AuthRequiredPanel />
        )}
      </div>
    </main>
  );
}

export { HistoryPage };
