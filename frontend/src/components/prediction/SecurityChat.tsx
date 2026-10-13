import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";

import { askSecurityQuestion } from "../../lib/api";
import type { UrlPrediction } from "../../lib/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

function SecurityChat({ result }: { result: UrlPrediction }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  async function submitQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;
    setError("");
    setIsAsking(true);
    try {
      setAnswer(await askSecurityQuestion(question, result));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to contact the security assistant.");
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-teal-600" />
        <p className="text-sm font-semibold text-slate-700">Ask about this scan</p>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-500">Ask why this result appeared or what to do if you already visited the site.</p>
      <form className="mt-3 flex gap-2" onSubmit={submitQuestion}>
        <Input aria-label="Security question" maxLength={600} onChange={(event) => setQuestion(event.target.value)} placeholder="For example: What should I do if I entered my password?" value={question} />
        <Button disabled={isAsking || !question.trim()} size="icon" type="submit">
          <Send className="h-4 w-4" />
        </Button>
      </form>
      {answer ? <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{answer}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export { SecurityChat };
