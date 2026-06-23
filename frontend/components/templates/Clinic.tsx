"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Menu, X, Star, Clock, MapPin, Phone, Mail,
  MessageCircle, Instagram, Facebook, Twitter, Youtube,
  ChevronRight, Shield, Heart, CheckCircle, Activity,
  Users, Award, Stethoscope,
} from "lucide-react";
import type { WebsiteJSON } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  shield: Shield, heart: Heart, check: CheckCircle, star: Star, clock: Clock,
  users: Users, award: Award, activity: Activity, stethoscope: Stethoscope,
};
function FIcon({ name, ...p }: { name: string; className?: string; style?: React.CSSProperties }) {
  const C = ICON_MAP[name] || Shield;
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

export default function Clinic({ data, businessName }: { data: WebsiteJSON; businessName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const { hero, about, features, products, testimonials, contact, social } = data;
  const primary = data.theme_color || "#0f4c81";
  const accent = data.accent_color || "#059669";
  const wa = (contact.whatsapp || contact.phone || "").replace(/\D/g, "");
  const waUrl = wa ? `https://wa.me/${wa}` : null;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: primary }}>
              <Stethoscope className="w-5 h-5 text-white" />
            </span>
            <span className="font-bold text-gray-900 text-lg truncate max-w-[200px]">{businessName}</span>
          </a>
          <nav className="hidden md:flex items-center gap-7">
            {["Services", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{l}</a>
            ))}
          </nav>
          <a href={waUrl || "#contact"} target={waUrl ? "_blank" : undefined} rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full text-white shadow-md transition-transform hover:scale-105"
            style={{ backgroundColor: accent }}>
            Book Appointment
          </a>
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
            {["Services", "About", "Reviews", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="block py-2.5 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative pt-16 overflow-hidden" style={{ backgroundColor: primary }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="show" variants={stagger}>
              {hero.badge && (
                <motion.div variants={fadeUp}
                  className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-white text-sm font-medium mb-6">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> {hero.badge}
                </motion.div>
              )}
              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
                {hero.headline}
              </motion.h1>
              <motion.p variants={fadeUp} className="text-blue-100 text-lg mb-8 leading-relaxed">{hero.subheadline}</motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <a href={waUrl || "#contact"} target={waUrl ? "_blank" : undefined} rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-full bg-white text-sm shadow-lg transition-transform hover:scale-105"
                  style={{ color: primary }}>
                  Book Appointment <ChevronRight className="w-4 h-4" />
                </a>
                <a href="#services"
                  className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-7 py-3.5 rounded-full text-sm hover:bg-white/10 transition-colors">
                  {hero.cta_secondary || "Our Services"}
                </a>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}
              className="hidden md:block relative">
              {hero.hero_image ? (
                <div className="relative h-80 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
                  <Image src={hero.hero_image} alt={businessName} fill className="object-cover" priority />
                </div>
              ) : (
                <div className="h-80 rounded-3xl bg-white/10 border-4 border-white/20 flex items-center justify-center">
                  <Stethoscope className="w-24 h-24 text-white/30" />
                </div>
              )}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                <p className="font-extrabold text-2xl" style={{ color: accent }}>10+</p>
                <p className="text-xs text-gray-500 font-medium">Years of Care</p>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                <p className="font-extrabold text-2xl" style={{ color: primary }}>5000+</p>
                <p className="text-xs text-gray-500 font-medium">Happy Patients</p>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="h-12 bg-white" style={{ borderRadius: "60% 60% 0 0 / 100% 100% 0 0", marginTop: "-1px" }} />
      </section>

      {/* FEATURES */}
      {features?.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6"
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {features.map(f => (
                <motion.div key={f.id} variants={fadeUp}
                  className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all bg-gray-50">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${primary}15` }}>
                    <FIcon name={f.icon} className="w-6 h-6" style={{ color: primary }} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* SERVICES */}
      {products?.length > 0 && (
        <section id="services" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>{data.products_subtitle || "What We Offer"}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">{data.products_title || "Our Services"}</h2>
            </motion.div>
            <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {products.map(p => (
                <motion.div key={p.id} variants={fadeUp}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all">
                  {p.image_url && !imgErrors[p.id] && (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4">
                      <Image src={p.image_url} alt={p.name} fill className="object-cover"
                        onError={() => setImgErrors(e => ({ ...e, [p.id]: true }))} />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-gray-900">{p.name}</h3>
                    {p.price != null && (
                      <span className="font-bold text-sm whitespace-nowrap" style={{ color: accent }}>₹{Number(p.price).toLocaleString("en-IN")}</span>
                    )}
                  </div>
                  {p.description && <p className="text-gray-500 text-sm leading-relaxed">{p.description}</p>}
                  {p.badge && <span className="mt-3 inline-block text-xs font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: accent }}>{p.badge}</span>}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-14 items-center">
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
                  className="inline-flex items-center gap-2 mt-8 font-bold px-6 py-3 rounded-full text-white text-sm shadow-lg transition-transform hover:scale-105"
                  style={{ backgroundColor: primary }}>
                  <MessageCircle className="w-4 h-4" /> Contact Us
                </a>
              )}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="grid grid-cols-2 gap-4">
              {[
                { label: "Experienced Doctors", icon: Users, color: primary },
                { label: "Advanced Equipment", icon: Activity, color: accent },
                { label: "Patient Satisfaction", icon: Heart, color: primary },
                { label: "Certified & Safe", icon: Award, color: accent },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials?.length > 0 && (
        <section id="reviews" className="py-20" style={{ backgroundColor: `${primary}08` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Patient Reviews</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">What Our Patients Say</h2>
            </motion.div>
            <motion.div className="grid md:grid-cols-3 gap-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              {testimonials.map(t => (
                <motion.div key={t.id} variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <Stars count={t.rating} />
                  <p className="text-gray-600 leading-relaxed my-4 text-sm">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: primary }}>
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
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Find Us</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-10">Visit Our Clinic</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all bg-gray-50">
                <Phone className="w-5 h-5" style={{ color: primary }} />
                <div className="text-center"><p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Call Us</p><p className="text-sm font-semibold">{contact.phone}</p></div>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all bg-gray-50">
                <Mail className="w-5 h-5" style={{ color: primary }} />
                <div className="text-center"><p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Email</p><p className="text-sm font-semibold break-all">{contact.email}</p></div>
              </a>
            )}
            {contact.address && (
              <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-200 bg-gray-50">
                <MapPin className="w-5 h-5" style={{ color: primary }} />
                <div className="text-center"><p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Location</p><p className="text-sm font-semibold">{contact.address}</p></div>
              </div>
            )}
            {contact.timings && (
              <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-200 bg-gray-50">
                <Clock className="w-5 h-5" style={{ color: primary }} />
                <div className="text-center"><p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Hours</p><p className="text-sm font-semibold">{contact.timings}</p></div>
              </div>
            )}
          </div>
          {waUrl && (
            <motion.a whileHover={{ scale: 1.05 }} href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-bold px-8 py-4 rounded-full text-white text-base shadow-xl"
              style={{ backgroundColor: "#25D366" }}>
              <MessageCircle className="w-5 h-5" /> Book via WhatsApp
            </motion.a>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: primary }}>
              <Stethoscope className="w-3.5 h-3.5 text-white" />
            </span>
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
