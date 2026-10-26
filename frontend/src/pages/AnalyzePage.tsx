import { motion } from "framer-motion";
import { Zap, Target, Cpu, ShieldCheck, CheckCircle, ShieldAlert, Globe } from "lucide-react";
import type { FormEvent } from "react";

import { PredictionInput } from "../components/prediction/PredictionInput";
import { ResultPanel } from "../components/prediction/ResultPanel";
import type { ActiveResult } from "../hooks/usePredictionWorkspace";
import type { AuthUser, CsvPrediction, UrlPrediction } from "../lib/types";

interface AnalyzePageProps {
  activeResult: ActiveResult;
  csvResult: CsvPrediction | null;
  error: string;
  isCheckingUrl: boolean;
  isUploadingCsv: boolean;
  onCsvSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUrlSubmit: (event: FormEvent<HTMLFormElement>) => void;
  setUrl: (value: string) => void;
  url: string;
  urlResult: UrlPrediction | null;
  user: AuthUser | null;
}

function AnalyzePage({
  activeResult,
  csvResult,
  error,
  isCheckingUrl,
  isUploadingCsv,
  onCsvSubmit,
  onUrlSubmit,
  setUrl,
  url,
  urlResult,
}: AnalyzePageProps) {
  return (
    <main className="relative isolate px-4 py-8 sm:px-6 lg:px-8">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />
      <div className="absolute top-1/3 right-10 -z-10 h-80 w-80 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl">
        {/* Top Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span>AI-Powered Security</span>
            </div>
            
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white">
              Detect <span className="text-gradient-cyan">Phishing</span> URLs with AI
            </h1>
            <p className="mt-2.5 max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Analyze suspicious websites, detect phishing attempts in milliseconds, and stay safe online with machine learning powered security.
            </p>
          </div>

          {/* Quick Feature Badges from reference image */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur text-center">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10 text-amber-400 mb-1.5">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-bold text-white">Fast Analysis</span>
              <span className="text-[10px] text-slate-400">Under 1.5s</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur text-center">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-pink-500/10 text-pink-400 mb-1.5">
                <Target className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-bold text-white">High Accuracy</span>
              <span className="text-[10px] text-slate-400">97.1% F1</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur text-center">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400 mb-1.5">
                <Cpu className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-bold text-white">ML-Powered</span>
              <span className="text-[10px] text-slate-400">Tree SHAP</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur text-center">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/10 text-blue-400 mb-1.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-bold text-white">Secure & Reliable</span>
              <span className="text-[10px] text-slate-400">30 URL signals</span>
            </div>
          </div>
        </div>

        {/* 2-Column Main Workspace */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4 }}
          className="grid gap-6 lg:grid-cols-2 items-start"
        >
          <PredictionInput
            error={error}
            isCheckingUrl={isCheckingUrl}
            isUploadingCsv={isUploadingCsv}
            onCsvSubmit={onCsvSubmit}
            onUrlSubmit={onUrlSubmit}
            setUrl={setUrl}
            url={url}
          />
          <ResultPanel activeResult={activeResult} csvResult={csvResult} urlResult={urlResult} />
        </motion.div>

        {/* Decorative Side Floating Badges / Graphic simulation */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-3.5 py-2 text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            Safe Browsing Guard Active
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-3.5 py-2 text-cyan-400">
            <Globe className="h-4 w-4" />
            Real-time Anchor & SSL Verification
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 px-3.5 py-2 text-red-400">
            <ShieldAlert className="h-4 w-4" />
            Automated Phishing Defense
          </div>
        </div>
      </div>
    </main>
  );
}

export { AnalyzePage };
