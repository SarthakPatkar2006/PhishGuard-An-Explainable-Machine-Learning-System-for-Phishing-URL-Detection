import { Cpu, Database, Sparkles, Files, Activity, Settings2 } from "lucide-react";
import type { AppStatus } from "../../lib/types";

function StatusCards({ historyCount, status }: { historyCount: number; status: AppStatus }) {
  return (
    <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Model Status */}
      <div className="rounded-2xl border border-cyan-500/20 bg-[#071322]/80 p-4 shadow-lg backdrop-blur-md transition hover:border-cyan-500/40">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Model Status</span>
                <span className="rounded bg-cyan-950/80 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-500/30">v1.0.0</span>
              </div>
              <h3 className="text-lg font-bold text-emerald-400 mt-0.5">{status.model.status}</h3>
            </div>
          </div>
        </div>
        <p className="mt-2.5 text-[11px] text-slate-400 truncate">Last trained: {status.model.meta || "Production ready"}</p>
      </div>

      {/* 2. MongoDB Status */}
      <div className="rounded-2xl border border-cyan-500/20 bg-[#071322]/80 p-4 shadow-lg backdrop-blur-md transition hover:border-cyan-500/40">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="h-5 w-5" />
            </span>
            <div>
              <span className="text-xs font-semibold text-slate-400">MongoDB</span>
              <h3 className="text-lg font-bold text-emerald-400 mt-0.5">{status.mongo.status}</h3>
            </div>
          </div>
          <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
        </div>
        <p className="mt-2.5 text-[11px] text-slate-400 truncate">Prediction history + data source</p>
      </div>

      {/* 3. Gemini AI Status */}
      <div className="rounded-2xl border border-purple-500/20 bg-[#0d1026]/80 p-4 shadow-lg backdrop-blur-md transition hover:border-purple-500/40">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <span className="text-xs font-semibold text-slate-400">Gemini</span>
              <h3 className="text-lg font-bold text-purple-300 mt-0.5">{status.gemini.status}</h3>
            </div>
          </div>
          <Settings2 className="h-4 w-4 text-purple-400" />
        </div>
        <p className="mt-2.5 text-[11px] text-slate-400 truncate">{status.gemini.meta || "gemini-2.5-flash"}</p>
      </div>

      {/* 4. Saved Scans Count */}
      <div className="rounded-2xl border border-blue-500/20 bg-[#071322]/80 p-4 shadow-lg backdrop-blur-md transition hover:border-blue-500/40">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Files className="h-5 w-5" />
            </span>
            <div>
              <span className="text-xs font-semibold text-slate-400">Saved Scans</span>
              <h3 className="text-lg font-bold text-white mt-0.5">{historyCount.toLocaleString()}</h3>
            </div>
          </div>
          <Database className="h-4 w-4 text-blue-400" />
        </div>
        <p className="mt-2.5 text-[11px] text-slate-400 truncate">Recent records loaded</p>
      </div>
    </div>
  );
}

export { StatusCards };
