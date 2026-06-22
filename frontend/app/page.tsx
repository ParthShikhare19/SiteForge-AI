"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mic, Sparkles, Globe, Zap, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: Mic,      label: "Voice & Text Input",   desc: "Speak naturally or type — AI extracts everything automatically." },
  { icon: Sparkles, label: "AI Content Generation", desc: "Headlines, copy, colors and layout crafted to your industry." },
  { icon: Zap,      label: "Instant Publish",       desc: "One click and your site is live with a shareable URL." },
];

const steps = [
  { num: "01", label: "Describe",  desc: "Tell us your business name, services, contact and hours." },
  { num: "02", label: "Generate",  desc: "AI builds a complete, professional website in seconds." },
  { num: "03", label: "Publish",   desc: "Share your live link with customers immediately." },
];

const perks = [
  "No credit card required",
  "No coding or design skills",
  "Live in under 3 minutes",
  "Custom domain support",
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050510] text-white overflow-hidden">

      {/* ── Grid dot pattern ── */}
      <div className="absolute inset-0 bg-grid-dots pointer-events-none" />

      {/* ── Ambient orbs ── */}
      <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none animate-orb"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%)", filter: "blur(60px)" }} />
      <div className="absolute top-[40%] right-[-12%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%)", filter: "blur(70px)", animationDelay: "4s" }} />
      <div className="absolute bottom-[-10%] left-[35%] w-[500px] h-[500px] rounded-full pointer-events-none animate-orb"
        style={{ background: "radial-gradient(circle, rgba(232,121,249,0.1) 0%, transparent 65%)", filter: "blur(60px)", animationDelay: "8s" }} />

      {/* ── Navbar ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 bg-[#050510]/60 backdrop-blur-xl sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">SiteForge AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/8 rounded-xl">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-500/25 px-5">
              Get Started <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-4 pt-24 pb-20">

        {/* Badge */}
        <motion.div {...fade(0)} className="mb-7">
          <span className="badge-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm text-purple-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-glow inline-block" />
            AI-Powered · Free Forever · No Credit Card
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 {...fade(0.1)} className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] max-w-4xl">
          Your Business Website,
          <br />
          <span className="gradient-text">Built by AI in Minutes</span>
        </motion.h1>

        {/* Sub */}
        <motion.p {...fade(0.2)} className="mt-6 text-lg md:text-xl text-white/50 max-w-2xl leading-relaxed">
          Speak or type about your business. SiteForge AI reads you, generates a
          complete, professional website, and publishes it instantly — zero design skills needed.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fade(0.3)} className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-500 text-white px-9 h-12 rounded-xl shadow-xl shadow-purple-500/25 glow-sm text-base font-semibold">
              Start Building Free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-white/12 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white px-9 h-12 rounded-xl text-base">
              Sign In
            </Button>
          </Link>
        </motion.div>

        {/* Perks */}
        <motion.div {...fade(0.4)} className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {perks.map(p => (
            <span key={p} className="flex items-center gap-1.5 text-sm text-white/40">
              <CheckCircle className="w-3.5 h-3.5 text-purple-400" /> {p}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-24">
        <motion.div {...fade(0.1)} className="text-center mb-12">
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Three steps to your live website</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              {...fade(0.2 + i * 0.1)}
              className="glass glass-hover rounded-2xl p-6 relative overflow-hidden group"
            >
              {/* Number watermark */}
              <span className="absolute top-3 right-4 text-6xl font-black text-white/4 select-none group-hover:text-purple-500/8 transition-colors">
                {s.num}
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center mb-4">
                <span className="text-purple-400 font-bold text-sm">{s.num}</span>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{s.label}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-28">
        <motion.div {...fade(0)} className="text-center mb-12">
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Everything you need to go live</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              {...fade(0.1 + i * 0.1)}
              className="glass glass-hover rounded-2xl p-6 group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:border-purple-500/40 transition-colors">
                <f.icon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-bold text-white mb-2">{f.label}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Stats / Social proof ── */}
      <section className="relative z-10 pb-24 px-4">
        <motion.div {...fade(0)} className="max-w-3xl mx-auto glass rounded-3xl p-8 text-center border border-white/8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            {[
              { val: "500+", label: "Websites Created" },
              { val: "< 3 min", label: "Average Build Time" },
              { val: "Free",   label: "Forever Plan" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-black gradient-text-purple">{s.val}</p>
                <p className="text-sm text-white/40 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/8">
            <p className="text-white/50 mb-4 text-sm">Ready to launch your website?</p>
            <Link href="/register">
              <Button className="bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-500/25 px-8 h-11">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center py-8 border-t border-white/5 text-white/25 text-sm">
        © {new Date().getFullYear()} SiteForge AI · Built with ❤️ for small businesses
      </footer>
    </div>
  );
}
