import { ShieldCheck, Target, Zap, Code2 } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#04080e]/95 py-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-6 px-4 text-xs sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-500/10 text-blue-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="block font-bold text-white text-sm">10K+</span>
            <span className="text-slate-400">URLs Analyzed</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-red-500/10 text-red-400">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <span className="block font-bold text-white text-sm">97.1%</span>
            <span className="text-slate-400">Model F1-Score</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <span className="block font-bold text-white text-sm">Real-time</span>
            <span className="text-slate-400">Threat Detection</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-purple-500/10 text-purple-400">
            <Code2 className="h-4 w-4" />
          </div>
          <div>
            <span className="block font-bold text-white text-sm">Open Source</span>
            <span className="text-slate-400">ML-Powered Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
