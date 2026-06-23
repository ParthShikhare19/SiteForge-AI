"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Menu, X, Star, Clock, MapPin, Phone, Mail,
  MessageCircle, Instagram, Facebook, Twitter, Youtube,
  ChevronRight, Zap, Flame, Shield, CheckCircle, Dumbbell, Trophy,
} from "lucide-react";
import type { WebsiteJSON } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  zap: Zap, flame: Flame, shield: Shield, check: CheckCircle, dumbbell: Dumbbell,
  star: Star, trophy: Trophy, clock: Clock,
};
function FIcon({ name, ...p }: { name: string; className?: string; style?: React.CSSProperties }) {
  const C = ICON_MAP[name] || Zap;
  return <C {...p} />;
}
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < count ? "fill-amber-400 text-amber-400" : "text-gray-600"}`} />
      ))}
    </div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

export default function Gym({ data, businessName }: { data: WebsiteJSON; businessName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const { hero, about, features, products, testimonials, contact, social } = data;
  const primary = data.theme_color || "#111111";
  const accent = data.accent_color || "#ef4444";
  const wa = (contact.whatsapp || contact.phone || "").replace(/\D/g, "");
  const waUrl = wa ? `https://wa.me/${wa}` : null;

  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: primary }}>
      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 border-b border-gray-900" style={{ backgroundColor: `${primary}f5` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" style={{ color: accent }} />
            <span className="font-black text-white text-lg uppercase tracking-wider">{businessName}</span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {["Programs", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">{l}</a>
            ))}
          </nav>
          <a href={waUrl || "#contact"} target={waUrl ? "_blank" : undefined} rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-5 py-2.5 text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: accent }}>
            Join Now <Zap className="w-3.5 h-3.5" />
          </a>
          <button className="md:hidden p-2 text-white" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-gray-900 px-4 py-3 space-y-1" style={{ backgroundColor: primary }}>
            {["Programs", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="block py-2.5 text-sm text-gray-400 hover:text-white font-bold uppercase tracking-wider"
                onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {hero.hero_image ? (
          <>
            <Image src={hero.hero_image} alt={businessName} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-black/70" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primary} 60%, ${accent}30)` }} />
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${primary}f0 50%, transparent)` }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 relative z-10">
          <motion.div className="max-w-2xl" initial="hidden" animate="show" variants={stagger}>
            {hero.badge && (
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-8 px-4 py-2"
                style={{ backgroundColor: accent, color: "#fff" }}>
                <Flame className="w-3.5 h-3.5" /> {hero.badge}
              </motion.div>
            )}
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl font-black text-white mb-5 leading-none uppercase tracking-tight">
              {hero.headline}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-gray-400 text-xl mb-10 font-medium">{hero.subheadline}</motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <a href={waUrl || "#contact"} target={waUrl ? "_blank" : undefined} rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-black px-8 py-4 text-sm uppercase tracking-wider text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: accent }}>
                Join Now <ChevronRight className="w-4 h-4" />
              </a>
              <a href="#programs"
                className="inline-flex items-center gap-2 border-2 border-gray-700 text-white font-bold px-8 py-4 text-sm uppercase tracking-wider hover:border-gray-500 transition-colors">
                {hero.cta_secondary || "View Programs"}
              </a>
            </motion.div>
          </motion.div>
          <div className="absolute right-8 bottom-20 hidden xl:flex flex-col gap-6">
            {[["6AM-10PM", "Open Daily"], ["3000+", "Members"], ["50+", "Classes/wk"]].map(([num, label]) => (
              <div key={label} className="text-right">
                <p className="text-2xl font-black text-white">{num}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: accent }} />
      </section>

      {/* FEATURES */}
      {features?.length > 0 && (
        <section className="border-b border-gray-900" style={{ backgroundColor: "#0a0a0a" }}>
          <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6"
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            {features.map(f => (
              <motion.div key={f.id} variants={fadeUp} className="flex items-start gap-4">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${accent}20` }}>
                  <FIcon name={f.icon} className="w-5 h-5" style={{ color: accent }} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm uppercase tracking-wide">{f.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* PROGRAMS */}
      {products?.length > 0 && (
        <section id="programs" className="py-24" style={{ backgroundColor: primary }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div className="mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>{data.products_subtitle || "Training Options"}</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mt-2 uppercase">{data.products_title || "Programs"}</h2>
            </motion.div>
            <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {products.map(p => (
                <motion.div key={p.id} variants={fadeUp}
                  className="group border border-gray-800 hover:border-red-500/40 transition-all overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
                  {p.image_url && !imgErrors[p.id] && (
                    <div className="relative h-48 overflow-hidden">
                      <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgErrors(e => ({ ...e, [p.id]: true }))} />
                      <div className="absolute inset-0 bg-black/40" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-black text-white text-lg uppercase tracking-wide">{p.name}</h3>
                      {p.price != null && (
                        <span className="font-black text-lg" style={{ color: accent }}>₹{Number(p.price).toLocaleString("en-IN")}<span className="text-xs text-gray-500 font-normal">/mo</span></span>
                      )}
                    </div>
                    {p.description && <p className="text-gray-400 text-sm leading-relaxed">{p.description}</p>}
                    {p.badge && <span className="mt-4 inline-block text-xs font-black px-3 py-1 uppercase tracking-wider text-white" style={{ backgroundColor: accent }}>{p.badge}</span>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section id="about" className="py-24 border-y border-gray-900" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>About Us</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2 mb-6 uppercase">{about.title}</h2>
            <p className="text-gray-400 leading-relaxed mb-6">{about.content}</p>
            {about.highlights?.length > 0 && (
              <ul className="space-y-2.5">
                {about.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
                    <span className="text-sm font-medium">{h}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="grid grid-cols-2 gap-3">
            {(
              [["Expert Trainers", Trophy], ["Modern Equipment", Dumbbell], ["Nutrition Guidance", Flame], ["Progress Tracking", Zap]] as [string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>][]
            ).map(([label, Icon]) => (
              <div key={label} className="border border-gray-800 p-6 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
                  <Icon className="w-6 h-6" style={{ color: accent }} />
                </div>
                <p className="text-xs font-bold text-gray-300 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials?.length > 0 && (
        <section id="reviews" className="py-24" style={{ backgroundColor: primary }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div className="mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>Success Stories</span>
              <h2 className="text-4xl font-black text-white mt-2 uppercase">Member Results</h2>
            </motion.div>
            <motion.div className="grid md:grid-cols-3 gap-4" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {testimonials.map(t => (
                <motion.div key={t.id} variants={fadeUp} className="border border-gray-800 p-6 flex flex-col gap-4" style={{ backgroundColor: "#0a0a0a" }}>
                  <Stars count={t.rating} />
                  <p className="text-gray-300 leading-relaxed text-sm flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                    <div className="w-8 h-8 flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: accent }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm uppercase tracking-wide">{t.name}</p>
                      {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contact" className="py-24 border-t border-gray-900" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>Get Started</span>
          <h2 className="text-4xl font-black text-white mt-2 mb-12 uppercase">Start Your Journey</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex flex-col items-center gap-3 p-5 border border-gray-800 hover:border-red-500/40 transition-colors">
                <Phone className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Call</p><p className="text-sm text-white">{contact.phone}</p></div>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex flex-col items-center gap-3 p-5 border border-gray-800 hover:border-red-500/40 transition-colors">
                <Mail className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Email</p><p className="text-sm text-white break-all">{contact.email}</p></div>
              </a>
            )}
            {contact.address && (
              <div className="flex flex-col items-center gap-3 p-5 border border-gray-800">
                <MapPin className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Location</p><p className="text-sm text-white">{contact.address}</p></div>
              </div>
            )}
            {contact.timings && (
              <div className="flex flex-col items-center gap-3 p-5 border border-gray-800">
                <Clock className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Hours</p><p className="text-sm text-white">{contact.timings}</p></div>
              </div>
            )}
          </div>
          {waUrl && (
            <motion.a whileHover={{ scale: 1.04 }} href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-black px-8 py-4 text-white text-sm uppercase tracking-wider"
              style={{ backgroundColor: "#25D366" }}>
              <MessageCircle className="w-5 h-5" /> Join on WhatsApp
            </motion.a>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-900 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4" style={{ color: accent }} />
            <span className="font-black text-white uppercase tracking-wider">{businessName}</span>
          </div>
          <p className="text-sm text-gray-700">© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <div className="flex gap-5">
            {social?.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>}
            {social?.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors"><Facebook className="w-4 h-4" /></a>}
            {social?.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>}
            {social?.youtube && <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors"><Youtube className="w-4 h-4" /></a>}
          </div>
        </div>
      </footer>
    </div>
  );
}
