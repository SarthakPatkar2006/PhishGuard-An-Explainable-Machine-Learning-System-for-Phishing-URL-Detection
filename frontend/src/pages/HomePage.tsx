import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Sparkles, Zap, Activity } from "lucide-react";
import { Link } from "react-router-dom";

import { FeatureGrid } from "../components/home/FeatureGrid";
import { HeroPreview } from "../components/home/HeroPreview";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import type { AuthUser } from "../lib/types";

function HomePage({ user }: { user: AuthUser | null }) {
  const primaryLink = user ? "/analyze" : "/auth";

  return (
    <main className="relative isolate overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />
      <div className="absolute top-1/2 right-1/4 -z-10 h-96 w-96 rounded-full bg-blue-600/10 blur-[130px]" />

      {/* Hero section */}
      <section className="relative mx-auto grid min-h-[600px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <Badge className="mb-4 border-cyan-500/30 bg-cyan-950/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 mr-1" />
            Next-Gen Phishing Detection
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
            Detect <span className="text-gradient-cyan">Phishing URLs</span> with Explainable AI
          </h1>

          <p className="mt-5 text-sm sm:text-base leading-relaxed text-slate-300">
            Enterprise network defense powered by Random Forest and XGBoost with Tree SHAP explainability and Google Gemini reasoning.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              30 Live URL Signals
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              Sub-second Scoring
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Gemini 2.5 Flash
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:opacity-95">
              <Link to={primaryLink}>
                {user ? "Open Scanner" : "Get Started Now"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-xl border-white/15 bg-white/5 text-slate-200 hover:bg-white/10">
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
      <section className="border-t border-white/10 bg-[#050a12]/70 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl text-white">Full-Stack Network Threat Intelligence</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              End-to-end Machine Learning pipeline versioned with DVC, tracked via MLflow, and deployed with Docker.
            </p>
          </div>
          <FeatureGrid />
        </div>
      </section>
    </main>
  );
}

export { HomePage };
