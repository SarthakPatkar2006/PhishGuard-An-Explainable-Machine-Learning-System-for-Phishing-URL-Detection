import { Activity, CheckCircle2 } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "../ui/badge";
import { MiniStat } from "../common/MiniStat";
import { chartData } from "../../lib/ui-data";

function HeroPreview() {
  return (
    <div className="hidden rounded-lg border border-white/15 bg-[#081316]/90 p-4 shadow-2xl shadow-slate-950/60 backdrop-blur lg:block">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-sm text-slate-400">Live model verdict</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">example.com/login</h2>
        </div>
        <Badge className="border-teal-300/30 bg-teal-300/10 text-teal-100">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Legitimate
        </Badge>
      </div>
      <div className="grid gap-4 py-5 sm:grid-cols-3">
        <MiniStat label="Confidence" value="88%" />
        <MiniStat label="Signals" value="30" />
        <MiniStat label="Latency" value="1.4s" />
      </div>
      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-slate-400">Risk activity</span>
          <Activity className="h-4 w-4 text-teal-300" />
        </div>
        <ResponsiveContainer height={190} width="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="legit" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="phish" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis axisLine={false} dataKey="name" stroke="#94a3b8" tickLine={false} />
            <YAxis axisLine={false} stroke="#94a3b8" tickLine={false} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
            <Area dataKey="legitimate" fill="url(#legit)" stroke="#14b8a6" strokeWidth={2} />
            <Area dataKey="phishing" fill="url(#phish)" stroke="#ef4444" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export { HeroPreview };
