"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Menu, X, Star, Clock, MapPin, Phone, Mail,
  MessageCircle, Instagram, Facebook, Twitter, Youtube,
  ChevronRight, Shield, Award, CheckCircle, Briefcase, TrendingUp, Users,
} from "lucide-react";
import type { WebsiteJSON } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  shield: Shield, award: Award, check: CheckCircle, briefcase: Briefcase,
  trending: TrendingUp, users: Users, star: Star, clock: Clock,
};
function FIcon({ name, ...p }: { name: string; className?: string; style?: React.CSSProperties }) {
  const C = ICON_MAP[name] || Briefcase;
  return <C {...p} />;
}
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < count ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
      ))}
    </div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function Professional({ data, businessName }: { data: WebsiteJSON; businessName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const { hero, about, features, products, testimonials, contact, social } = data;
  const primary = data.theme_color || "#1a2942";
  const accent = data.accent_color || "#2563eb";
  const wa = (contact.whatsapp || contact.phone || "").replace(/\D/g, "");
  const waUrl = wa ? `https://wa.me/${wa}` : null;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primary }}>
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg" style={{ color: primary }}>{businessName}</span>
          </a>
          <nav className="hidden md:flex items-center gap-7">
            {["Services", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{l}</a>
            ))}
          </nav>
          <a href={`mailto:${contact.email || ""}`}
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: accent }}>
            Get in Touch
          </a>
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
            {["Services", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="block py-2.5 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="pt-16" style={{ backgroundColor: primary }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-40 -top-40 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: accent }} />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full opacity-5" style={{ backgroundColor: accent }} />
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <motion.div initial="hidden" animate="show" variants={stagger}>
              {hero.badge && (
                <motion.div variants={fadeUp}
                  className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6"
                  style={{ borderColor: `${accent}60`, color: accent }}>
                  <Award className="w-3.5 h-3.5" /> {hero.badge}
                </motion.div>
              )}
              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
                {hero.headline}
              </motion.h1>
              <motion.p variants={fadeUp} className="text-blue-200 text-lg mb-8 leading-relaxed">{hero.subheadline}</motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <a href={waUrl || "#contact"} target={waUrl ? "_blank" : undefined} rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-lg text-white text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: accent }}>
                  Schedule Consultation <ChevronRight className="w-4 h-4" />
                </a>
                <a href="#services"
                  className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-lg text-sm hover:bg-white/10 transition-colors">
                  {hero.cta_secondary || "View Services"}
                </a>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="grid grid-cols-2 gap-4">
              {[["200+", "Clients Served"], ["15+", "Years Experience"], ["98%", "Satisfaction"], ["50+", "Projects/yr"]].map(([num, label]) => (
                <div key={label} className="rounded-2xl p-6 border border-white/10 bg-white/5 text-center">
                  <p className="text-3xl font-extrabold text-white mb-1" style={{ color: accent }}>{num}</p>
                  <p className="text-xs text-blue-200 uppercase tracking-wider font-medium">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      {features?.length > 0 && (
        <section className="py-16 bg-gray-50 border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6"
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {features.map(f => (
                <motion.div key={f.id} variants={fadeUp} className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
                    <FIcon name={f.icon} className="w-5 h-5" style={{ color: accent }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 mb-0.5">{f.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* SERVICES */}
      {products?.length > 0 && (
        <section id="services" className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>{data.products_subtitle || "What We Offer"}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">{data.products_title || "Our Services"}</h2>
            </motion.div>
            <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {products.map(p => (
                <motion.div key={p.id} variants={fadeUp}
                  className="rounded-xl p-6 border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all group">
                  {p.image_url && !imgErrors[p.id] && (
                    <div className="relative w-full h-36 rounded-lg overflow-hidden mb-4">
                      <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgErrors(e => ({ ...e, [p.id]: true }))} />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{p.name}</h3>
                    {p.price != null && <span className="font-bold text-sm" style={{ color: accent }}>₹{Number(p.price).toLocaleString("en-IN")}</span>}
                  </div>
                  {p.description && <p className="text-gray-500 text-sm leading-relaxed">{p.description}</p>}
                  {p.badge && <span className="mt-3 inline-block text-xs font-bold px-3 py-0.5 rounded text-white" style={{ backgroundColor: accent }}>{p.badge}</span>}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>About Us</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-5">{about.title}</h2>
            <p className="text-gray-600 leading-relaxed mb-6">{about.content}</p>
            {about.highlights?.length > 0 && (
              <ul className="space-y-3">
                {about.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
                    <span className="text-sm">{h}</span>
                  </li>
                ))}
              </ul>
            )}
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-8 font-bold px-6 py-3 rounded-lg text-white text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: primary }}>
                <MessageCircle className="w-4 h-4" /> Chat With Us
              </a>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="space-y-4">
            {[["Certified Professionals", Shield, "Industry-recognized expertise"], ["Tailored Solutions", Briefcase, "Custom strategies for your needs"],
              ["Proven Results", TrendingUp, "Track record of measurable success"], ["Dedicated Support", Users, "Always available when you need us"]].map(([label, Icon, desc]) => (
              <div key={label as string} className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition-all">
                <div className="w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
                  <Icon className="w-5 h-5" style={{ color: accent }} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials?.length > 0 && (
        <section id="reviews" className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Client Testimonials</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">What Our Clients Say</h2>
            </motion.div>
            <motion.div className="grid md:grid-cols-3 gap-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {testimonials.map(t => (
                <motion.div key={t.id} variants={fadeUp} className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                  <Stars count={t.rating} />
                  <p className="text-gray-600 leading-relaxed my-4 text-sm">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: primary }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                      {t.role && <p className="text-xs text-gray-400">{t.role}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contact" className="py-20 border-t border-gray-100" style={{ backgroundColor: primary }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Let's Work Together</h2>
          <p className="text-blue-200 mb-10">Reach out for a free consultation</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors">
                <Phone className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-blue-300/60 uppercase tracking-wider mb-1">Call</p><p className="text-sm text-white">{contact.phone}</p></div>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors">
                <Mail className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-blue-300/60 uppercase tracking-wider mb-1">Email</p><p className="text-sm text-white break-all">{contact.email}</p></div>
              </a>
            )}
            {contact.address && (
              <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white/10">
                <MapPin className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-blue-300/60 uppercase tracking-wider mb-1">Office</p><p className="text-sm text-white">{contact.address}</p></div>
              </div>
            )}
            {contact.timings && (
              <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white/10">
                <Clock className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-blue-300/60 uppercase tracking-wider mb-1">Hours</p><p className="text-sm text-white">{contact.timings}</p></div>
              </div>
            )}
          </div>
          {waUrl && (
            <motion.a whileHover={{ scale: 1.05 }} href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-bold px-8 py-4 rounded-xl text-white text-base shadow-xl"
              style={{ backgroundColor: "#25D366" }}>
              <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
            </motion.a>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: primary }}>
              <Briefcase className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-900">{businessName}</span>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <div className="flex gap-4">
            {social?.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors"><Instagram className="w-5 h-5" /></a>}
            {social?.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors"><Facebook className="w-5 h-5" /></a>}
            {social?.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors"><Twitter className="w-5 h-5" /></a>}
            {social?.youtube && <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors"><Youtube className="w-5 h-5" /></a>}
          </div>
        </div>
      </footer>
    </div>
  );
}
