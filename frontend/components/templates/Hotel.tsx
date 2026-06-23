"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Menu, X, Star, Clock, MapPin, Phone, Mail,
  MessageCircle, Instagram, Facebook, Twitter, Youtube,
  ChevronRight, Shield, Heart, Wifi, Coffee, Car,
} from "lucide-react";
import type { WebsiteJSON } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  star: Star, shield: Shield, heart: Heart, check: Shield, clock: Clock,
  wifi: Wifi, coffee: Coffee, car: Car, users: Shield,
};
function FIcon({ name, ...p }: { name: string; className?: string; style?: React.CSSProperties }) {
  const C = ICON_MAP[name] || Star;
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

export default function Hotel({ data, businessName }: { data: WebsiteJSON; businessName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const { hero, about, features, products, testimonials, contact, social } = data;
  const primary = data.theme_color || "#1e3a5f";
  const accent = data.accent_color || "#c9a227";
  const wa = (contact.whatsapp || contact.phone || "").replace(/\D/g, "");
  const waUrl = wa ? `https://wa.me/${wa}` : null;

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-white antialiased">
      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <div className="w-8 h-0.5" style={{ backgroundColor: accent }} />
            <span className="font-light text-xl tracking-[0.15em] text-white uppercase">{businessName}</span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {["Rooms", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">{l}</a>
            ))}
          </nav>
          <a href={waUrl || "#contact"} target={waUrl ? "_blank" : undefined} rel="noopener noreferrer"
            className="hidden md:inline-flex text-xs font-bold uppercase tracking-widest px-6 py-2.5 border transition-colors hover:text-gray-900"
            style={{ borderColor: accent, color: accent, backgroundColor: "transparent" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = accent; (e.currentTarget as HTMLElement).style.color = "#111"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = accent; }}>
            Book Now
          </a>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-gray-950 border-t border-gray-800 px-4 py-3 space-y-1">
            {["Rooms", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="block py-2.5 px-3 text-sm text-gray-400 hover:text-white"
                onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
          </div>
        )}
      </header>

      {/* HERO — full bleed */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {hero.hero_image ? (
          <>
            <Image src={hero.hero_image} alt={businessName} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gray-950/65" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: primary }} />
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${primary}cc 0%, transparent 60%)` }} />
        <motion.div className="relative z-10 text-center px-4 max-w-4xl"
          initial="hidden" animate="show" variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16" style={{ backgroundColor: accent }} />
            {hero.badge && <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>{hero.badge}</span>}
            <div className="h-px w-16" style={{ backgroundColor: accent }} />
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl font-thin text-white mb-6 leading-tight tracking-wide">
            {hero.headline}
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto font-light">{hero.subheadline}</motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
            <a href={waUrl || "#contact"} target={waUrl ? "_blank" : undefined} rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold px-8 py-4 text-sm uppercase tracking-wider transition-all hover:opacity-90"
              style={{ backgroundColor: accent, color: "#111" }}>
              Book Your Stay <ChevronRight className="w-4 h-4" />
            </a>
            <a href="#rooms" className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold px-8 py-4 text-sm uppercase tracking-wider hover:bg-white/10 transition-colors">
              {hero.cta_secondary || "View Rooms"}
            </a>
          </motion.div>
        </motion.div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* FEATURES bar */}
      {features?.length > 0 && (
        <section className="border-y border-gray-800" style={{ backgroundColor: primary }}>
          <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {features.map(f => (
                <motion.div key={f.id} variants={fadeUp} className="flex flex-col items-center text-center gap-3">
                  <FIcon name={f.icon} className="w-6 h-6" style={{ color: accent }} />
                  <div>
                    <p className="font-semibold text-white text-sm tracking-wide">{f.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ROOMS */}
      {products?.length > 0 && (
        <section id="rooms" className="py-24 bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-10" style={{ backgroundColor: accent }} />
                <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>{data.products_subtitle || "Accommodation"}</span>
                <div className="h-px w-10" style={{ backgroundColor: accent }} />
              </div>
              <h2 className="text-3xl sm:text-5xl font-thin text-white tracking-wide">{data.products_title || "Our Rooms"}</h2>
            </motion.div>
            <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {products.map(p => (
                <motion.div key={p.id} variants={fadeUp}
                  className="group border border-gray-800 hover:border-amber-600/40 transition-all overflow-hidden">
                  <div className="relative h-56 overflow-hidden bg-gray-900">
                    {p.image_url && !imgErrors[p.id] ? (
                      <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={() => setImgErrors(e => ({ ...e, [p.id]: true }))} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${primary}80` }}>
                        <Star className="w-10 h-10 opacity-20" style={{ color: accent }} />
                      </div>
                    )}
                    {p.badge && (
                      <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 text-gray-900"
                        style={{ backgroundColor: accent }}>{p.badge}</span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white text-lg">{p.name}</h3>
                      {p.price != null && (
                        <div className="text-right">
                          <span className="font-bold text-xl" style={{ color: accent }}>₹{Number(p.price).toLocaleString("en-IN")}</span>
                          <span className="text-xs text-gray-500 block">per night</span>
                        </div>
                      )}
                    </div>
                    {p.description && <p className="text-gray-400 text-sm leading-relaxed">{p.description}</p>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section id="about" className="py-24" style={{ backgroundColor: primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-10" style={{ backgroundColor: accent }} />
                <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>Our Story</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-thin text-white mb-6 leading-relaxed">{about.title}</h2>
              <p className="text-gray-300 leading-relaxed mb-8 font-light">{about.content}</p>
              {about.highlights?.length > 0 && (
                <ul className="space-y-3">
                  {about.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300 font-light">
                      <div className="w-4 h-px flex-shrink-0" style={{ backgroundColor: accent }} />
                      <span className="text-sm">{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="grid grid-cols-2 gap-4">
              {[["50+", "Rooms & Suites"], ["15+", "Years of Hospitality"], ["4.9", "Guest Rating"], ["24/7", "Concierge Service"]].map(([num, label]) => (
                <div key={label} className="border border-gray-700 p-8 text-center">
                  <p className="text-4xl font-thin mb-2" style={{ color: accent }}>{num}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials?.length > 0 && (
        <section id="reviews" className="py-24 bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-10" style={{ backgroundColor: accent }} />
                <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>Guest Reviews</span>
                <div className="h-px w-10" style={{ backgroundColor: accent }} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-thin text-white">Experiences Shared</h2>
            </motion.div>
            <motion.div className="grid md:grid-cols-3 gap-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {testimonials.map(t => (
                <motion.div key={t.id} variants={fadeUp} className="border border-gray-800 p-8 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <Stars count={t.rating} />
                    <span className="text-4xl text-gray-700 font-serif">"</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-sm font-light flex-1">{t.text}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                    <div className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-gray-900" style={{ backgroundColor: accent }}>
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
      <section id="contact" className="py-24 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-10" style={{ backgroundColor: accent }} />
            <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>Contact</span>
            <div className="h-px w-10" style={{ backgroundColor: accent }} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-thin text-white mb-12">Plan Your Visit</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex flex-col items-center gap-3 p-5 border border-gray-800 hover:border-amber-600/50 transition-colors">
                <Phone className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Reservations</p><p className="text-sm">{contact.phone}</p></div>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex flex-col items-center gap-3 p-5 border border-gray-800 hover:border-amber-600/50 transition-colors">
                <Mail className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Email</p><p className="text-sm break-all">{contact.email}</p></div>
              </a>
            )}
            {contact.address && (
              <div className="flex flex-col items-center gap-3 p-5 border border-gray-800">
                <MapPin className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Address</p><p className="text-sm">{contact.address}</p></div>
              </div>
            )}
            {contact.timings && (
              <div className="flex flex-col items-center gap-3 p-5 border border-gray-800">
                <Clock className="w-5 h-5" style={{ color: accent }} />
                <div className="text-center"><p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Check-in</p><p className="text-sm">{contact.timings}</p></div>
              </div>
            )}
          </div>
          {waUrl && (
            <motion.a whileHover={{ scale: 1.04 }} href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-bold px-8 py-4 text-gray-900 text-sm uppercase tracking-wider shadow-xl"
              style={{ backgroundColor: accent }}>
              <MessageCircle className="w-5 h-5" /> Book via WhatsApp
            </motion.a>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-900 py-8 px-4 sm:px-6 bg-gray-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-light text-base tracking-[0.15em] text-white uppercase">{businessName}</span>
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
