"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Menu, X, Star, Phone, Mail, MapPin, Clock, MessageCircle,
  Instagram, Facebook, Twitter, Youtube, ChevronRight,
  Heart, Cake, Coffee, Gift, Sparkles, Truck,
} from "lucide-react";
import type { WebsiteJSON } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  heart: Heart, cake: Cake, coffee: Coffee, gift: Gift, star: Star,
  truck: Truck, sparkles: Sparkles, shield: Heart,
};
function FIcon({ name, ...p }: { name: string; className?: string; style?: React.CSSProperties }) {
  const C = ICON_MAP[name] || Cake;
  return <C {...p} />;
}
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < count ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function Bakery({ data, businessName }: { data: WebsiteJSON; businessName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const { hero, about, features, products, testimonials, contact, social } = data;
  const primary = data.theme_color || "#be185d";
  const accent = data.accent_color || "#f59e0b";
  const wa = (contact.whatsapp || contact.phone || "").replace(/\D/g, "");
  const waUrl = wa ? `https://wa.me/${wa}` : null;

  return (
    <div className="min-h-screen bg-rose-50 font-sans text-gray-900 antialiased">
      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-rose-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <span className="text-2xl">🧁</span>
            <span className="font-extrabold text-lg truncate max-w-[180px]" style={{ color: primary }}>{businessName}</span>
          </a>
          <nav className="hidden md:flex items-center gap-7">
            {["Treats", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">{l}</a>
            ))}
          </nav>
          <div className="hidden md:flex gap-3">
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-bold text-white px-4 py-2 rounded-full hover:scale-105 transition-transform"
                style={{ backgroundColor: "#25D366" }}>
                <MessageCircle className="w-4 h-4" /> Order Now
              </a>
            )}
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-rose-50" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-rose-100 px-4 py-3 space-y-1">
            {["Treats", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className="block py-2.5 px-2 text-sm font-medium text-gray-700 hover:bg-rose-50 rounded-lg"
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
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primary}E0 0%, ${accent}CC 100%)` }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)` }}>
            <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </div>
        )}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="show" variants={stagger}>
              {hero.badge && (
                <motion.div variants={fadeUp}
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-white text-sm font-medium mb-6">
                  <Heart className="w-3.5 h-3.5 fill-white" /> {hero.badge}
                </motion.div>
              )}
              <motion.h1 variants={fadeUp} transition={{ duration: 0.7 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                {hero.headline}
              </motion.h1>
              <motion.p variants={fadeUp} className="text-xl text-white/80 mb-10 leading-relaxed">
                {hero.subheadline}
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <a href="#treats"
                  className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-full text-sm transition-all hover:scale-105 shadow-lg"
                  style={{ backgroundColor: "white", color: primary }}>
                  {hero.cta_text} <ChevronRight className="w-4 h-4" />
                </a>
                {hero.cta_secondary && (
                  <a href="#about"
                    className="inline-flex items-center gap-2 border border-white/40 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-all">
                    {hero.cta_secondary}
                  </a>
                )}
              </motion.div>
            </motion.div>
            {/* Floating stat cards */}
            <motion.div className="hidden md:flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <div className="relative">
                <div className="text-9xl select-none">🎂</div>
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-3 text-center">
                  <p className="text-2xl font-extrabold" style={{ color: primary }}>100+</p>
                  <p className="text-[11px] text-gray-500 font-medium">Daily Bakes</p>
                </motion.div>
                <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-3 text-center">
                  <p className="text-2xl font-extrabold" style={{ color: accent }}>❤️</p>
                  <p className="text-[11px] text-gray-500 font-medium">Made with Love</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      {features?.length > 0 && (
        <section className="bg-white border-y border-rose-100">
          <motion.div className="max-w-6xl mx-auto px-4 sm:px-6 py-8"
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map(f => (
                <motion.div key={f.id} variants={fadeUp} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${primary}15` }}>
                    <FIcon name={f.icon} className="w-5 h-5" style={{ color: primary }} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{f.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* TREATS / PRODUCTS */}
      {products?.length > 0 && (
        <section id="treats" className="py-20 sm:py-24 bg-rose-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primary }}>{data.products_subtitle || "Our Treats"}</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{data.products_title || "Freshly Baked Daily"}</h2>
            </motion.div>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={stagger}>
              {products.map(p => (
                <motion.div key={p.id} variants={fadeUp}
                  whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.10)" }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-rose-100">
                  <div className="relative h-44 overflow-hidden">
                    {p.image_url && !imgErrors[p.id] ? (
                      <Image src={p.image_url} alt={p.name} fill
                        onError={() => setImgErrors(e => ({ ...e, [p.id]: true }))}
                        className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-44 flex items-center justify-center text-6xl"
                        style={{ background: `linear-gradient(135deg, ${primary}10, ${accent}15)` }}>
                        🍰
                      </div>
                    )}
                    {p.badge && (
                      <span className="absolute top-3 right-3 text-xs font-bold text-white px-2.5 py-1 rounded-full z-10"
                        style={{ backgroundColor: primary }}>{p.badge}</span>
                    )}
                  </div>
                  <div className="p-5 relative">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{p.name}</h3>
                    {p.description && <p className="text-gray-400 text-sm mb-4 line-clamp-2">{p.description}</p>}
                    <div className="flex items-center justify-between">
                      {p.price != null
                        ? <span className="font-extrabold text-xl" style={{ color: primary }}>₹{Number(p.price).toLocaleString("en-IN")}</span>
                        : <span className="text-gray-300 text-sm">Ask for price</span>}
                      {waUrl && (
                        <a href={`${waUrl}?text=I'd like to order ${encodeURIComponent(p.name)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-xs font-bold text-white px-3.5 py-2 rounded-full hover:scale-105 transition-transform"
                          style={{ backgroundColor: "#25D366" }}>
                          Order 🛒
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CUSTOM ORDER CTA */}
      <section className="py-14 text-white"
        style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
        <motion.div className="max-w-4xl mx-auto px-4 sm:px-6 text-center"
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <p className="text-3xl mb-3">🎂</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">Want a Custom Order?</h3>
          <p className="text-white/75 mb-6">Wedding cakes, birthday specials, corporate gifts — we create it all with love.</p>
          {waUrl && (
            <a href={`${waUrl}?text=Hi! I'd like to place a custom cake order`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-full bg-white hover:bg-white/90 transition-colors text-sm"
              style={{ color: primary }}>
              <MessageCircle className="w-4 h-4" style={{ color: "#25D366" }} /> Chat on WhatsApp
            </a>
          )}
        </motion.div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-20 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primary }}>Our Story</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">{about.title}</h2>
              <p className="text-gray-500 leading-relaxed text-lg mb-8">{about.content}</p>
              {about.highlights?.length > 0 && (
                <ul className="space-y-3">
                  {about.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <Heart className="w-4 h-4 flex-shrink-0" style={{ color: primary }} />
                      <span className="font-medium">{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
            <motion.div className="hidden md:flex justify-center"
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="relative w-80 h-80 rounded-3xl flex items-center justify-center text-8xl"
                style={{ background: `linear-gradient(135deg, ${primary}15, ${accent}20)` }}>
                🎂
                <div className="absolute bottom-5 right-5 bg-white rounded-2xl shadow-lg p-4 text-center">
                  <p className="text-xl font-extrabold" style={{ color: primary }}>Since 2010</p>
                  <p className="text-xs text-gray-400">Baking happiness</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials?.length > 0 && (
        <section id="reviews" className="py-20 sm:py-24 bg-rose-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primary }}>Happy Customers</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Love from Our Customers</h2>
            </motion.div>
            <motion.div className="grid md:grid-cols-3 gap-6"
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {testimonials.map(t => (
                <motion.div key={t.id} variants={fadeUp}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100 flex flex-col gap-4">
                  <Stars count={t.rating} />
                  <p className="text-gray-600 leading-relaxed flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-rose-50">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
                      style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
                      {t.name.charAt(0).toUpperCase()}
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
      <section id="contact" className="py-20 sm:py-24 bg-white">
        <motion.div className="max-w-4xl mx-auto px-4 sm:px-6 text-center"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primary }}>Visit Us</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-12">Find Our Bakery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {contact.phone && (
              <a href={`tel:${contact.phone}`}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 hover:border-rose-200 transition-colors"
                style={{ borderColor: `${primary}20` }}>
                <Phone className="w-5 h-5" style={{ color: primary }} />
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Call Us</p>
                  <p className="text-sm font-bold text-gray-900">{contact.phone}</p>
                </div>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 hover:border-rose-200 transition-colors"
                style={{ borderColor: `${primary}20` }}>
                <Mail className="w-5 h-5" style={{ color: primary }} />
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-bold text-gray-900 break-all">{contact.email}</p>
                </div>
              </a>
            )}
            {contact.address && (
              <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2"
                style={{ borderColor: `${primary}20` }}>
                <MapPin className="w-5 h-5" style={{ color: primary }} />
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Address</p>
                  <p className="text-sm font-bold text-gray-900">{contact.address}</p>
                </div>
              </div>
            )}
            {contact.timings && (
              <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2"
                style={{ borderColor: `${primary}20` }}>
                <Clock className="w-5 h-5" style={{ color: primary }} />
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Hours</p>
                  <p className="text-sm font-bold text-gray-900">{contact.timings}</p>
                </div>
              </div>
            )}
          </div>
          {waUrl && (
            <motion.a whileHover={{ scale: 1.05 }} href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-bold px-8 py-4 rounded-full text-white text-base shadow-lg"
              style={{ backgroundColor: "#25D366" }}>
              <MessageCircle className="w-5 h-5" /> Order on WhatsApp
            </motion.a>
          )}
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 sm:px-6 text-white"
        style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧁</span>
            <span className="font-extrabold text-white">{businessName}</span>
          </div>
          <p className="text-sm text-white/60">© {new Date().getFullYear()} {businessName}. Made with ❤️</p>
          <div className="flex gap-4">
            {social?.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>}
            {social?.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>}
            {social?.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>}
            {social?.youtube && <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>}
          </div>
        </div>
      </footer>
    </div>
  );
}
