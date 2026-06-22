"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGoogleLogin } from "@react-oauth/google";
import { Globe, ArrowRight, Loader2, Mic, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/services/authService";
import { api } from "@/lib/api";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const highlights = [
  { icon: Mic,      text: "Voice & text business input" },
  { icon: Sparkles, text: "AI-generated website content" },
  { icon: Zap,      text: "Publish live in under 3 minutes" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      setGoogleLoading(true);
      setError("");
      try {
        const result = await api.post<{ access_token: string; user: { email: string } }>(
          "/auth/google/token",
          { access_token: response.access_token },
          false,
        );
        localStorage.setItem("access_token", result.access_token);
        localStorage.setItem("user", JSON.stringify(result.user));
        router.push("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google sign-in failed");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError("Google sign-in was cancelled or failed"),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await register(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050510] flex overflow-hidden">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-purple-950/80 to-[#050510]" />
        <div className="absolute inset-0 bg-grid-dots opacity-40" />
        <div className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 65%)", filter: "blur(60px)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">SiteForge AI</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Launch your business<br />
            <span className="gradient-text">online today.</span>
          </h2>
          <p className="text-white/50 text-base mb-10 leading-relaxed">
            No designers. No developers. Just describe your business and watch AI do the rest.
          </p>
          <div className="space-y-4">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <h.icon className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-white/70 text-sm">{h.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-white/25 text-xs">© {new Date().getFullYear()} SiteForge AI · Free forever</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)", filter: "blur(60px)" }} />

        <div className="relative z-10 w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">SiteForge AI</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-white/40 text-sm mb-8">Start building your business website — it&apos;s free</p>

          {/* Google button */}
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/9 hover:border-white/20 text-white/80 hover:text-white transition-all text-sm font-medium mb-5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading
              ? <Loader2 className="w-4 h-4 animate-spin text-white/50" />
              : <GoogleIcon />}
            {googleLoading ? "Signing in…" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/25 text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/60 text-xs font-medium uppercase tracking-wider">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} required
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-purple-500/60 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/60 text-xs font-medium uppercase tracking-wider">Password</Label>
              <Input id="password" type="password" placeholder="Min. 8 characters" value={password}
                onChange={e => setPassword(e.target.value)} required
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-purple-500/60 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-white/60 text-xs font-medium uppercase tracking-wider">Confirm Password</Label>
              <Input id="confirm" type="password" placeholder="Repeat your password" value={confirm}
                onChange={e => setConfirm(e.target.value)} required
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-purple-500/60 rounded-xl" />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading}
              className="w-full h-11 bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20 rounded-xl text-base font-semibold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4 ml-1.5" /></>}
            </Button>
          </form>

          <p className="text-sm text-white/35 mt-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
