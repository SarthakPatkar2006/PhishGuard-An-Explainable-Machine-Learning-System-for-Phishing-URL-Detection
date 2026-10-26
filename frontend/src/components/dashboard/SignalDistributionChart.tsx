import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { BarChart2, ChevronDown } from "lucide-react";

interface SignalDistributionChartProps {
  signalData: Array<{ color: string; name: string; value: number }>;
}

function SignalDistributionChart({ signalData }: SignalDistributionChartProps) {
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

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={signalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              tickLine={false} 
              axisLine={{ stroke: "#1e293b" }}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />
            <YAxis 
              allowDecimals={false} 
              stroke="#64748b" 
              tickLine={false} 
              axisLine={{ stroke: "#1e293b" }}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0b1526",
                borderColor: "#1e3a5f",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "12px",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)"
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {signalData.map((entry) => (
                <Cell fill={entry.color} key={entry.name} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export { SignalDistributionChart };
