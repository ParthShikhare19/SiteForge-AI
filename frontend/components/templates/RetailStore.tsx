"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Menu, X, ShoppingBag, Star, Shield, Truck, RotateCcw, Tag,
  Phone, Mail, MapPin, Clock, MessageCircle, Instagram, Facebook,
  Twitter, ChevronRight, CheckCircle2, Youtube,
} from "lucide-react";
import type { WebsiteJSON } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  shield: Shield, truck: Truck, refresh: RotateCcw, tag: Tag,
  star: Star, phone: Phone, check: CheckCircle2,
};
function FeatureIcon({ name, ...p }: { name: string; className?: string; style?: React.CSSProperties }) {
  const C = ICON_MAP[name] || Shield;
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

export default function RetailStore({ data, businessName }: { data: WebsiteJSON; businessName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const { hero, about, features, products, testimonials, contact, social } = data;
  const primary = data.theme_color || "#312e81";
  const accent = data.accent_color || "#7c3aed";
  const wa = (contact.whatsapp || contact.phone || "").replace(/\D/g, "");
  const waUrl = wa ? `https://wa.me/${wa}` : null;
  const navLinks = ["About", "Products", "Reviews", "Contact"];

  return (
    <div className="min-h-screen font-sans text-gray-900 antialiased">
      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
              <ShoppingBag className="w-4 h-4" />
            </span>
            <span className="font-bold text-gray-900 text-lg truncate max-w-[180px]">{businessName}</span>
          </a>
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">{l}</a>
            ))}
          </nav>
          <div className="hidden md:flex gap-3">
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-full transition-transform hover:scale-105"
                style={{ backgroundColor: "#25D366" }}>
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-3 flex flex-col gap-1">
            {navLinks.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className="py-2.5 px-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-full"
                style={{ backgroundColor: "#25D366" }}>
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
            )}
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {hero.hero_image ? (
          <>
            <Image src={hero.hero_image} alt={businessName} fill className="object-cover" priority />
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primary}ED 0%, ${accent}CC 100%)` }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 bg-white blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10 bg-white blur-3xl" />
          </div>
        )}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 relative z-10">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            {hero.badge && (
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-white text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> {hero.badge}
              </motion.div>
            )}
            <motion.h1 variants={fadeUp} transition={{ duration: 0.7 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] max-w-3xl">
              {hero.headline}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
              {hero.subheadline}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <a href="#products"
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
        </div>
      </section>

      {/* FEATURES */}
      {features?.length > 0 && (
        <section className="bg-white border-b border-gray-100">
          <motion.div className="max-w-6xl mx-auto px-4 sm:px-6 py-8"
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map(f => (
                <motion.div key={f.id} variants={fadeUp} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primary}15` }}>
                    <FeatureIcon name={f.icon} className="w-5 h-5" style={{ color: primary }} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{f.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ABOUT */}
      <section id="about" className="py-20 sm:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primary }}>Who We Are</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">{about.title}</h2>
              <p className="text-gray-500 leading-relaxed text-lg mb-8">{about.content}</p>
              {about.highlights?.length > 0 && (
                <ul className="space-y-3">
                  {about.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: primary }}>
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="hidden md:flex items-center justify-center">
              <div className="relative w-full max-w-sm aspect-square rounded-3xl flex items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${primary}18, ${accent}25)` }}>
                <ShoppingBag className="w-36 h-36 opacity-15" style={{ color: primary }} />
                <div className="absolute bottom-6 right-6 bg-white rounded-2xl shadow-xl p-4">
                  <p className="text-2xl font-extrabold" style={{ color: primary }}>{products?.length || "10"}+</p>
                  <p className="text-xs text-gray-500 font-medium">Products</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      {products?.length > 0 && (
        <section id="products" className="py-20 sm:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primary }}>{data.products_subtitle || "Our Collection"}</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{data.products_title || "Featured Products"}</h2>
            </motion.div>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={stagger}>
              {products.map(p => (
                <motion.div key={p.id} variants={fadeUp}
                  whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
                  className="relative group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer">
                  <div className="relative h-48 overflow-hidden">
                    {p.image_url && !imgErrors[p.id] ? (
                      <Image src={p.image_url} alt={p.name} fill
                        onError={() => setImgErrors(e => ({ ...e, [p.id]: true }))}
                        className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary}0D, ${accent}18)` }}>
                        <ShoppingBag className="w-16 h-16 opacity-20" style={{ color: primary }} />
                      </div>
                    )}
                    {p.badge && (
                      <span className="absolute top-3 right-3 text-xs font-bold text-white px-2.5 py-1 rounded-full z-10" style={{ backgroundColor: accent }}>{p.badge}</span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{p.name}</h3>
                    {p.description && <p className="text-gray-400 text-sm mb-4 line-clamp-2">{p.description}</p>}
                    <div className="flex items-center justify-between">
                      {p.price != null
                        ? <span className="font-extrabold text-xl" style={{ color: primary }}>₹{Number(p.price).toLocaleString("en-IN")}</span>
                        : <span className="text-gray-400 text-sm">Price on request</span>}
                      {waUrl && (
                        <a href={`${waUrl}?text=Hi! I'm interested in ${encodeURIComponent(p.name)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-xs font-bold text-white px-3.5 py-2 rounded-full hover:scale-105 transition-transform"
                          style={{ backgroundColor: "#25D366" }}>
                          Enquire
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

      {/* TESTIMONIALS */}
      {testimonials?.length > 0 && (
        <section id="reviews" className="py-20 sm:py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primary }}>Happy Customers</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">What People Say</h2>
            </motion.div>
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {testimonials.map(t => (
                <motion.div key={t.id} variants={fadeUp}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
                  <Stars count={t.rating} />
                  <p className="text-gray-600 leading-relaxed flex-1">"{t.text}"</p>
                  <div className="pt-2 border-t border-gray-50">
                    <p className="font-bold text-gray-900">{t.name}</p>
                    {t.role && <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contact" className="py-20 sm:py-24 text-white"
        style={{ background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)` }}>
        <motion.div className="max-w-4xl mx-auto px-4 sm:px-6 text-center"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Get In Touch</h2>
          <p className="text-white/70 text-lg mb-12">We'd love to hear from you. Visit us or reach out anytime.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded-2xl p-5 transition-colors">
                <Phone className="w-6 h-6 text-white/70" />
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Phone</p>
                <p className="font-semibold text-sm text-center">{contact.phone}</p>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded-2xl p-5 transition-colors">
                <Mail className="w-6 h-6 text-white/70" />
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Email</p>
                <p className="font-semibold text-sm text-center break-all">{contact.email}</p>
              </a>
            )}
            {contact.address && (
              <div className="flex flex-col items-center gap-2 bg-white/10 rounded-2xl p-5">
                <MapPin className="w-6 h-6 text-white/70" />
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Address</p>
                <p className="font-semibold text-sm text-center">{contact.address}</p>
              </div>
            )}
            {contact.timings && (
              <div className="flex flex-col items-center gap-2 bg-white/10 rounded-2xl p-5">
                <Clock className="w-6 h-6 text-white/70" />
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Hours</p>
                <p className="font-semibold text-sm text-center">{contact.timings}</p>
              </div>
            )}
          </div>
          {waUrl && (
            <motion.a whileHover={{ scale: 1.05 }} href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-bold px-8 py-4 rounded-full text-base shadow-xl"
              style={{ backgroundColor: "#25D366", color: "white" }}>
              <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
            </motion.a>
          )}
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
              <ShoppingBag className="w-3.5 h-3.5" />
            </span>
            <span className="font-bold text-white">{businessName}</span>
          </div>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <div className="flex gap-4">
            {social?.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>}
            {social?.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>}
            {social?.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>}
            {social?.youtube && <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>}
          </div>
        </div>
      </footer>
    </div>
  );
}
