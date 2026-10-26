import { motion } from "framer-motion";
import { Zap, Target, Cpu, ShieldCheck, CheckCircle, ShieldAlert, Globe } from "lucide-react";
import type { FormEvent } from "react";

import { PredictionInput } from "../components/prediction/PredictionInput";
import { ResultPanel } from "../components/prediction/ResultPanel";
import type { ActiveResult } from "../hooks/usePredictionWorkspace";
import type { AuthUser, CsvPrediction, UrlPrediction } from "../lib/types";
import cyberBgImage from "../assets/cyber-bg.jpg";

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
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden">
      {/* 1. High-Resolution Cyber Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 brightness-110 contrast-125"
        style={{ backgroundImage: `url(${cyberBgImage})` }}
      />
      {/* 2. Deep ambient cyber gradients for rich contrast */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#030712]/80 via-[#040915]/60 to-[#030712]/95" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Header Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-950/60 px-3 py-1 text-xs font-bold text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span>AI-Powered Security</span>
            </div>
            
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl text-white drop-shadow-md">
              Detect <span className="text-gradient-cyan">Phishing</span> URLs with AI
            </h1>
            <p className="mt-2.5 max-w-2xl text-xs sm:text-sm text-slate-200 font-medium leading-relaxed drop-shadow">
              Analyze suspicious websites, detect phishing attempts in milliseconds, and stay safe online with machine learning powered security.
            </p>
          </div>

          {/* Quick Feature Badges from reference image */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/15 bg-slate-900/80 shadow-lg backdrop-blur-md text-center">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/20 text-amber-400 mb-1.5">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-bold text-white">Fast Analysis</span>
              <span className="text-[10px] text-slate-400">Under 1.5s</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/15 bg-slate-900/80 shadow-lg backdrop-blur-md text-center">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-pink-500/20 text-pink-400 mb-1.5">
                <Target className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-bold text-white">High Accuracy</span>
              <span className="text-[10px] text-slate-400">97.1% F1</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/15 bg-slate-900/80 shadow-lg backdrop-blur-md text-center">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 mb-1.5">
                <Cpu className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-bold text-white">ML-Powered</span>
              <span className="text-[10px] text-slate-400">Tree SHAP</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/15 bg-slate-900/80 shadow-lg backdrop-blur-md text-center">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/20 text-blue-400 mb-1.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-bold text-white">Secure & Reliable</span>
              <span className="text-[10px] text-slate-400">30 URL signals</span>
            </div>
          </div>
        </div>

        {/* 2-Column Main Workspace with High Visibility Panels */}
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

        {/* Bottom Floating Status Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/50 px-4 py-2 text-emerald-300 shadow-lg backdrop-blur-md">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            Safe Browsing Guard Active
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/50 px-4 py-2 text-cyan-300 shadow-lg backdrop-blur-md">
            <Globe className="h-4 w-4 text-cyan-400" />
            Real-time Anchor & SSL Verification
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/50 px-4 py-2 text-red-300 shadow-lg backdrop-blur-md">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            Automated Phishing Defense
          </div>
        </div>
      </div>
    </div>
  );
}

export { AnalyzePage };
