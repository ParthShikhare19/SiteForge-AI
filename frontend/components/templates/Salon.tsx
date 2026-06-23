"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Menu, X, Star, Clock, MapPin, Phone, Mail,
  MessageCircle, Instagram, Facebook, Twitter, Youtube,
  ChevronRight, Sparkles, Heart, CheckCircle, Scissors,
} from "lucide-react";
import type { WebsiteJSON } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  sparkles: Sparkles, heart: Heart, star: Star, check: CheckCircle, clock: Clock,
  scissors: Scissors, shield: CheckCircle,
};
function FIcon({ name, ...p }: { name: string; className?: string; style?: React.CSSProperties }) {
  const C = ICON_MAP[name] || Sparkles;
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

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function Salon({ data, businessName }: { data: WebsiteJSON; businessName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const { hero, about, features, products, testimonials, contact, social } = data;
  const primary = data.theme_color || "#1a0a1e";
  const accent = data.accent_color || "#d4af37";
  const wa = (contact.whatsapp || contact.phone || "").replace(/\D/g, "");
  const waUrl = wa ? `https://wa.me/${wa}` : null;

  return (
    <div className="min-h-screen font-sans text-white antialiased" style={{ backgroundColor: primary }}>
      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md border-b" style={{ backgroundColor: `${primary}f0`, borderColor: `${accent}30` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <Scissors className="w-5 h-5" style={{ color: accent }} />
            <span className="font-light text-lg tracking-[0.1em] text-white uppercase">{businessName}</span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {["Services", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">{l}</a>
            ))}
          </nav>
          <a href={waUrl || "#contact"} target={waUrl ? "_blank" : undefined} rel="noopener noreferrer"
            className="hidden md:inline-flex text-xs font-semibold uppercase tracking-widest px-5 py-2.5 transition-all"
            style={{ backgroundColor: accent, color: "#1a0a1e" }}>
            Book Now
          </a>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ backgroundColor: primary, borderColor: `${accent}30` }}>
            {["Services", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="block py-2.5 px-3 text-sm text-gray-400 hover:text-white"
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
            <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${primary}f5 40%, ${primary}99)` }} />
          </>
        ) : (
          <div className="absolute inset-0">
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 70% 50%, ${accent}15, transparent 60%)` }} />
          </div>
        )}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            {hero.badge && (
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6"
                style={{ borderColor: `${accent}60`, color: accent }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} /> {hero.badge}
              </motion.div>
            )}
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl font-light text-white mb-5 leading-tight tracking-wide">
              {hero.headline}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-gray-300 text-lg mb-8 leading-relaxed font-light">{hero.subheadline}</motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <a href={waUrl || "#contact"} target={waUrl ? "_blank" : undefined} rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 text-sm uppercase tracking-wider transition-opacity hover:opacity-90"
                style={{ backgroundColor: accent, color: "#1a0a1e" }}>
                Book Appointment <ChevronRight className="w-4 h-4" />
              </a>
              <a href="#services"
                className="inline-flex items-center gap-2 border text-white font-semibold px-7 py-3.5 text-sm uppercase tracking-wider hover:bg-white/10 transition-colors"
                style={{ borderColor: `${accent}60` }}>
                {hero.cta_secondary || "View Services"}
              </a>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
            className="hidden md:flex justify-center">
            <div className="relative w-80 h-96 overflow-hidden border" style={{ borderColor: `${accent}30` }}>
              {hero.hero_image ? (
                <Image src={hero.hero_image} alt={businessName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accent}15, transparent)` }}>
                  <Scissors className="w-20 h-20 opacity-20" style={{ color: accent }} />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: `linear-gradient(to top, ${primary}, transparent)` }}>
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1" style={{ backgroundColor: accent }} />
                  <span className="text-xs uppercase tracking-widest" style={{ color: accent }}>Premium Beauty</span>
                  <div className="h-px flex-1" style={{ backgroundColor: accent }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      {features?.length > 0 && (
        <section className="py-16 border-y" style={{ borderColor: `${accent}20`, backgroundColor: `${primary}cc` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8"
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {features.map(f => (
                <motion.div key={f.id} variants={fadeUp} className="text-center">
                  <div className="w-12 h-12 border mx-auto mb-4 flex items-center justify-center" style={{ borderColor: `${accent}40` }}>
                    <FIcon name={f.icon} className="w-5 h-5" style={{ color: accent }} />
                  </div>
                  <p className="font-semibold text-white text-sm tracking-wide mb-1">{f.title}</p>
                  <p className="text-xs text-gray-400">{f.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* SERVICES */}
      {products?.length > 0 && (
        <section id="services" className="py-24" style={{ backgroundColor: primary }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-10" style={{ backgroundColor: accent }} />
                <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>{data.products_subtitle || "What We Offer"}</span>
                <div className="h-px w-10" style={{ backgroundColor: accent }} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-light text-white tracking-wide">{data.products_title || "Our Services"}</h2>
            </motion.div>
            <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {products.map(p => (
                <motion.div key={p.id} variants={fadeUp}
                  className="border p-6 hover:border-amber-400/60 transition-all group" style={{ borderColor: `${accent}25`, backgroundColor: `${primary}80` }}>
                  {p.image_url && !imgErrors[p.id] && (
                    <div className="relative w-full h-44 mb-4 overflow-hidden">
                      <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgErrors(e => ({ ...e, [p.id]: true }))} />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white tracking-wide">{p.name}</h3>
                    {p.price != null && <span className="font-semibold text-sm" style={{ color: accent }}>₹{Number(p.price).toLocaleString("en-IN")}</span>}
                  </div>
                  {p.description && <p className="text-gray-400 text-sm leading-relaxed">{p.description}</p>}
                  {p.badge && <span className="mt-3 inline-block text-xs font-bold px-3 py-0.5" style={{ backgroundColor: accent, color: "#1a0a1e" }}>{p.badge}</span>}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section id="about" className="py-24 border-y" style={{ borderColor: `${accent}20`, backgroundColor: `${primary}cc` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-10" style={{ backgroundColor: accent }} />
                <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>About Us</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-light text-white mb-5 leading-relaxed">{about.title}</h2>
              <p className="text-gray-300 leading-relaxed mb-6 font-light">{about.content}</p>
              {about.highlights?.length > 0 && (
                <ul className="space-y-3">
                  {about.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <div className="w-4 h-px flex-shrink-0" style={{ backgroundColor: accent }} />
                      <span className="text-sm">{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="grid grid-cols-2 gap-4">
              {[["500+", "Happy Clients"], ["10+", "Years Experience"], ["5★", "Rated Salon"], ["15+", "Services Offered"]].map(([num, label]) => (
                <div key={label} className="border p-6 text-center" style={{ borderColor: `${accent}30` }}>
                  <p className="text-3xl font-light mb-1" style={{ color: accent }}>{num}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials?.length > 0 && (
        <section id="reviews" className="py-24" style={{ backgroundColor: primary }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-10" style={{ backgroundColor: accent }} />
                <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>Client Love</span>
                <div className="h-px w-10" style={{ backgroundColor: accent }} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-light text-white">What Clients Say</h2>
            </motion.div>
            <motion.div className="grid md:grid-cols-3 gap-5" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {testimonials.map(t => (
                <motion.div key={t.id} variants={fadeUp} className="border p-6 flex flex-col gap-4" style={{ borderColor: `${accent}25` }}>
                  <Stars count={t.rating} />
                  <p className="text-gray-300 leading-relaxed text-sm font-light flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: `${accent}20` }}>
                    <div className="w-8 h-8 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: accent, color: "#1a0a1e" }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{t.name}</p>
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
      <section id="contact" className="py-24 border-t" style={{ borderColor: `${accent}20` }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-10" style={{ backgroundColor: accent }} />
            <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>Visit Us</span>
            <div className="h-px w-10" style={{ backgroundColor: accent }} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-white mb-12">Book Your Appointment</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex flex-col items-center gap-3 p-5 border hover:border-amber-400/60 transition-colors" style={{ borderColor: `${accent}25` }}>
                <Phone className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Call</p><p className="text-sm">{contact.phone}</p></div>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex flex-col items-center gap-3 p-5 border hover:border-amber-400/60 transition-colors" style={{ borderColor: `${accent}25` }}>
                <Mail className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Email</p><p className="text-sm break-all">{contact.email}</p></div>
              </a>
            )}
            {contact.address && (
              <div className="flex flex-col items-center gap-3 p-5 border" style={{ borderColor: `${accent}25` }}>
                <MapPin className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Location</p><p className="text-sm">{contact.address}</p></div>
              </div>
            )}
            {contact.timings && (
              <div className="flex flex-col items-center gap-3 p-5 border" style={{ borderColor: `${accent}25` }}>
                <Clock className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Hours</p><p className="text-sm">{contact.timings}</p></div>
              </div>
            )}
          </div>
          {waUrl && (
            <motion.a whileHover={{ scale: 1.04 }} href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-bold px-8 py-4 text-sm uppercase tracking-wider"
              style={{ backgroundColor: "#25D366", color: "#fff" }}>
              <MessageCircle className="w-5 h-5" /> Book via WhatsApp
            </motion.a>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8 px-4 sm:px-6" style={{ borderColor: `${accent}20` }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4" style={{ color: accent }} />
            <span className="font-light tracking-[0.1em] text-white uppercase">{businessName}</span>
          </div>
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
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
