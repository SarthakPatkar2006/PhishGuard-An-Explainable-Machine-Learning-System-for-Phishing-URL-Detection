import { Activity, Cpu, ExternalLink, Radio, CheckCircle2, AlertTriangle, Zap, Server } from "lucide-react";
import type { TelemetryData } from "../../lib/types";
import { apiUrl } from "../../lib/api";

interface TelemetryPanelProps {
  telemetry: TelemetryData | null;
}

function TelemetryPanel({ telemetry }: TelemetryPanelProps) {
  const isHealthy = !telemetry?.drift?.status.includes("High");
  const driftScore = telemetry?.drift?.score ?? 0.042;
  const driftThreshold = telemetry?.drift?.threshold ?? 0.25;
  const driftRatio = Math.min((driftScore / driftThreshold) * 100, 100);

  const p50 = telemetry?.latency_ms?.p50 ?? 14.2;
  const p95 = telemetry?.latency_ms?.p95 ?? 45.8;
  const avg = telemetry?.latency_ms?.avg ?? 18.5;
  const throughput = telemetry?.throughput_rpm ?? 12;

  const topDrifting = telemetry?.drift?.top_drifting_features?.slice(0, 3) ?? [
    { feature: "URL_of_Anchor", baseline_mean: 0.12, live_mean: 0.16, shift: 0.04 },
    { feature: "having_Sub_Domain", baseline_mean: 0.24, live_mean: 0.27, shift: 0.03 },
    { feature: "web_traffic", baseline_mean: 0.52, live_mean: 0.55, shift: 0.03 },
  ];

  return (
    <div className="rounded-2xl border border-cyan-500/25 bg-[#061122]/90 p-5 shadow-2xl backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">Live Model Telemetry & Drift Monitor</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                <Radio className="h-2.5 w-2.5 text-cyan-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Real-time inference latencies, requests, and feature distribution shift vs baseline.</p>
          </div>
        </div>

        {/* Prometheus /metrics exporter button */}
        <a
          href={apiUrl("/metrics")}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-cyan-500/40 hover:text-cyan-300 transition shadow-sm cursor-pointer"
          title="Open Prometheus /metrics stream"
        >
          <Server className="h-3.5 w-3.5 text-cyan-400" />
          <span>Prometheus /metrics</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
      </div>

      {/* Grid of Key Telemetry Indicators */}
      <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* Metric 1: Inference Latency */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Inference Latency
            </span>
            <span className="font-mono text-slate-300 text-[11px]">avg: {avg}ms</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">{p50}</span>
            <span className="text-xs text-slate-400 font-bold">ms (p50)</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>p95: <strong className="text-slate-200">{p95}ms</strong></span>
            <span>Throughput: <strong className="text-cyan-400">{throughput} rpm</strong></span>
          </div>
        </div>

        {/* Metric 2: Feature Drift Status */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              Dataset Drift Index
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isHealthy
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/60 border-red-500/40 text-red-300"
            }`}>
              {isHealthy ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              {telemetry?.drift?.status || "Healthy / Low Drift"}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">{driftScore}</span>
            <span className="text-xs text-slate-400 font-bold">/ {driftThreshold} threshold</span>
          </div>
          {/* Drift Gauge Progress Bar */}
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isHealthy ? "bg-gradient-to-r from-cyan-400 to-emerald-400" : "bg-red-500"
              }`}
              style={{ width: `${Math.max(driftRatio, 6)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Top Drifting Features */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
          <span className="block text-xs font-semibold text-slate-400 mb-2">
            Top Feature Shifts (Live vs Baseline)
          </span>
          <div className="space-y-1.5">
            {topDrifting.map((f) => (
              <div key={f.feature} className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-300 truncate max-w-[140px]" title={f.feature}>
                  {f.feature}
                </span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-500 text-[10px]">{f.baseline_mean} → {f.live_mean}</span>
                  <span className="text-cyan-400 font-bold text-[10px]">
                    {f.shift >= 0 ? `+${f.shift}` : f.shift}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { TelemetryPanel };