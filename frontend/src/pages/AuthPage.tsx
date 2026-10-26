import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Crosshair, 
  Zap, 
  FileSpreadsheet, 
  ArrowRight,
  UserPlus,
  LogIn,
  AlertTriangle,
  Globe,
  Search
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
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
      <main className="relative isolate min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-cyan-500/30 bg-[#071322]/85 p-8 text-center shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-cyan-500/40 bg-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-white">Welcome back, {user.name}</h2>
          <p className="mt-2 text-xs text-slate-300">
            You are securely authenticated. Your scans are automatically tracked in MongoDB.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild className="rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 font-bold text-white shadow-lg shadow-cyan-500/30">
              <Link to="/analyze">
                Launch Phishing Scanner
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-white/20 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative isolate min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl grid gap-10 lg:grid-cols-[1.22fr_0.88fr] lg:items-center">
        {/* Left Side: Brand, Hero & Ultra-Crisp Cyber Visual */}
        <div className="space-y-6">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-400/50 bg-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <span className="block text-xl font-black tracking-tight text-white">PhishGuard</span>
              <span className="block text-[11px] font-mono tracking-wider uppercase font-semibold text-cyan-400">
                AI Powered URL Security
              </span>
            </div>
          </div>

          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/80 px-3.5 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-md">
            <Crosshair className="h-3.5 w-3.5 text-rose-400" />
            <span>Detect • Analyze • Stay Safe</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
              Stop Phishing
            </h1>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl leading-[1.1] text-gradient-cyan">
              Before It Reaches You
            </h2>
          </div>

          {/* Subtitle */}
          <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-slate-300 font-medium">
            Detect malicious and fraudulent websites using Machine Learning. Analyse URLs instantly and stay one step ahead of cyber threats.
          </p>

          {/* Ultra-Crisp Vector/CSS Cyber Security Laptop Mockup (100% Vector, Zero Blur) */}
          <div className="relative mx-auto w-full max-w-lg py-4">
            {/* Ambient Background Glow Shield */}
            <div className="absolute top-1 right-8 -z-0 h-44 w-40 opacity-40 blur-sm pointer-events-none">
              <div className="h-full w-full rounded-t-full border-2 border-cyan-400/60 bg-gradient-to-b from-cyan-500/30 to-blue-600/10 shadow-[0_0_50px_rgba(6,182,212,0.5)] flex items-center justify-center">
                <Lock className="h-16 w-16 text-cyan-300/60" />
              </div>
            </div>

            {/* Floating Red Warning Badge (Top Left with glowing pointer) */}
            <div className="absolute -top-2 left-2 sm:left-4 z-20 flex items-center gap-2.5 rounded-xl border border-red-500/80 bg-[#160608]/95 px-3 py-2 shadow-[0_0_25px_rgba(239,68,68,0.4)] backdrop-blur-md">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-red-500/25 text-red-400">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <span className="block text-[11px] font-mono font-bold text-slate-200">http://suspicious-login.com</span>
                <span className="block text-[10px] font-black uppercase tracking-wider text-red-400">Phishing Detected</span>
              </div>
              {/* Dotted pointer to laptop screen */}
              <div className="hidden sm:block absolute -bottom-4 left-7 h-4 w-0.5 border-l-2 border-dashed border-red-500/80" />
            </div>

            {/* Floating Green Verified Badge (Bottom Right) */}
            <div className="absolute bottom-6 right-2 sm:right-4 z-20 flex items-center gap-2 rounded-xl border border-emerald-500/80 bg-[#04140d]/95 px-3 py-1.5 shadow-[0_0_20px_rgba(16,185,129,0.4)] backdrop-blur-md">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-500/25 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <div>
                <span className="block text-[10px] font-mono text-slate-300">https://bank.com</span>
                <span className="block text-[10px] font-bold text-emerald-400">Safe</span>
              </div>
            </div>

            {/* Laptop Screen Bezel */}
            <div className="relative mx-auto w-[92%] rounded-t-2xl border-2 border-slate-700/80 bg-gradient-to-b from-[#0e1726] to-[#040812] p-3 shadow-2xl shadow-cyan-950/70">
              {/* Top Camera Notch */}
              <div className="mx-auto mb-2 flex items-center justify-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                <span className="h-1 w-6 rounded-full bg-slate-800" />
              </div>

              {/* High-Resolution Screen Display Area */}
              <div className="rounded-xl border border-cyan-500/30 bg-[#030914] p-3.5 shadow-inner">
                {/* Browser URL bar */}
                <div className="flex items-center justify-between rounded-xl border border-slate-700/80 bg-[#071322] px-3 py-1.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs font-mono font-medium text-slate-200">https://example.com</span>
                  </div>
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                    <Search className="h-3 w-3" />
                  </span>
                </div>

                {/* Center Live Verdict Card on Screen */}
                <div className="mt-3.5 rounded-xl border border-cyan-400/50 bg-gradient-to-b from-cyan-950/50 to-[#041220]/90 p-3.5 text-center shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/50 bg-cyan-500/25 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h4 className="mt-2 text-xs font-black tracking-wide text-white">Safe Website</h4>
                  <p className="text-[10px] text-cyan-200 font-medium">This URL appears to be legitimate.</p>
                  <div className="mt-2 mx-auto h-1 w-24 rounded-full bg-cyan-950 overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Laptop Base (3D Keyboard Deck with blue neon underglow) */}
            <div className="relative mx-auto h-3.5 w-full rounded-b-xl border-t border-slate-600 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-[0_12px_30px_rgba(0,0,0,0.85),0_0_25px_rgba(6,182,212,0.35)]">
              <div className="mx-auto h-1 w-16 rounded-b bg-slate-900" />
            </div>
          </div>

          {/* 3 Bottom Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            {/* Feature 1 */}
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#071322]/80 p-3.5 backdrop-blur-md shadow-lg shadow-cyan-950/30">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-500/30 bg-cyan-500/15 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Accurate Detection</h4>
                <p className="mt-1 text-[11px] leading-tight text-slate-400">
                  ML models to classify phishing and legitimate URLs.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#071322]/80 p-3.5 backdrop-blur-md shadow-lg shadow-cyan-950/30">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Instant Results</h4>
                <p className="mt-1 text-[11px] leading-tight text-slate-400">
                  Get predictions in milliseconds.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#071322]/80 p-3.5 backdrop-blur-md shadow-lg shadow-cyan-950/30">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-purple-500/30 bg-purple-500/15 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)]">
                <FileSpreadsheet className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Batch Analysis</h4>
                <p className="mt-1 text-[11px] leading-tight text-slate-400">
                  Check multiple URLs from CSV files.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Exact Floating Auth Glass Card */}
        <div className="relative w-full max-w-md mx-auto">
          {/* Subtle Glow backdrop */}
          <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-b from-cyan-500/25 to-blue-600/10 blur-xl opacity-80" />

          <div className="relative rounded-3xl border border-cyan-500/35 bg-[#061122]/90 p-7 sm:p-8 shadow-2xl backdrop-blur-2xl">
            {/* Title & Subtitle */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Welcome to <span className="text-cyan-400">PhishGuard</span>
              </h2>
              <p className="mt-1 text-xs text-slate-400 font-medium">
                Sign in to detect and analyze suspicious URLs
              </p>
            </div>

            {/* Login / Sign Up Tabs */}
            <div className="mt-6 flex rounded-xl border border-white/10 bg-[#0a1628] p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  mode === "login"
                    ? "border border-cyan-500/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  mode === "signup"
                    ? "border border-cyan-500/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {authError ? (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/50 px-3.5 py-2.5 text-xs font-semibold text-red-300">
                {authError}
              </div>
            ) : null}

            {/* Form */}
            <form className="mt-5 space-y-4" onSubmit={(e) => void submitAuth(e).catch(() => undefined)}>
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="auth-name" className="text-xs font-bold text-slate-300">
                    Full Name
                  </Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400">
                      <User className="h-4 w-4" />
                    </span>
                    <Input
                      autoComplete="name"
                      id="auth-name"
                      name="name"
                      placeholder="Sahil Patil"
                      required
                      className="h-11 rounded-xl border-slate-700/80 bg-[#0a1628] pl-10 text-xs font-medium text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="auth-email" className="text-xs font-bold text-slate-300">
                  Email
                </Label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    autoComplete="email"
                    id="auth-email"
                    name="email"
                    placeholder="yourname@example.com"
                    required
                    type="email"
                    className="h-11 rounded-xl border-slate-700/80 bg-[#0a1628] pl-10 text-xs font-medium text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="auth-password" className="text-xs font-bold text-slate-300">
                  Password
                </Label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    id="auth-password"
                    minLength={6}
                    name="password"
                    placeholder="Enter your password"
                    required
                    type={showPassword ? "text" : "password"}
                    className="h-11 rounded-xl border-slate-700/80 bg-[#0a1628] pl-10 pr-10 text-xs font-medium text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end pt-0.5">
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Please contact the administrator to reset your credentials.");
                  }}
                  className="text-xs font-bold text-indigo-400 hover:text-cyan-300 transition"
                >
                  Forgot password?
                </a>
              </div>

              {/* Main Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-indigo-600 font-extrabold text-white shadow-lg shadow-cyan-500/35 hover:opacity-95 text-xs transition cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Please wait...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    {mode === "login" ? "Login" : "Create Account"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative bg-[#061122] px-3 text-[11px] font-semibold text-slate-400">
                or continue with
              </span>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => alert("Google SSO is enabled in cloud configuration.")}
                className="flex items-center justify-center gap-2 h-10 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-md hover:bg-slate-100 transition cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                onClick={() => alert("GitHub SSO is enabled in cloud configuration.")}
                className="flex items-center justify-center gap-2 h-10 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-100 transition cursor-pointer"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                GitHub
              </button>
            </div>

            {/* Bottom Account Switch Link */}
            <div className="mt-6 text-center text-xs text-slate-400">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer inline-flex items-center gap-0.5"
                  >
                    Create one →
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer inline-flex items-center gap-0.5"
                  >
                    Sign in →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export { AuthPage };