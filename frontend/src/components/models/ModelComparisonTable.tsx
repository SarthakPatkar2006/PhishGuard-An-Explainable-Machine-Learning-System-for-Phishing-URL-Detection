import { Award, BrainCircuit } from "lucide-react";

import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { ModelComparisonReport, ModelComparisonRow } from "../../lib/types";

function ModelComparisonTable({ report }: { report: ModelComparisonReport }) {
  if (!report.ready) {
    return (
      <Card>
        <CardContent className="grid min-h-72 place-items-center p-6 text-center">
          <div className="max-w-md">
            <BrainCircuit className="mx-auto mb-4 h-10 w-10 text-teal-600" />
            <h2 className="text-xl font-semibold">Model comparison not generated yet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {report.message || "Run the training pipeline to compare Random Forest, XGBoost, Logistic Regression, and Decision Tree."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Algorithm leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Test F1</th>
                <th className="px-4 py-3">Accuracy</th>
                <th className="px-4 py-3">Precision</th>
                <th className="px-4 py-3">Recall</th>
                <th className="px-4 py-3">Best Params</th>
              </tr>
            </thead>
            <tbody>
              {report.models.map((model) => (
                <ModelRow key={model.modelName} model={model} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ModelRow({ model }: { model: ModelComparisonRow }) {
  const statusClass =
    model.status === "trained"
      ? "border-teal-200 bg-teal-50 text-teal-700"
      : model.status === "unavailable"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <tr className={model.isBest ? "bg-teal-50/60" : "border-t border-slate-100"}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 font-semibold">
          {model.isBest ? <Award className="h-4 w-4 text-teal-600" /> : null}
          {model.modelName}
        </div>
        {model.error ? <p className="mt-1 max-w-xs text-xs text-slate-500">{model.error}</p> : null}
      </td>
      <td className="px-4 py-3">
        <Badge className={statusClass}>{model.status}</Badge>
      </td>
      <td className="px-4 py-3 font-semibold">{formatScore(model.testF1)}</td>
      <td className="px-4 py-3">{formatScore(model.testAccuracy)}</td>
      <td className="px-4 py-3">{formatScore(model.testPrecision)}</td>
      <td className="px-4 py-3">{formatScore(model.testRecall)}</td>
      <td className="px-4 py-3 text-xs text-slate-500">{formatParams(model.bestParams)}</td>
    </tr>
  );
}

function formatScore(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatParams(params: Record<string, string | number | boolean | null>) {
  const entries = Object.entries(params);
  if (!entries.length) {
    return "-";
  }
  return entries.map(([key, value]) => `${key}: ${value}`).join(", ");
}

export { ModelComparisonTable };
