"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const email = params.get("email");
    const error = params.get("error");

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (token && email) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ email }));
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [params, router]);

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
        </div>
        <p className="text-white/40 text-sm">Signing you in…</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
