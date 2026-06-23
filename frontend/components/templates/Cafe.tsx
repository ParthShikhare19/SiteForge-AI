"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Menu, X, Star, Clock, MapPin, Phone, Mail,
  MessageCircle, Instagram, Facebook, Twitter, Youtube,
  ChevronRight, Coffee, Leaf, Heart, CheckCircle, Sparkles,
} from "lucide-react";
import type { WebsiteJSON } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  coffee: Coffee, leaf: Leaf, heart: Heart, star: Star, check: CheckCircle, sparkles: Sparkles, clock: Clock, shield: CheckCircle,
};
function FIcon({ name, ...p }: { name: string; className?: string; style?: React.CSSProperties }) {
  const C = ICON_MAP[name] || Coffee;
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

export default function Cafe({ data, businessName }: { data: WebsiteJSON; businessName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const { hero, about, features, products, testimonials, contact, social } = data;
  const primary = data.theme_color || "#3d2b1a";
  const accent = data.accent_color || "#c08040";
  const bg = "#fdf8f2";
  const wa = (contact.whatsapp || contact.phone || "").replace(/\D/g, "");
  const waUrl = wa ? `https://wa.me/${wa}` : null;

  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: bg }}>
      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <Coffee className="w-5 h-5" style={{ color: accent }} />
            <span className="font-bold text-xl tracking-tight" style={{ color: primary }}>{businessName}</span>
          </a>
          <nav className="hidden md:flex items-center gap-7">
            {["Menu", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: primary }}>{l}</a>
            ))}
          </nav>
          <a href={waUrl || "#contact"} target={waUrl ? "_blank" : undefined} rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full text-white shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: accent }}>
            Order Now
          </a>
          <button className="md:hidden p-2 rounded-lg" onClick={() => setMenuOpen(o => !o)} style={{ color: primary }}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-amber-100 px-4 py-3 space-y-1">
            {["Menu", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="block py-2.5 px-3 text-sm font-medium rounded-lg hover:bg-amber-50"
                style={{ color: primary }} onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative pt-16 overflow-hidden" style={{ backgroundColor: primary }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c08040' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='3'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            {hero.badge && (
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6"
                style={{ backgroundColor: `${accent}30`, color: accent }}>
                <Leaf className="w-3 h-3" /> {hero.badge}
              </motion.div>
            )}
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
              {hero.headline}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-amber-200 text-lg mb-8 leading-relaxed">{hero.subheadline}</motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <a href="#menu"
                className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-full text-sm shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: accent, color: "#fff" }}>
                View Menu <ChevronRight className="w-4 h-4" />
              </a>
              {waUrl && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-amber-300/40 text-white font-semibold px-7 py-3.5 rounded-full text-sm hover:bg-white/10 transition-colors">
                  {hero.cta_secondary || "Order Ahead"}
                </a>
              )}
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}
            className="hidden md:block">
            {hero.hero_image ? (
              <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl">
                <Image src={hero.hero_image} alt={businessName} fill className="object-cover" priority />
              </div>
            ) : (
              <div className="h-80 rounded-3xl flex items-center justify-center" style={{ backgroundColor: `${accent}20` }}>
                <Coffee className="w-24 h-24 opacity-30 text-amber-200" />
              </div>
            )}
          </motion.div>
        </div>
        <div className="h-10" style={{ background: `linear-gradient(to bottom, transparent, ${bg})` }} />
      </section>

      {/* FEATURES */}
      {features?.length > 0 && (
        <section className="py-14" style={{ backgroundColor: bg }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-5"
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {features.map(f => (
                <motion.div key={f.id} variants={fadeUp}
                  className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-amber-100 hover:shadow-md transition-all">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${accent}15` }}>
                    <FIcon name={f.icon} className="w-5 h-5" style={{ color: accent }} />
                  </div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: primary }}>{f.title}</h3>
                  <p className="text-gray-500 text-xs">{f.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* MENU */}
      {products?.length > 0 && (
        <section id="menu" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>{data.products_subtitle || "Crafted with Love"}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-2" style={{ color: primary }}>{data.products_title || "Our Menu"}</h2>
            </motion.div>
            <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {products.map(p => (
                <motion.div key={p.id} variants={fadeUp}
                  className="group rounded-2xl overflow-hidden border border-amber-100 hover:shadow-xl transition-all bg-white">
                  {p.image_url && !imgErrors[p.id] && (
                    <div className="relative h-44 overflow-hidden">
                      <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgErrors(e => ({ ...e, [p.id]: true }))} />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-bold" style={{ color: primary }}>{p.name}</h3>
                      {p.price != null && <span className="font-bold text-sm" style={{ color: accent }}>₹{Number(p.price).toLocaleString("en-IN")}</span>}
                    </div>
                    {p.description && <p className="text-gray-500 text-sm leading-relaxed">{p.description}</p>}
                    {p.badge && <span className="mt-3 inline-block text-xs font-bold px-3 py-0.5 rounded-full text-white" style={{ backgroundColor: accent }}>{p.badge}</span>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section id="about" className="py-20" style={{ backgroundColor: bg }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Our Story</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 mb-5" style={{ color: primary }}>{about.title}</h2>
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
                className="inline-flex items-center gap-2 mt-8 font-bold px-6 py-3 rounded-full text-white text-sm shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: accent }}>
                <MessageCircle className="w-4 h-4" /> Order via WhatsApp
              </a>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden h-80 shadow-xl">
            {hero.hero_image ? (
              <Image src={hero.hero_image} alt={businessName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${primary}15` }}>
                <Coffee className="w-20 h-20 opacity-20" style={{ color: primary }} />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials?.length > 0 && (
        <section id="reviews" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Customer Love</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-2" style={{ color: primary }}>What People Say</h2>
            </motion.div>
            <motion.div className="grid md:grid-cols-3 gap-5" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {testimonials.map(t => (
                <motion.div key={t.id} variants={fadeUp} className="rounded-2xl p-6 border border-amber-100 bg-amber-50/50">
                  <Stars count={t.rating} />
                  <p className="text-gray-600 leading-relaxed my-4 text-sm">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-amber-100">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: accent }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: primary }}>{t.name}</p>
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
      <section id="contact" className="py-20" style={{ backgroundColor: primary }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Visit Us</h2>
          <p className="text-amber-200/70 mb-10">We'd love to have you in</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors">
                <Phone className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-amber-200/60 uppercase tracking-wider mb-1">Call</p><p className="text-sm text-white">{contact.phone}</p></div>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors">
                <Mail className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-amber-200/60 uppercase tracking-wider mb-1">Email</p><p className="text-sm text-white break-all">{contact.email}</p></div>
              </a>
            )}
            {contact.address && (
              <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/10">
                <MapPin className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-amber-200/60 uppercase tracking-wider mb-1">Find Us</p><p className="text-sm text-white">{contact.address}</p></div>
              </div>
            )}
            {contact.timings && (
              <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/10">
                <Clock className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-amber-200/60 uppercase tracking-wider mb-1">Hours</p><p className="text-sm text-white">{contact.timings}</p></div>
              </div>
            )}
          </div>
          {waUrl && (
            <motion.a whileHover={{ scale: 1.05 }} href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-bold px-8 py-4 rounded-full text-white text-base shadow-xl"
              style={{ backgroundColor: "#25D366" }}>
              <MessageCircle className="w-5 h-5" /> Order via WhatsApp
            </motion.a>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-amber-100 py-8 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4" style={{ color: accent }} />
            <span className="font-bold" style={{ color: primary }}>{businessName}</span>
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
