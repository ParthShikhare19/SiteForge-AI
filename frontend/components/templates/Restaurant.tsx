"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Menu, X, Utensils, Star, Clock, MapPin, Phone, Mail,
  MessageCircle, Instagram, Facebook, Twitter, Youtube,
  ChevronRight, Flame, Award, Users, Leaf,
} from "lucide-react";
import type { WebsiteJSON } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  flame: Flame, award: Award, users: Users, leaf: Leaf, star: Star,
  utensils: Utensils, clock: Clock, shield: Award,
};
function FIcon({ name, ...p }: { name: string; className?: string; style?: React.CSSProperties }) {
  const C = ICON_MAP[name] || Utensils;
  return <C {...p} />;
}
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < count ? "fill-amber-400 text-amber-400" : "text-gray-600"}`} />
      ))}
    </div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function Restaurant({ data, businessName }: { data: WebsiteJSON; businessName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const { hero, about, features, products, testimonials, contact, social } = data;
  const primary = data.theme_color || "#1c1917";
  const accent = data.accent_color || "#d97706";
  const wa = (contact.whatsapp || contact.phone || "").replace(/\D/g, "");
  const waUrl = wa ? `https://wa.me/${wa}` : null;

  return (
    <div className="min-h-screen bg-stone-950 font-sans text-white antialiased">
      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 bg-stone-950/95 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accent}, #92400e)` }}>
              <Utensils className="w-4 h-4 text-white" />
            </span>
            <span className="font-bold text-white text-lg truncate max-w-[180px]">{businessName}</span>
          </a>
          <nav className="hidden md:flex items-center gap-7">
            {["Menu", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className="text-sm font-medium text-stone-300 hover:text-white transition-colors">{l}</a>
            ))}
          </nav>
          <div className="hidden md:flex gap-3">
            <a href="#menu"
              className="text-sm font-bold px-5 py-2.5 rounded-full text-white transition-transform hover:scale-105"
              style={{ backgroundColor: accent }}>{hero.cta_text || "View Menu"}</a>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-stone-800" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-stone-950 border-t border-stone-800 px-4 py-3 space-y-1">
            {["Menu", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className="block py-2.5 px-2 text-sm font-medium text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg"
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
            <div className="absolute inset-0 bg-stone-950/75" />
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center bottom, ${accent}30, transparent 70%)` }} />
          </>
        ) : (
          <div className="absolute inset-0 bg-stone-950">
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${accent}25, transparent 70%)` }} />
          </div>
        )}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 relative z-10 text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            {hero.badge && (
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 border border-amber-600/40 bg-amber-600/10 rounded-full px-4 py-1.5 text-amber-400 text-sm font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> {hero.badge}
              </motion.div>
            )}
            <motion.h1 variants={fadeUp} transition={{ duration: 0.7 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-white mb-6 leading-[1.05]">
              {hero.headline}
            </motion.h1>
            <motion.div variants={fadeUp} className="w-20 h-1 mx-auto rounded-full mb-6" style={{ backgroundColor: accent }} />
            <motion.p variants={fadeUp} className="text-xl text-stone-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              {hero.subheadline}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
              <a href="#menu"
                className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-full text-white transition-transform hover:scale-105 shadow-lg"
                style={{ backgroundColor: accent }}>
                {hero.cta_text} <ChevronRight className="w-4 h-4" />
              </a>
              {waUrl && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-stone-600 bg-stone-800/50 hover:bg-stone-700 text-white font-semibold px-8 py-4 rounded-full text-sm transition-all">
                  <MessageCircle className="w-4 h-4" style={{ color: "#25D366" }} /> Reserve Table
                </a>
              )}
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-stone-500 animate-bounce">
          <ChevronRight className="w-5 h-5 rotate-90" />
        </div>
      </section>

      {/* FEATURES */}
      {features?.length > 0 && (
        <section className="border-y border-stone-800 bg-stone-900">
          <motion.div className="max-w-6xl mx-auto px-4 sm:px-6 py-10"
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {features.map(f => (
                <motion.div key={f.id} variants={fadeUp} className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${accent}20` }}>
                    <FIcon name={f.icon} className="w-5 h-5" style={{ color: accent }} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{f.title}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* MENU */}
      {products?.length > 0 && (
        <section id="menu" className="py-20 sm:py-24 bg-stone-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>{data.products_subtitle || "Our Specialties"}</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{data.products_title || "Menu Highlights"}</h2>
            </motion.div>
            <motion.div className="space-y-3"
              initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={stagger}>
              {products.map(p => (
                <motion.div key={p.id} variants={fadeUp} whileHover={{ x: 4 }}
                  className="flex items-start justify-between gap-4 p-5 rounded-2xl border border-stone-800 bg-stone-900 hover:border-amber-600/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 mt-0.5">
                      {p.image_url && !imgErrors[p.id] ? (
                        <Image src={p.image_url} alt={p.name} fill
                          onError={() => setImgErrors(e => ({ ...e, [p.id]: true }))}
                          className="object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}20` }}>
                          <Utensils className="w-5 h-5" style={{ color: accent }} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{p.name}</h3>
                        {p.badge && (
                          <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: accent }}>{p.badge}</span>
                        )}
                      </div>
                      {p.description && <p className="text-stone-400 text-sm mt-1">{p.description}</p>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {p.price != null && (
                      <span className="font-extrabold text-xl" style={{ color: accent }}>
                        ₹{Number(p.price).toLocaleString("en-IN")}
                      </span>
                    )}
                    {waUrl && (
                      <a href={`${waUrl}?text=I'd like to order ${encodeURIComponent(p.name)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="block text-xs text-stone-500 hover:text-amber-400 mt-1 transition-colors">Order →</a>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section id="about" className="py-20 sm:py-24 bg-stone-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div className="hidden md:flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden border border-stone-800"
                style={{ background: `linear-gradient(135deg, ${accent}15, transparent)` }}>
                <Utensils className="absolute inset-0 m-auto w-32 h-32 opacity-10" style={{ color: accent }} />
                <div className="absolute bottom-6 left-6 bg-stone-950 rounded-2xl p-4 border border-stone-700">
                  <p className="font-extrabold text-3xl" style={{ color: accent }}>{new Date().getFullYear() - 2015}+</p>
                  <p className="text-xs text-stone-400 font-medium">Years of Excellence</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>Our Story</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">{about.title}</h2>
              <p className="text-stone-300 leading-relaxed text-lg mb-8">{about.content}</p>
              {about.highlights?.length > 0 && (
                <ul className="space-y-3">
                  {about.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-3 text-stone-300">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials?.length > 0 && (
        <section id="reviews" className="py-20 sm:py-24 bg-stone-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>Guest Reviews</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">What Diners Say</h2>
            </motion.div>
            <motion.div className="grid md:grid-cols-3 gap-6"
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {testimonials.map(t => (
                <motion.div key={t.id} variants={fadeUp}
                  className="bg-stone-900 rounded-2xl p-6 border border-stone-800 flex flex-col gap-4">
                  <Stars count={t.rating} />
                  <p className="text-stone-300 leading-relaxed flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-stone-800">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: accent }}>
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{t.name}</p>
                      {t.role && <p className="text-xs text-stone-500">{t.role}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contact" className="py-20 sm:py-24"
        style={{ background: `linear-gradient(135deg, ${accent}20 0%, transparent 100%)`, backgroundColor: "#1c1917" }}>
        <motion.div className="max-w-4xl mx-auto px-4 sm:px-6 text-center"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>Find Us</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-12">Visit Our Restaurant</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {contact.phone && (
              <a href={`tel:${contact.phone}`}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-stone-700 hover:border-amber-600/50 bg-stone-900 hover:bg-stone-800 transition-colors">
                <Phone className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center">
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Reservations</p>
                  <p className="text-sm font-semibold">{contact.phone}</p>
                </div>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-stone-700 hover:border-amber-600/50 bg-stone-900 hover:bg-stone-800 transition-colors">
                <Mail className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center">
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-semibold break-all">{contact.email}</p>
                </div>
              </a>
            )}
            {contact.address && (
              <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-stone-700 bg-stone-900">
                <MapPin className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center">
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Location</p>
                  <p className="text-sm font-semibold">{contact.address}</p>
                </div>
              </div>
            )}
            {contact.timings && (
              <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-stone-700 bg-stone-900">
                <Clock className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center">
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Hours</p>
                  <p className="text-sm font-semibold">{contact.timings}</p>
                </div>
              </div>
            )}
          </div>
          {waUrl && (
            <motion.a whileHover={{ scale: 1.05 }} href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-bold px-8 py-4 rounded-full text-white text-base shadow-xl"
              style={{ backgroundColor: "#25D366" }}>
              <MessageCircle className="w-5 h-5" /> Reserve via WhatsApp
            </motion.a>
          )}
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-950 border-t border-stone-900 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accent}, #92400e)` }}>
              <Utensils className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="font-bold text-white">{businessName}</span>
          </div>
          <p className="text-sm text-stone-500">© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <div className="flex gap-4">
            {social?.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>}
            {social?.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>}
            {social?.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>}
            {social?.youtube && <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>}
          </div>
        </div>
      </footer>
    </div>
  );
}
