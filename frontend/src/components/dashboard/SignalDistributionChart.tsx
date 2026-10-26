import { BarChart2, ChevronDown } from "lucide-react";
import { useState } from "react";

interface SignalDistributionChartProps {
  signalData: Array<{ color: string; name: string; value: number }>;
}

function SignalDistributionChart({ signalData }: SignalDistributionChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxValue = Math.max(...signalData.map((d) => d.value), 5);

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#071322]/85 p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">URL Classification Distribution</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Distribution of analyzed URLs by classification category.</p>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white"
        >
          <span>All Scans</span>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </button>
      </div>

      <div className="relative h-64 w-full pt-4 flex flex-col justify-end">
        {/* Y-axis grid lines */}
        <div className="absolute inset-x-0 top-6 bottom-10 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-dashed border-slate-500 w-full" />
          <div className="border-b border-dashed border-slate-500 w-full" />
          <div className="border-b border-dashed border-slate-500 w-full" />
          <div className="border-b border-slate-700 w-full" />
        </div>

        {/* Bars Container */}
        <div className="relative z-10 flex h-48 items-end justify-around gap-4 px-6 pb-2">
          {signalData.map((item, idx) => {
            const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.name}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="group relative flex flex-1 flex-col items-center h-full justify-end cursor-pointer max-w-[90px]"
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute -top-10 z-30 rounded-xl border border-cyan-500/40 bg-[#0b1526]/95 px-3 py-1.5 text-center shadow-xl shadow-black/60 backdrop-blur-md">
                    <span className="block text-[10px] text-slate-400">{item.name}</span>
                    <span className="block text-xs font-black text-white font-mono">{item.value} scan{item.value !== 1 ? "s" : ""}</span>
                  </div>
                )}

                {/* Value Label above Bar */}
                <span className="mb-2 text-xs font-bold font-mono text-slate-300 transition-transform group-hover:scale-110">
                  {item.value}
                </span>

                {/* Animated Glowing Bar */}
                <div className="relative w-full rounded-t-xl overflow-hidden bg-slate-800/40 h-full flex items-end">
                  <div
                    className="w-full rounded-t-xl transition-all duration-500 ease-out"
                    style={{
                      height: `${Math.max(heightPercent, 6)}%`,
                      backgroundColor: item.color,
                      boxShadow: isHovered ? `0 0 20px ${item.color}88` : `0 0 10px ${item.color}33`,
                    }}
                  />
                </div>

                {/* Category Name Label below Bar */}
                <span className="mt-3 text-xs font-bold text-slate-400 truncate max-w-full group-hover:text-cyan-300 transition-colors">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { SignalDistributionChart };