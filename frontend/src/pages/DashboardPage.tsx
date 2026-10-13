import { BarChart3 } from "lucide-react";

import { AuthRequiredPanel } from "../components/auth/AuthRequiredPanel";
import { HistoryList } from "../components/dashboard/HistoryList";
import { SignalDistributionChart } from "../components/dashboard/SignalDistributionChart";
import { StatusCards } from "../components/dashboard/StatusCards";
import { MiniMetric } from "../components/common/MiniMetric";
import { Badge } from "../components/ui/badge";
import type { AppStatus, AuthUser, UrlPrediction } from "../lib/types";

interface DashboardPageProps {
  history: UrlPrediction[];
  signalData: Array<{ color: string; name: string; value: number }>;
  status: AppStatus;
  urlResult: UrlPrediction | null;
  user: AuthUser | null;
}

function DashboardPage({ history, signalData, status, urlResult, user }: DashboardPageProps) {
  const phishingCount = history.filter((item) => item.label === "Phishing").length;
  const legitimateCount = history.filter((item) => item.label === "Legitimate").length;

  return (
    <main className="bg-white px-4 py-16 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <Badge className="mb-3 border-teal-200 bg-teal-50 text-teal-800">
              <BarChart3 className="h-3.5 w-3.5" />
              Dashboard
            </Badge>
            <h1 className="text-3xl font-semibold sm:text-4xl">Operational monitoring view</h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            {user
              ? `Status, ${user.name}'s MongoDB-backed history, and signal distribution are grouped for fast scanning.`
              : "System status is visible now. Sign in to load your saved prediction history and signal distribution."}
          </p>
        </div>

        <StatusCards historyCount={history.length} status={status} />

        {user ? (
          <>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <MiniMetric label="Phishing saved" value={phishingCount.toLocaleString()} tone="danger" />
              <MiniMetric label="Legitimate saved" value={legitimateCount.toLocaleString()} tone="good" />
              <MiniMetric label="Latest suspicious signals" value={urlResult ? urlResult.signals.suspicious.toLocaleString() : "No scans"} tone="neutral" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <SignalDistributionChart signalData={signalData} />
              <HistoryList history={history.slice(0, 5)} latestUrl={urlResult?.finalUrl} />
            </div>
          </>
        ) : (
          <div className="mt-6">
            <AuthRequiredPanel />
          </div>
        )}
      </div>
    </main>
  );
}

export { DashboardPage };
