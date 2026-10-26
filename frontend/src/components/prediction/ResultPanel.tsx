import { CheckCircle2, ShieldAlert, Sparkles, Activity, Database, Globe2, Server, Download, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { apiUrl } from "../../lib/api";
import { buildCsvPreviewColumns } from "../../lib/format";
import type { ActiveResult } from "../../hooks/usePredictionWorkspace";
import type { CsvPrediction, UrlPrediction } from "../../lib/types";

interface ResultPanelProps {
  activeResult: ActiveResult;
  csvResult: CsvPrediction | null;
  urlResult: UrlPrediction | null;
}

function ResultPanel({ activeResult, csvResult, urlResult }: ResultPanelProps) {
  const isLegitimate = urlResult?.label === "Legitimate";

  return (
    <Card className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl shadow-cyan-950/20 text-slate-900">
      <CardHeader className="p-0 pb-4 text-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-100 text-teal-700">
              <Activity className="h-4.5 w-4.5" />
            </span>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Live result</CardTitle>
              <p className="text-xs text-slate-600 font-medium">Real-time prediction with explainable AI insights.</p>
            </div>
          </div>
          {urlResult ? (
            <Badge className="border-emerald-300 bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse mr-1" />
              Analysis complete
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-2 text-slate-900">
        {activeResult === "url" && urlResult ? (
          <UrlResultView isLegitimate={isLegitimate} urlResult={urlResult} />
        ) : activeResult === "csv" && csvResult ? (
          <CsvResultView csvResult={csvResult} />
        ) : (
          <EmptyResultView />
        )}
      </CardContent>
    </Card>
  );
}

function UrlResultView({ isLegitimate, urlResult }: { isLegitimate: boolean; urlResult: UrlPrediction }) {
  const [showAllFactors, setShowAllFactors] = useState(false);
  const shapFeatures = urlResult.shap?.topFeatures || [];
  const displayFactors = showAllFactors ? shapFeatures : shapFeatures.slice(0, 5);

  return (
    <div className="space-y-4 text-slate-900">
      {/* 1. Main Verdict Banner with high-contrast text */}
      <div className={`flex items-center gap-3.5 rounded-xl border p-4 ${
        isLegitimate ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"
      }`}>
        <div className={`grid h-12 w-12 place-items-center rounded-full ${
          isLegitimate ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" : "bg-red-600 text-white shadow-lg shadow-red-600/30"
        }`}>
          {isLegitimate ? <CheckCircle2 className="h-7 w-7" /> : <ShieldAlert className="h-7 w-7" />}
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Model prediction</span>
          <h2 className={`text-2xl font-black tracking-tight ${isLegitimate ? "text-emerald-700" : "text-red-700"}`}>
            {urlResult.label}
          </h2>
        </div>
      </div>

      {/* 2. Gemini AI Explanation with dark high-contrast readable text */}
      <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-slate-900">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-cyan-700" />
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">AI Explanation (Gemini)</h3>
        </div>
        {urlResult.summary ? (
          <p className="text-xs leading-relaxed text-slate-900 whitespace-pre-line font-medium">
            {urlResult.summary}
          </p>
        ) : urlResult.explanationStatus === "pending" ? (
          <p className="text-xs text-sky-900 font-semibold animate-pulse">
            Gemini is evaluating model weights and generating detailed explanation...
          </p>
        ) : (
          <p className="text-xs text-slate-700 font-medium">
            {urlResult.explanationDiagnostic || "Explanation will be shown here once generated."}
          </p>
        )}
      </div>

      {/* 3. Top Feature Contributions (Tree SHAP) */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 text-slate-900">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-teal-700" />
            <h4 className="text-xs font-bold text-slate-900">Top feature contributions (SHAP)</h4>
          </div>
          {shapFeatures.length > 5 ? (
            <button
              type="button"
              onClick={() => setShowAllFactors(!showAllFactors)}
              className="flex items-center gap-1 text-[11px] font-bold text-cyan-700 hover:text-cyan-900 cursor-pointer"
            >
              {showAllFactors ? "Show less" : `View all (${shapFeatures.length})`}
              <ChevronDown className={`h-3 w-3 transition-transform ${showAllFactors ? "rotate-180" : ""}`} />
            </button>
          ) : null}
        </div>

        <div className="space-y-2.5">
          {displayFactors.map((factor) => {
            const isPositive = factor.contribution >= 0;
            const barWidth = Math.min(Math.abs(factor.contribution) * 200, 100);
            return (
              <div key={factor.name} className="flex items-center justify-between gap-3 text-xs">
                <span className="w-36 truncate font-bold text-slate-900" title={factor.name}>
                  {factor.name} = {factor.value}
                </span>
                
                {/* Visual Contribution Bar */}
                <div className="flex-1 max-w-[140px] h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isPositive ? "bg-emerald-600" : "bg-red-600"
                    }`}
                    style={{ width: `${Math.max(barWidth, 8)}%` }}
                  />
                </div>

                <span className={`w-14 text-right font-black font-mono text-[11px] ${
                  isPositive ? "text-emerald-700" : "text-red-600"
                }`}>
                  {isPositive ? "+" : ""}{factor.contribution.toFixed(4)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Metadata Badges */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-slate-900">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
          <Database className="h-4 w-4 text-emerald-700 shrink-0" />
          <div className="overflow-hidden">
            <span className="block text-[10px] text-slate-600 font-bold uppercase">DNS</span>
            <span className="block text-xs font-black text-slate-900 truncate">{urlResult.dnsStatus}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
          <Globe2 className="h-4 w-4 text-blue-700 shrink-0" />
          <div className="overflow-hidden">
            <span className="block text-[10px] text-slate-600 font-bold uppercase">Page</span>
            <span className="block text-xs font-black text-slate-900 truncate">{urlResult.htmlStatus}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
          <Server className="h-4 w-4 text-purple-700 shrink-0" />
          <div className="overflow-hidden">
            <span className="block text-[10px] text-slate-600 font-bold uppercase">Host</span>
            <span className="block text-xs font-black text-slate-900 truncate">{urlResult.hostname}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CsvResultView({ csvResult }: { csvResult: CsvPrediction }) {
  const previewColumns = csvResult.preview[0] ? buildCsvPreviewColumns(Object.keys(csvResult.preview[0])) : [];
  const total = csvResult.phishing + csvResult.legitimate;

  return (
    <div className="space-y-4 text-slate-900">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div>
          <span className="text-[11px] font-bold text-slate-600 uppercase">Batch Scan Complete</span>
          <h3 className="text-base font-black text-slate-900 truncate max-w-sm">{csvResult.fileName}</h3>
          <p className="text-xs text-slate-700 font-medium mt-0.5">{csvResult.outputMeta}</p>
        </div>
        <Button asChild className="rounded-xl bg-cyan-700 text-white font-bold hover:bg-cyan-800">
          <a href={apiUrl("/download-output")}>
            <Download className="h-4 w-4 mr-1.5" />
            Download
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3">
          <span className="text-xs text-emerald-900 font-bold">Legitimate URLs</span>
          <h4 className="text-2xl font-black text-emerald-700 mt-1">{csvResult.legitimate}</h4>
          <span className="text-[11px] text-emerald-800 font-semibold">{total > 0 ? Math.round((csvResult.legitimate / total) * 100) : 0}%</span>
        </div>
        <div className="rounded-xl border border-red-300 bg-red-50 p-3">
          <span className="text-xs text-red-900 font-bold">Phishing URLs</span>
          <h4 className="text-2xl font-black text-red-700 mt-1">{csvResult.phishing}</h4>
          <span className="text-[11px] text-red-800 font-semibold">{total > 0 ? Math.round((csvResult.phishing / total) * 100) : 0}%</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <span className="block text-xs font-bold text-slate-900 mb-2">Sample Output Rows:</span>
        <div className="overflow-x-auto text-[11px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-700 font-bold">
                {previewColumns.map((c) => (
                  <th key={c} className="p-1 font-bold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvResult.preview.slice(0, 3).map((row, i) => (
                <tr key={i} className="border-b border-slate-200 text-slate-900 font-medium">
                  {previewColumns.map((c) => (
                    <td key={c} className="p-1 truncate max-w-[120px]">{String(row[c] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EmptyResultView() {
  return (
    <div className="grid min-h-[340px] place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center text-slate-900">
      <div className="max-w-xs space-y-2">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cyan-100 text-cyan-700 shadow-sm">
          <Sparkles className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-black text-slate-900">Awaiting Prediction</h4>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          Enter a URL on the left and click <strong className="text-slate-950 font-bold">Analyze URL</strong> to inspect 30 security features, calculate Tree SHAP contributions, and get live Gemini explanations.
        </p>
      </div>
    </div>
  );
}

export { ResultPanel };
