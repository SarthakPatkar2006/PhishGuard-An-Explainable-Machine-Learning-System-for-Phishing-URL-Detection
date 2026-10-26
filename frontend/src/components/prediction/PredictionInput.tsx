import { FileSpreadsheet, Globe, Link2, Search, ArrowRight } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { apiUrl } from "../../lib/api";

interface PredictionInputProps {
  error: string;
  isCheckingUrl: boolean;
  isUploadingCsv: boolean;
  onCsvSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUrlSubmit: (event: FormEvent<HTMLFormElement>) => void;
  setUrl: (value: string) => void;
  url: string;
}

const EXAMPLE_URLS = [
  { label: "https://google.com", tone: "border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100" },
  { label: "http://198.142.25.1", tone: "border-amber-600 bg-amber-50 text-amber-900 hover:bg-amber-100" },
  { label: "http://www.google.com.accounts-verification-login-secure.info-update-billing.com/signin", tone: "border-red-600 bg-red-50 text-red-900 hover:bg-red-100" }
];

function PredictionInput({
  error,
  isCheckingUrl,
  isUploadingCsv,
  onCsvSubmit,
  onUrlSubmit,
  setUrl,
  url,
}: PredictionInputProps) {
  return (
    <Card className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl shadow-cyan-950/20 text-slate-900">
      <CardHeader className="p-0 pb-4 text-slate-900">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100 text-blue-700">
            <Link2 className="h-4.5 w-4.5" />
          </span>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Prediction input</CardTitle>
            <p className="text-xs text-slate-600 font-medium">Enter a website URL or upload a CSV file for batch analysis.</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 pt-2 text-slate-900">
        <Tabs defaultValue="url">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100 p-1">
            <TabsTrigger
              value="url"
              className="flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold text-slate-700 data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm"
            >
              <Globe className="h-3.5 w-3.5" />
              URL analysis
            </TabsTrigger>
            <TabsTrigger
              value="csv"
              className="flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold text-slate-700 data-[state=active]:bg-white data-[state=active]:text-blue-800 data-[state=active]:shadow-sm"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Batch CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="mt-5">
            <form className="space-y-4" onSubmit={onUrlSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="url" className="text-xs font-bold text-slate-800">Website URL</Label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500">
                    <Link2 className="h-4 w-4" />
                  </span>
                  <Input
                    id="url"
                    className="h-11 rounded-xl border-slate-300 bg-slate-50 pl-10 text-sm font-medium text-slate-950 placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-500/20"
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://example.com/login"
                    required
                    type="url"
                    value={url}
                  />
                </div>
              </div>

              <Button
                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 font-bold text-white shadow-lg shadow-cyan-600/30 transition hover:opacity-95 cursor-pointer"
                disabled={isCheckingUrl}
                type="submit"
              >
                {isCheckingUrl ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Analyzing website features...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-sm">
                    <Search className="h-4 w-4" />
                    Analyze URL
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Quick Example URLs with high contrast dark font */}
            <div className="mt-5 pt-4 border-t border-slate-200">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Try example URLs:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_URLS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setUrl(item.label)}
                    className={`max-w-[220px] truncate rounded-lg border px-2.5 py-1 text-xs font-bold transition cursor-pointer shadow-sm ${item.tone}`}
                    title={item.label}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="csv" className="mt-5">
            <form className="space-y-4" onSubmit={onCsvSubmit}>
              <div className="rounded-xl border-2 border-dashed border-cyan-400/80 bg-cyan-50/60 p-6 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-cyan-200 text-cyan-800 shadow-sm">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <Label htmlFor="csvFile" className="mt-3 block text-sm font-bold text-slate-900">
                  Select CSV Dataset
                </Label>
                <p className="mt-1 text-xs text-slate-600 font-medium">Upload your phishing features CSV file for batch scanning.</p>
                <Input
                  className="mt-4 border-slate-300 bg-white text-slate-950 font-medium"
                  id="csvFile"
                  name="csvFile"
                  type="file"
                  accept=".csv,text/csv"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 font-bold text-white shadow-md shadow-cyan-600/20 hover:opacity-95 cursor-pointer"
                  disabled={isUploadingCsv}
                  type="submit"
                >
                  {isUploadingCsv ? "Processing batch..." : "Run Batch Scoring"}
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-xl border-slate-300 text-slate-800 font-bold hover:bg-slate-100">
                  <a href={apiUrl("/sample-data")}>Sample CSV</a>
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-800">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export { PredictionInput };
