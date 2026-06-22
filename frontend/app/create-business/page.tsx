"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mic, Type, Loader2, Globe, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import VoiceRecorder from "@/components/VoiceRecorder";
import { transcribeAudio, transcribeText } from "@/services/businessService";
import { generateWebsite } from "@/services/websiteService";
import type { Business } from "@/types";

type Step = "input" | "processing" | "review" | "generating" | "done";
type Mode = "voice" | "text";

export default function CreateBusinessPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("voice");
  const [step, setStep] = useState<Step>("input");
  const [textInput, setTextInput] = useState("");
  const [business, setBusiness] = useState<Business | null>(null);
  const [error, setError] = useState("");

  async function handleAudio(blob: Blob) {
    setStep("processing");
    setError("");
    try {
      const result = await transcribeAudio(blob);
      setBusiness(result.business);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process audio");
      setStep("input");
    }
  }

  async function handleTextSubmit() {
    if (!textInput.trim()) return;
    setStep("processing");
    setError("");
    try {
      const result = await transcribeText(textInput);
      setBusiness(result.business);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process text");
      setStep("input");
    }
  }

  async function handleGenerate() {
    if (!business) return;
    setStep("generating");
    try {
      await generateWebsite(business.id, business.category);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate website");
      setStep("review");
    }
  }

  /* ── Done screen ── */
  if (step === "done" && business) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-56 h-56 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center space-y-5 shadow-2xl shadow-purple-500/10">
          <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Website Created!</h2>
          <p className="text-white/50 text-sm">Your website is live and ready to share.</p>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3">
            <p className="font-mono text-purple-400 text-sm">/sites/{business.slug}</p>
          </div>
          <div className="flex gap-3 pt-1">
            <Link href={`/sites/${business.slug}`} target="_blank" className="flex-1">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20">
                View Website
              </Button>
            </Link>
            <Link href={`/editor?business_id=${business.id}`} className="flex-1">
              <Button variant="outline" className="w-full border-white/10 text-white/70 hover:text-white hover:bg-white/10 bg-transparent">
                Edit
              </Button>
            </Link>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="w-full text-white/40 hover:text-white hover:bg-white/5">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-400" />
            <h1 className="font-semibold text-white">Create Business Website</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* ── INPUT STEP ── */}
        {step === "input" && (
          <>
            {/* Mode toggle */}
            <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1.5 w-fit">
              {(["voice", "text"] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === m
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {m === "voice" ? <Mic className="w-3.5 h-3.5" /> : <Type className="w-3.5 h-3.5" />}
                  {m === "voice" ? "Voice" : "Text"}
                </button>
              ))}
            </div>

            {/* Main card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/5">
              <div className="px-8 py-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-white">
                  {mode === "voice" ? "Tell us about your business" : "Describe your business"}
                </h2>
                <p className="text-sm text-white/40 mt-1.5">
                  {mode === "voice"
                    ? "Record yourself — business name, what you sell, contact details, hours, etc."
                    : "Type about your business — name, category, products, contact details, working hours, etc."}
                </p>
              </div>

              <div className="px-8 py-8">
                {mode === "voice" ? (
                  <div className="flex flex-col items-center py-6 gap-6">
                    <VoiceRecorder onAudioReady={handleAudio} />
                    <p className="text-xs text-white/30 text-center max-w-sm leading-relaxed">
                      Example: &quot;My name is Parth and I run a bakery called Sweet Bites. We sell cakes,
                      pastries and breads. We&apos;re open 8am to 8pm. Call us at 9876543210.&quot;
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Textarea
                      rows={6}
                      placeholder="Example: My name is Rahul and I run a clothing store called Fashion Hub in Mumbai. We sell traditional and western wear for men and women. Open Mon-Sat 10am-8pm. Contact: 9876543210, fashionhub@gmail.com"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="resize-none bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl focus:border-purple-500/50 focus:ring-purple-500/20"
                    />
                    <Button
                      onClick={handleTextSubmit}
                      disabled={!textInput.trim()}
                      className="w-full bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 h-11"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Extract & Generate Website
                    </Button>
                  </div>
                )}
                {error && (
                  <p className="text-sm text-red-400 mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── LOADING STEPS ── */}
        {(step === "processing" || step === "generating") && (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="w-20 h-20 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center">
              <Loader2 className="w-9 h-9 text-purple-400 animate-spin" />
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-lg font-semibold text-white">
                {step === "processing" ? "Extracting business information…" : "Generating your website…"}
              </p>
              <p className="text-sm text-white/40">This takes a few seconds</p>
            </div>
          </div>
        )}

        {/* ── REVIEW STEP ── */}
        {step === "review" && business && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/5">
            <div className="px-8 py-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Review Extracted Information</h2>
              <p className="text-sm text-white/40 mt-1.5">
                AI extracted the following from your description. Confirm to generate your website.
              </p>
            </div>

            <div className="px-8 py-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Business Name", value: business.name },
                  { label: "Category", value: business.category },
                  { label: "Phone", value: business.phone || "—" },
                  { label: "Email", value: business.email || "—" },
                  { label: "Address", value: business.address || "—" },
                  { label: "Timings", value: business.timings || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-3.5">
                    <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-medium text-white/80">{value}</p>
                  </div>
                ))}
              </div>

              {business.description && (
                <div className="bg-white/5 border border-white/8 rounded-xl p-3.5">
                  <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-white/70 leading-relaxed">{business.description}</p>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("input")}
                  className="flex-1 border-white/10 text-white/60 hover:text-white hover:bg-white/10 bg-transparent"
                >
                  Start Over
                </Button>
                <Button
                  onClick={handleGenerate}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Website
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
