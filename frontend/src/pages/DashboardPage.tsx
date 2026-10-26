import { BarChart3, Clock, AlertTriangle, ShieldCheck, ShieldAlert, ArrowUpRight, ArrowDownRight } from "lucide-react";

import { AuthRequiredPanel } from "../components/auth/AuthRequiredPanel";
import { HistoryList } from "../components/dashboard/HistoryList";
import { SignalDistributionChart } from "../components/dashboard/SignalDistributionChart";
import { StatusCards } from "../components/dashboard/StatusCards";
import type { AppStatus, AuthUser, UrlPrediction } from "../lib/types";
import cyberBgImage from "../assets/cyber-bg.jpg";

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
  const latestSuspicious = urlResult ? urlResult.signals.suspicious : (history[0]?.signals.suspicious ?? 0);

  const formattedTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formattedDate = new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden">
      {/* 1. Cyber Wall Backdrop */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-35 brightness-110 contrast-125"
        style={{ backgroundImage: `url(${cyberBgImage})` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#030712]/85 via-[#040915]/75 to-[#030712]/95" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Header Section matching design */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-950/60 px-3 py-1 text-xs font-bold text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Live Dashboard</span>
            </div>
            
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-white drop-shadow-md">
              Security & <span className="text-gradient-cyan">Operational Metrics</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 font-medium">
              Real-time insights into phishing detection, model performance, and system activity.
            </p>
          </div>

          {/* Time & System Online status pill */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-2.5 px-4 shadow-xl backdrop-blur-md">
            <Clock className="h-4 w-4 text-cyan-400" />
            <div className="text-right">
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Last updated</span>
              <span className="block text-xs font-bold text-white font-mono">{formattedDate} {formattedTime}</span>
            </div>
            <div className="ml-2 h-6 w-px bg-white/10" />
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </div>
          </div>
        </div>

        {/* 1. Top 4 System Status Cards */}
        <StatusCards historyCount={history.length} status={status} />

        {/* 2. Middle 3 Core Security Metric Banners */}
        <div className="mt-4 grid gap-3.5 md:grid-cols-3">
          {/* Phishing URLs Detected */}
          <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 to-slate-900/80 p-4 shadow-xl backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                <ShieldAlert className="h-6 w-6" />
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-300">Phishing URLs Detected</span>
                <h3 className="text-2xl font-black text-red-400 mt-0.5">{phishingCount.toLocaleString()}</h3>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-950/60 px-2 py-1 rounded-lg border border-red-500/20">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+12%</span>
            </div>
          </div>

          {/* Legitimate URLs Detected */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 to-slate-900/80 p-4 shadow-xl backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-300">Legitimate URLs Detected</span>
                <h3 className="text-2xl font-black text-emerald-400 mt-0.5">{legitimateCount.toLocaleString()}</h3>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/20">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+8%</span>
            </div>
          </div>

          {/* Latest Suspicious Signals */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 to-slate-900/80 p-4 shadow-xl backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-300">Latest Suspicious Signals</span>
                <h3 className="text-2xl font-black text-amber-400 mt-0.5">{latestSuspicious.toLocaleString()}</h3>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-500/20">
              <ArrowDownRight className="h-3.5 w-3.5" />
              <span>-5%</span>
            </div>
          </div>
        </div>

        {/* 3. Bottom 2-Column Section: Chart & Recent URL Checks */}
        {user ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] items-start">
            <SignalDistributionChart signalData={signalData} />
            <HistoryList history={history.slice(0, 5)} latestUrl={urlResult?.finalUrl} />
          </div>
        ) : (
          <div className="mt-6">
            <AuthRequiredPanel />
          </div>
        )}
      </div>
    </div>
  );
}

export { DashboardPage };
