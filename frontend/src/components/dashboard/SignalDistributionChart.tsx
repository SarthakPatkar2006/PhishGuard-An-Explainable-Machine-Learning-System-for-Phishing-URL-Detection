import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface SignalDistributionChartProps {
  signalData: Array<{ color: string; name: string; value: number }>;
}

function SignalDistributionChart({ signalData }: SignalDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Signal distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer height={260} width="100%">
          <BarChart data={signalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
            <YAxis allowDecimals={false} stroke="#64748b" tickLine={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {signalData.map((entry) => (
                <Cell fill={entry.color} key={entry.name} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export { SignalDistributionChart };
