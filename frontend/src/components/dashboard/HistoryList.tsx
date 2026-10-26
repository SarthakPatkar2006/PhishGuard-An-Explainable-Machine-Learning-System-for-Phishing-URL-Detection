import { History, Link2, ExternalLink, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatScanTime } from "../../lib/format";
import type { UrlPrediction } from "../../lib/types";

interface HistoryListProps {
  history: UrlPrediction[];
  latestUrl?: string;
  variant?: "compact" | "full";
}

function HistoryList({ history, variant = "compact" }: HistoryListProps) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#071322]/85 p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">Recent URL Checks</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Latest analyzed URLs with predictions and threat signals.</p>
        </div>

        {variant === "compact" && (
          <Link
            to="/history"
            className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20 transition"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="space-y-2.5 overflow-y-auto max-h-[290px] pr-1">
        {history.length ? (
          history.map((item, index) => (
            <div
              key={item.historyId ?? `${item.url}-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-cyan-500/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Link2 className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-slate-200 hover:text-cyan-300 truncate"
                  >
                    <span className="truncate max-w-[220px] sm:max-w-xs">{item.url}</span>
                    <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" />
                  </a>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formatScanTime(item.createdAt)} • <span className="text-slate-300">{item.signals.suspicious} suspicious signal{item.signals.suspicious !== 1 ? "s" : ""}</span>
                  </p>
                </div>
              </div>

              {/* Status Pill Badge */}
              <div
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold border flex items-center gap-1 ${
                  item.label === "Legitimate"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                    : "border-red-500/40 bg-red-500/10 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                }`}
              >
                <span>{item.label === "Legitimate" ? "✔" : "✖"}</span>
                <span>{item.label}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No URL scans recorded yet. Run a prediction on the Analyze page to view live history.
          </div>
        )}
      </div>
    </div>
  );
}

export { HistoryList };
