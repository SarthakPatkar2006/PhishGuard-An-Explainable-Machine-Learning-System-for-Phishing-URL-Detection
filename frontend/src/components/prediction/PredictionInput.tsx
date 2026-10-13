import { FileSpreadsheet, Radar } from "lucide-react";
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
    <Card className="shadow-md shadow-slate-200/70">
      <CardHeader>
        <CardTitle>Prediction input</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="url">
          <TabsList>
            <TabsTrigger value="url">URL analysis</TabsTrigger>
            <TabsTrigger value="csv">Batch CSV</TabsTrigger>
          </TabsList>
          <TabsContent value="url">
            <form className="mt-5 space-y-4" onSubmit={onUrlSubmit}>
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com/login"
                  required
                  type="url"
                  value={url}
                />
              </div>
              <Button className="w-full sm:w-auto" disabled={isCheckingUrl} type="submit">
                {isCheckingUrl ? "Analyzing..." : "Analyze URL"}
                <Radar className="h-4 w-4" />
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="csv">
            <form className="mt-5 space-y-4" onSubmit={onCsvSubmit}>
              <div className="rounded-lg border border-dashed border-teal-300 bg-teal-50/50 p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-teal-700 shadow-sm">
                    <FileSpreadsheet className="h-5 w-5" />
                  </span>
                  <div>
                    <Label htmlFor="csvFile">Feature CSV</Label>
                    <p className="mt-1 text-sm text-slate-500">Training feature schema, comma-separated.</p>
                  </div>
                </div>
                <Input className="mt-4 border-teal-300 bg-white" id="csvFile" name="csvFile" type="file" accept=".csv,text/csv" />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button disabled={isUploadingCsv} type="submit">
                  {isUploadingCsv ? "Processing..." : "Predict CSV"}
                  <FileSpreadsheet className="h-4 w-4" />
                </Button>
                <Button asChild variant="outline">
                  <a href={apiUrl("/sample-data")}>Download sample</a>
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
        {error ? <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </CardContent>
    </Card>
  );
}

export { PredictionInput };
