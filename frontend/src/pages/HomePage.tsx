import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Sparkles, Zap, Activity } from "lucide-react";
import { Link } from "react-router-dom";

import { FeatureGrid } from "../components/home/FeatureGrid";
import { HeroPreview } from "../components/home/HeroPreview";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import type { AuthUser } from "../lib/types";
import cyberBgImage from "../assets/cyber-bg.jpg";

function HomePage({ user }: { user: AuthUser | null }) {
  const primaryLink = user ? "/analyze" : "/auth";

  return (
    <div className="relative isolate min-h-[calc(100vh-65px)] overflow-hidden">
      {/* 1. High-Resolution Cyber Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-45 brightness-110 contrast-125"
        style={{ backgroundImage: `url(${cyberBgImage})` }}
      />
      {/* 2. Deep gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#030712]/80 via-[#040915]/60 to-[#030712]/95" />

      {/* Main Content */}
      <div className="relative z-10">
        <section className="mx-auto grid min-h-[600px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 border-cyan-400/40 bg-cyan-950/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 mr-1" />
              Next-Gen Phishing Detection
            </Badge>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15] drop-shadow-lg">
              Detect <span className="text-gradient-cyan">Phishing URLs</span> with Explainable AI
            </h1>

            <p className="mt-5 text-sm sm:text-base leading-relaxed text-slate-200 font-medium drop-shadow">
              Enterprise network defense powered by Random Forest and XGBoost with Tree SHAP explainability and Google Gemini reasoning.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5 text-xs font-semibold text-slate-200">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-900/80 px-3.5 py-2 shadow-md backdrop-blur-md">
                <Activity className="h-4 w-4 text-cyan-400" />
                30 Live URL Signals
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-900/80 px-3.5 py-2 shadow-md backdrop-blur-md">
                <Zap className="h-4 w-4 text-emerald-400" />
                Sub-second Scoring
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-900/80 px-3.5 py-2 shadow-md backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Gemini 2.5 Flash
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white font-bold shadow-xl shadow-cyan-500/30 hover:opacity-95">
                <Link to={primaryLink}>
                  {user ? "Open Scanner" : "Get Started Now"}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-xl border border-white/20 bg-slate-900/80 text-slate-200 hover:bg-slate-800">
                <Link to="/models">
                  <BarChart3 className="h-4 w-4 mr-1.5 text-cyan-400" />
                  View Benchmark Models
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div animate={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.95 }} transition={{ delay: 0.1, duration: 0.45 }}>
            <HeroPreview />
          </motion.div>
        </section>

        {/* Feature showcase section */}
        <section className="border-t border-white/10 bg-[#040812]/80 backdrop-blur-xl py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-black sm:text-3xl text-white">Full-Stack Network Threat Intelligence</h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium">
                End-to-end Machine Learning pipeline versioned with DVC, tracked via MLflow, and deployed with Docker.
              </p>
            </div>
            <FeatureGrid />
          </div>
        </section>
      </div>
    </div>
  );
}

export { HomePage };
