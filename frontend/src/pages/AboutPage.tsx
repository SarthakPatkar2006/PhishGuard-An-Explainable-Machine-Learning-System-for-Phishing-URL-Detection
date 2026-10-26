import { ArrowRight, BrainCircuit, Database, FileSpreadsheet, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

const workflowSteps = [
  {
    title: "URL to features",
    description: "The backend extracts 30 phishing signals from the entered website URL.",
    icon: Globe2,
  },
  {
    title: "Model prediction",
    description: "The trained model receives those feature values and predicts Legitimate or Phishing.",
    icon: BrainCircuit,
  },
  {
    title: "Saved history",
    description: "Each URL scan is saved in MongoDB so the dashboard and history pages stay useful after refresh.",
    icon: Database,
  },
  {
    title: "Readable summary",
    description: "Gemini adds a short explanation grounded in the model's Tree SHAP factors.",
    icon: Sparkles,
  },
];

function AboutPage() {
  return (
    <main className="relative isolate px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <Badge className="mb-3 border-cyan-400/40 bg-cyan-950/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            Project Overview
          </Badge>
          <h1 className="text-3xl font-black sm:text-4xl lg:text-5xl text-white drop-shadow-md">
            Next-Gen <span className="text-gradient-cyan">Phishing Detection</span> Platform
          </h1>
          <p className="mt-4 text-xs sm:text-sm leading-6 text-slate-200 font-medium">
            This project combines a FastAPI ML backend, MongoDB prediction history, URL feature extraction, CSV batch scoring, and a React interface built for clear, explainable security review.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 font-bold text-white shadow-lg shadow-cyan-600/30">
              <Link to="/analyze">
                Try URL Analysis
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-white/20 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white">
              <Link to="/history">View Scan History</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map((step) => (
            <Card key={step.title} className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl shadow-cyan-950/20 text-slate-900">
              <CardContent className="p-0">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-cyan-100 text-cyan-700">
                  <step.icon className="h-6 w-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900">{step.title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 font-medium">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl shadow-cyan-950/20 text-slate-900">
          <CardContent className="grid gap-6 p-0 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-cyan-100 text-cyan-700">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">CSV Batch Workflow</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 font-medium">
                CSV upload uses the same model pipeline as training. The app scores rows, adds a prediction column, shows a visual split, and lets users download the output file.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 font-medium">
              The frontend is organized into modular sections: Home for the product story, Analyze for instant URL and CSV predictions, Dashboard for metrics and live telemetry, History for persistent scan records, Models for ML benchmark tracking, and About for architectural insights.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export { AboutPage };
