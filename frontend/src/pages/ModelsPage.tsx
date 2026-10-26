import { BrainCircuit, Trophy } from "lucide-react";

import { MiniMetric } from "../components/common/MiniMetric";
import { ModelComparisonTable } from "../components/models/ModelComparisonTable";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import type { ModelComparisonReport } from "../lib/types";

function ModelsPage({ report }: { report: ModelComparisonReport }) {
  const trainedCount = report.models.filter((model) => model.status === "trained").length;

  return (
    <main className="relative isolate px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <Badge className="mb-3 border-cyan-500/30 bg-cyan-950/40 text-cyan-300">
              <BrainCircuit className="h-3.5 w-3.5 mr-1 text-cyan-400" />
              Model Benchmarks
            </Badge>
            <h1 className="text-3xl font-extrabold sm:text-4xl text-white">Find the Best Phishing Detector</h1>
          </div>
          <p className="max-w-xl text-xs sm:text-sm leading-6 text-slate-300">
            Training automatically evaluates Random Forest, XGBoost, Logistic Regression, and Decision Tree, selecting the highest F1-score model for deployment.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <MiniMetric label="Best model" value={report.ready ? report.bestModelName : "Not trained"} tone="good" />
          <MiniMetric label="Best test F1" value={report.ready ? `${Math.round(report.bestModelScore * 100)}%` : "No report"} tone="neutral" />
          <MiniMetric label="Models trained" value={trainedCount.toLocaleString()} tone="neutral" />
        </div>

        {report.ready ? (
          <Card className="mb-6 border-teal-200 bg-teal-50">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-teal-700">Current best performer</p>
                <h2 className="mt-1 text-2xl font-semibold text-teal-950">{report.bestModelName}</h2>
                <p className="mt-1 text-sm text-teal-700">Generated: {report.generatedAt || "Latest training run"}</p>
              </div>
              <Trophy className="h-9 w-9 text-teal-700" />
            </CardContent>
          </Card>
        ) : null}

        <ModelComparisonTable report={report} />
      </div>
    </main>
  );
}

export { ModelsPage };
