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
    description: "Gemini adds a short explanation to help users understand the model result.",
    icon: Sparkles,
  },
];

function AboutPage() {
  return (
    <main className="bg-[#f3f7f8] px-4 py-16 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <Badge className="mb-3 border-teal-200 bg-teal-50 text-teal-800">
            <ShieldCheck className="h-3.5 w-3.5" />
            Project overview
          </Badge>
          <h1 className="text-4xl font-semibold sm:text-5xl">A portfolio-ready phishing detection product</h1>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            This project combines a FastAPI ML backend, MongoDB prediction history, URL feature extraction, CSV batch scoring, and a React interface built for clear security review.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/analyze">
                Try analysis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/history">View history</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map((step) => (
            <Card key={step.title}>
              <CardContent className="p-6">
                <step.icon className="mb-5 h-8 w-8 text-teal-600" />
                <h2 className="text-lg font-semibold">{step.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <FileSpreadsheet className="mb-4 h-8 w-8 text-teal-600" />
              <h2 className="text-xl font-semibold">CSV batch workflow</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                CSV upload uses the same model pipeline as training. The app scores rows, adds a prediction column, shows a visual split, and lets users download the output file.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              The frontend is now split into real pages: Home for the product story, Analyze for prediction, Dashboard for monitoring, History for saved MongoDB scans, and About for project explanation.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export { AboutPage };
