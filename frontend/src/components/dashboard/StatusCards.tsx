import { BrainCircuit, Database, Radar, Sparkles } from "lucide-react";

import { Card, CardContent } from "../ui/card";
import type { AppStatus } from "../../lib/types";

function StatusCards({ historyCount, status }: { historyCount: number; status: AppStatus }) {
  const systemCards = [
    { label: "Model", value: status.model.status, meta: status.model.meta, icon: BrainCircuit },
    { label: "MongoDB", value: status.mongo.status, meta: "Prediction history + data source", icon: Database },
    { label: "Gemini", value: status.gemini.status, meta: status.gemini.meta, icon: Sparkles },
    { label: "Saved scans", value: historyCount.toLocaleString(), meta: "Recent records loaded", icon: Radar },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {systemCards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div>
              <p className="text-sm text-slate-500">{card.label}</p>
              <h3 className="mt-1 text-xl font-semibold">{card.value}</h3>
              <p className="mt-2 text-xs text-slate-500">{card.meta}</p>
            </div>
            <card.icon className="h-5 w-5 text-teal-600" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { StatusCards };
