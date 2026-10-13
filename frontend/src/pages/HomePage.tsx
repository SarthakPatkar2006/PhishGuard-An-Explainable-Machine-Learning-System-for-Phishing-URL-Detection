import { motion } from "framer-motion";
import { ArrowRight, FileSpreadsheet, Radar, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import heroImg from "../assets/hero.png";
import { FeatureGrid } from "../components/home/FeatureGrid";
import { HeroPreview } from "../components/home/HeroPreview";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import type { AuthUser } from "../lib/types";

function HomePage({ user }: { user: AuthUser | null }) {
  const primaryLink = user ? "/analyze" : "/auth";
  const secondaryLink = user ? "/dashboard" : "/about";

  return (
    <main>
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#071114]">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#071114_0%,#0f2a2e_45%,#111827_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25" />
        <img
          alt="Layered detection system visual"
          className="absolute right-0 top-24 hidden w-[30rem] opacity-20 mix-blend-screen lg:block"
          src={heroImg}
        />

        <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_0.9fr] lg:px-8">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.55 }}
          >
            <Badge className="mb-6 border-teal-300/30 bg-teal-300/10 text-teal-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              ML phishing intelligence
            </Badge>
            <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
              Network Security Console
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              A premium workspace for phishing detection: check a single URL, score batch CSV files, and turn model output into clear security decisions.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5 text-sm text-slate-200">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2">
                <Radar className="h-4 w-4 text-teal-300" />
                30 URL signals
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2">
                <FileSpreadsheet className="h-4 w-4 text-sky-300" />
                Batch scoring
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2">
                <Sparkles className="h-4 w-4 text-amber-300" />
                Gemini summary
              </span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to={primaryLink}>
                  {user ? "Start analysis" : "Login to start"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to={secondaryLink}>{user ? "View dashboard" : "View project"}</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div animate={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.96 }} transition={{ delay: 0.15, duration: 0.5 }}>
            <HeroPreview />
          </motion.div>
        </div>
      </section>

      <section className="bg-[#f3f7f8] px-4 py-16 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <h2 className="text-3xl font-semibold sm:text-4xl">What the console covers</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              A focused product surface for the core security workflow: extract signals, classify risk, and explain the result.
            </p>
          </div>
          <FeatureGrid />
        </div>
      </section>
    </main>
  );
}

export { HomePage };
