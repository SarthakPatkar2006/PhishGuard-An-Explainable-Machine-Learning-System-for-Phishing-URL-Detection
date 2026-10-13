import { Link } from "react-router-dom";
import { LockKeyhole } from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

function AuthRequiredPanel() {
  return (
    <Card className="border-dashed border-slate-300 bg-white">
      <CardContent>
        <div className="grid min-h-64 place-items-center text-center">
          <div className="max-w-md">
            <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg bg-teal-50 text-teal-700">
              <LockKeyhole className="h-6 w-6" />
            </span>
            <h3 className="text-xl font-semibold text-slate-950">Sign in to view your history</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Prediction history is account-specific, so your saved URL scans stay separate from other users.
            </p>
            <Button asChild className="mt-5">
              <Link to="/auth">Login or signup</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { AuthRequiredPanel };
