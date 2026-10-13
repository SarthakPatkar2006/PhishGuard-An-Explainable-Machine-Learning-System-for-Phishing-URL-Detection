import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck, UserPlus } from "lucide-react";
import type { FormEvent } from "react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import type { AuthCredentials, AuthUser } from "../lib/types";

interface AuthPageProps {
  authError: string;
  isSubmitting: boolean;
  onLogin: (credentials: AuthCredentials) => Promise<void>;
  onSignup: (credentials: AuthCredentials) => Promise<void>;
  user: AuthUser | null;
}

function AuthPage({ authError, isSubmitting, onLogin, onSignup, user }: AuthPageProps) {
  const navigate = useNavigate();

  async function submitAuth(event: FormEvent<HTMLFormElement>, mode: "login" | "signup") {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const credentials = {
      email: String(formData.get("email") ?? ""),
      name: String(formData.get("name") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    if (mode === "signup") {
      await onSignup(credentials);
    } else {
      await onLogin(credentials);
    }
    navigate("/dashboard");
  }

  if (user) {
    return (
      <main className="bg-[#f3f7f8] px-4 py-16 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-3xl place-items-center">
          <Card className="w-full border-teal-200 bg-white">
            <CardHeader>
              <Badge className="mb-3 border-teal-200 bg-teal-50 text-teal-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                Signed in
              </Badge>
              <CardTitle className="text-2xl">Welcome back, {user.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-6 text-slate-600">
                Your next URL scans will be saved to your private prediction history.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/analyze">Analyze URL</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/history">View history</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f3f7f8] px-4 py-16 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <section>
          <Badge className="mb-4 border-teal-200 bg-teal-50 text-teal-800">
            <LockKeyhole className="h-3.5 w-3.5" />
            User authentication
          </Badge>
          <h1 className="max-w-xl text-3xl font-semibold tracking-normal sm:text-5xl">
            Save every scan to your own secure workspace.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-600">
            Sign in before analyzing URLs so MongoDB stores predictions against your account, then return to History for a personal audit trail.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-950">Private history</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Only your account sees your saved URL checks.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-950">Fast sessions</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Token-based sessions keep the product flow smooth.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-950">MongoDB backed</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Users, sessions, and prediction logs stay in one database.</p>
            </div>
          </div>
        </section>

        <Card className="border-slate-200 bg-white shadow-lg shadow-slate-200/60">
          <CardHeader>
            <Badge className="mb-3 border-slate-300 bg-white text-slate-700">
              <UserPlus className="h-3.5 w-3.5 text-teal-600" />
              Account access
            </Badge>
            <CardTitle className="text-2xl">Login or create account</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="mb-6 w-full">
                <TabsTrigger className="flex-1" value="login">
                  Login
                </TabsTrigger>
                <TabsTrigger className="flex-1" value="signup">
                  Signup
                </TabsTrigger>
              </TabsList>

              {authError ? (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {authError}
                </div>
              ) : null}

              <TabsContent value="login">
                <AuthForm isSubmitting={isSubmitting} mode="login" onSubmit={submitAuth} />
              </TabsContent>
              <TabsContent value="signup">
                <AuthForm isSubmitting={isSubmitting} mode="signup" onSubmit={submitAuth} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

interface AuthFormProps {
  isSubmitting: boolean;
  mode: "login" | "signup";
  onSubmit: (event: FormEvent<HTMLFormElement>, mode: "login" | "signup") => Promise<void>;
}

function AuthForm({ isSubmitting, mode, onSubmit }: AuthFormProps) {
  const isSignup = mode === "signup";

  return (
    <form className="space-y-4" onSubmit={(event) => void onSubmit(event, mode).catch(() => undefined)}>
      {isSignup ? (
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input autoComplete="name" id="name" name="name" placeholder="Sahil Patil" required />
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor={`${mode}-email`}>Email</Label>
        <Input autoComplete="email" id={`${mode}-email`} name="email" placeholder="you@example.com" required type="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${mode}-password`}>Password</Label>
        <Input autoComplete={isSignup ? "new-password" : "current-password"} id={`${mode}-password`} minLength={6} name="password" placeholder="At least 6 characters" required type="password" />
      </div>
      <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
        {isSubmitting ? "Please wait..." : isSignup ? "Create account" : "Login"}
      </Button>
    </form>
  );
}

export { AuthPage };
