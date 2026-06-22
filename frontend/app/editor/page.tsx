"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Eye, EyeOff, Globe, Loader2, Send, Sparkles, Pencil,
  Check, X, Plus, Trash2, ChevronDown, ChevronUp, Palette,
  Layout, Type, Phone, Package, Share2, Image as ImageIcon,
  ExternalLink, RotateCcw, AlertTriangle, Smartphone, Monitor, Undo2, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { listBusinesses, deleteBusiness } from "@/services/businessService";
import { editWebsite, publishWebsite, unpublishWebsite, updateWebsiteField, updateProduct, getMyWebsite, uploadImage, undoLastEdit } from "@/services/websiteService";
import { isAuthenticated } from "@/lib/auth";
import type { Business, Website, WebsiteJSON, ProductItem } from "@/types";

const AI_SUGGESTIONS = [
  "Make the About section sound more professional",
  "Translate the entire website to Hindi",
  "Add product iPhone 17 Pro for ₹1,29,000",
  "Change the hero headline to be more catchy",
  "Make the theme color deep green (#065f46)",
  "Remove the most expensive product",
];

type Tab = "visual" | "ai";

interface InlineEdit {
  key: string;       // "hero.headline", "contact.phone", etc.
  value: string;
}

interface ProductForm {
  id?: string;
  name: string;
  description: string;
  price: string;
  badge: string;
}

const EMPTY_PRODUCT: ProductForm = { name: "", description: "", price: "", badge: "" };

function SectionCard({
  title, icon: Icon, children, defaultOpen = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-purple-400" />
          </div>
          <span className="font-semibold text-white/90">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-white/5">{children}</div>}
    </div>
  );
}

function FieldRow({
  label, fieldKey, value, multiline = false, type = "text",
  onSave, saving,
}: {
  label: string;
  fieldKey: string;
  value: string;
  multiline?: boolean;
  type?: string;
  onSave: (key: string, val: string) => Promise<void>;
  saving: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const isSaving = saving === fieldKey;

  async function handleSave() {
    await onSave(fieldKey, draft);
    setEditing(false);
  }

  function handleCancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="mt-4">
        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">{label}</label>
        <div className="mt-1.5 flex gap-2 items-start">
          {multiline ? (
            <Textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={3}
              className="flex-1 text-sm resize-none bg-white/5 border-white/10 text-white placeholder:text-white/30"
              autoFocus
            />
          ) : (
            <Input
              type={type}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              className="flex-1 text-sm h-9 bg-white/5 border-white/10 text-white placeholder:text-white/30"
              autoFocus
              onKeyDown={e => e.key === "Enter" && handleSave()}
            />
          )}
          <div className="flex gap-1.5 flex-shrink-0">
            <button onClick={handleSave} disabled={isSaving}
              className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center transition-colors">
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
            <button onClick={handleCancel}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg flex items-center justify-center transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 group flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">{label}</p>
        <p className="mt-1 text-sm text-white/80 font-medium truncate">{value || <span className="text-white/20 italic">Not set</span>}</p>
      </div>
      <button onClick={() => { setDraft(value); setEditing(true); }}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg flex items-center justify-center mt-0.5">
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function EditorContent() {
  const router = useRouter();
  const params = useSearchParams();
  const businessId = Number(params.get("business_id"));

  const [business, setBusiness] = useState<Business | null>(null);
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("visual");

  // Visual editor state
  const [savingField, setSavingField] = useState<string | null>(null);

  // AI tab state
  const [instruction, setInstruction] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuccess, setAiSuccess] = useState("");

  // Products state
  const [productForm, setProductForm] = useState<ProductForm | null>(null);
  const [productSaving, setProductSaving] = useState(false);

  // Publish state
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{ section: string; field: string; productId?: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Undo state
  const [undoing, setUndoing] = useState(false);
  const [undoError, setUndoError] = useState("");

  // Preview panel state
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [mobilePreview, setMobilePreview] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    if (!businessId) { router.push("/dashboard"); return; }
    Promise.all([
      listBusinesses(),
      getMyWebsite(businessId),
    ]).then(([list, site]) => {
      const b = list.find(x => x.id === businessId);
      if (!b) { router.push("/dashboard"); return; }
      setBusiness(b);
      if (site) setWebsite(site);
    }).finally(() => setLoading(false));
  }, [businessId, router]);

  const wj = website?.website_json as WebsiteJSON | undefined;

  const saveField = useCallback(async (dotKey: string, value: string) => {
    const [section, field] = dotKey.split(".");
    setSavingField(dotKey);
    try {
      const updated = await updateWebsiteField(businessId, section, field, value);
      setWebsite(updated);
    } finally {
      setSavingField(null);
    }
  }, [businessId]);

  const saveColor = useCallback(async (field: "theme_color" | "accent_color", value: string) => {
    setSavingField(field);
    try {
      const updated = await updateWebsiteField(businessId, "theme", field, value);
      setWebsite(updated);
    } finally {
      setSavingField(null);
    }
  }, [businessId]);

  async function handleUndo() {
    setUndoing(true);
    setUndoError("");
    try {
      const updated = await undoLastEdit(businessId);
      setWebsite(updated);
    } catch (e) {
      setUndoError(e instanceof Error ? e.message : "Nothing to undo.");
    } finally {
      setUndoing(false);
    }
  }

  async function handleAiEdit() {
    if (!instruction.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiSuccess("");
    try {
      const updated = await editWebsite(businessId, instruction);
      setWebsite(updated);
      setInstruction("");
      setAiSuccess("Website updated successfully!");
      setTimeout(() => setAiSuccess(""), 3000);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Edit failed");
    } finally {
      setAiLoading(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const updated = await publishWebsite(businessId);
      setWebsite(updated);
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    setPublishing(true);
    try {
      const updated = await unpublishWebsite(businessId);
      setWebsite(updated);
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${business?.name}" and all its data? This cannot be undone.`)) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteBusiness(businessId);
      router.push("/dashboard");
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Delete failed. Please try again.");
      setDeleting(false);
    }
  }

  function triggerImageUpload(section: string, field: string, productId?: string) {
    setUploadTarget({ section, field, productId });
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    setUploading(true);
    try {
      const url = await uploadImage(businessId, file);
      if (uploadTarget.productId) {
        const updated = await updateProduct(businessId, uploadTarget.productId, { image_url: url });
        setWebsite(updated);
      } else {
        const updated = await updateWebsiteField(businessId, uploadTarget.section, uploadTarget.field, url);
        setWebsite(updated);
      }
    } finally {
      setUploading(false);
      setUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function saveProduct() {
    if (!productForm || !productForm.name.trim()) return;
    setProductSaving(true);
    try {
      if (productForm.id) {
        const updated = await updateProduct(businessId, productForm.id, {
          name: productForm.name,
          description: productForm.description,
          price: productForm.price ? Number(productForm.price) : null,
          badge: productForm.badge,
        });
        setWebsite(updated);
      } else {
        // Add via AI
        const updated = await editWebsite(businessId,
          `Add product: ${productForm.name}. Description: ${productForm.description || "N/A"}. Price: ₹${productForm.price || "0"}.`
        );
        setWebsite(updated);
      }
      setProductForm(null);
    } finally {
      setProductSaving(false);
    }
  }

  async function removeProduct(productId: string, productName: string) {
    const updated = await editWebsite(businessId, `Remove product: ${productName}`);
    setWebsite(updated);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020817]">
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
    </div>
  );

  const previewUrl = business ? `/sites/${business.slug}` : null;

  return (
    <div className="h-screen flex flex-col bg-[#020817] overflow-hidden">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 z-20 flex-shrink-0">
        <div className="px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex-shrink-0 text-white/60 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="min-w-0">
              <p className="font-semibold text-white truncate text-sm">{business?.name}</p>
              {business && (
                <p className="text-[11px] text-purple-400/70 font-mono">/sites/{business.slug}</p>
              )}
            </div>
            {website?.is_published
              ? <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 flex-shrink-0 text-xs">Live</Badge>
              : <Badge className="bg-white/5 text-white/40 border border-white/10 flex-shrink-0 text-xs">Draft</Badge>}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant={showPreview ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPreview(p => !p)}
              className={showPreview ? "bg-purple-600 hover:bg-purple-700 text-white" : "border-white/10 text-white/70 hover:text-white hover:bg-white/10"}
            >
              {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showPreview ? "Hide" : "Preview"}
            </Button>

            {previewUrl && (
              website?.is_published ? (
                <Link href={previewUrl} target="_blank">
                  <Button variant="ghost" size="icon" className="w-8 h-8 text-white/40 hover:text-white hover:bg-white/10">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Button variant="ghost" size="icon" disabled className="w-8 h-8 opacity-20 cursor-not-allowed">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )
            )}

            {website?.is_published ? (
              <Button size="sm" onClick={handleUnpublish} disabled={publishing}
                className="bg-white/5 border border-white/10 text-white/70 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30">
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4 mr-1" />}
                Unpublish
              </Button>
            ) : (
              <Button size="sm" onClick={handlePublish} disabled={publishing}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20">
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4 mr-1" />}
                Publish
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Tabs bar */}
      <div className="bg-black/20 border-b border-white/5 flex-shrink-0">
        <div className="px-4 flex gap-1 py-2">
          {(["visual", "ai"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}>
              {t === "visual" ? <Layout className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              {t === "visual" ? "Visual Editor" : "AI Assistant"}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <div className={`overflow-y-auto bg-[#020817] ${showPreview ? "w-[420px] flex-shrink-0 border-r border-white/10" : "flex-1"}`}>
          <main className="px-4 py-6 space-y-4 max-w-2xl mx-auto">
        {/* ─── VISUAL EDITOR TAB ─── */}
        {tab === "visual" && wj && (
          <>
            {/* Hero */}
            <SectionCard title="Hero Section" icon={ImageIcon} defaultOpen>
              <FieldRow label="Headline" fieldKey="hero.headline" value={wj.hero.headline} onSave={saveField} saving={savingField} />
              <FieldRow label="Subheadline" fieldKey="hero.subheadline" value={wj.hero.subheadline} multiline onSave={saveField} saving={savingField} />
              <FieldRow label="Badge text" fieldKey="hero.badge" value={wj.hero.badge} onSave={saveField} saving={savingField} />
              <FieldRow label="Primary CTA" fieldKey="hero.cta_text" value={wj.hero.cta_text} onSave={saveField} saving={savingField} />
              <FieldRow label="Secondary CTA" fieldKey="hero.cta_secondary" value={wj.hero.cta_secondary} onSave={saveField} saving={savingField} />
              {/* Hero image upload */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hero Image</p>
                <div className="mt-2 flex items-center gap-3">
                  {wj.hero.hero_image && (
                    // eslint-disable-next-line @next/next-eslint/no-img-element
                    <img src={wj.hero.hero_image} alt="Hero" className="w-20 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                  )}
                  <button
                    onClick={() => triggerImageUpload("hero", "hero_image")}
                    disabled={uploading && uploadTarget?.section === "hero"}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {uploading && uploadTarget?.section === "hero"
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <ImageIcon className="w-3.5 h-3.5" />}
                    {wj.hero.hero_image ? "Change Image" : "Upload Image"}
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* About */}
            <SectionCard title="About Section" icon={Type}>
              <FieldRow label="Section Title" fieldKey="about.title" value={wj.about.title} onSave={saveField} saving={savingField} />
              <FieldRow label="Content" fieldKey="about.content" value={wj.about.content} multiline onSave={saveField} saving={savingField} />
            </SectionCard>

            {/* Products */}
            <SectionCard title={`Products / Menu (${Array.isArray(wj.products) ? wj.products.length : 0})`} icon={Package}>
              <div className="mt-4 space-y-2">
                {(Array.isArray(wj.products) ? wj.products : []).filter(p => p && typeof p === "object").map(p => (
                  <div key={p.id}>
                    {productForm?.id === p.id ? (
                      <ProductFormCard form={productForm} onChange={setProductForm}
                        onSave={saveProduct} onCancel={() => setProductForm(null)} saving={productSaving} />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group">
                        {/* Product thumbnail */}
                        {p.image_url
                          // eslint-disable-next-line @next/next-eslint/no-img-element
                          ? <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0 border border-gray-200" />
                          : <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400" /></div>
                        }
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">
                            {p.price != null ? `₹${Number(p.price).toLocaleString("en-IN")}` : "No price"}
                            {p.badge && ` · ${p.badge}`}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => triggerImageUpload("", "", p.id)}
                            disabled={uploading && uploadTarget?.productId === p.id}
                            className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-200 transition-colors"
                            title="Upload image"
                          >
                            {uploading && uploadTarget?.productId === p.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <ImageIcon className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => setProductForm({ id: p.id, name: p.name, description: p.description || "", price: p.price?.toString() || "", badge: p.badge || "" })}
                            className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-purple-600 hover:border-purple-200 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => removeProduct(p.id, p.name)}
                            className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {productForm && !productForm.id ? (
                  <ProductFormCard form={productForm} onChange={setProductForm}
                    onSave={saveProduct} onCancel={() => setProductForm(null)} saving={productSaving} />
                ) : (
                  <button onClick={() => setProductForm(EMPTY_PRODUCT)}
                    className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl text-sm font-medium text-gray-400 hover:text-purple-600 transition-colors">
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                )}
              </div>
            </SectionCard>

            {/* Contact */}
            <SectionCard title="Contact Details" icon={Phone}>
              <FieldRow label="Phone" fieldKey="contact.phone" value={wj.contact.phone} onSave={saveField} saving={savingField} />
              <FieldRow label="WhatsApp Number" fieldKey="contact.whatsapp" value={wj.contact.whatsapp} onSave={saveField} saving={savingField} />
              <FieldRow label="Email" fieldKey="contact.email" value={wj.contact.email} type="email" onSave={saveField} saving={savingField} />
              <FieldRow label="Address" fieldKey="contact.address" value={wj.contact.address} multiline onSave={saveField} saving={savingField} />
              <FieldRow label="Business Hours" fieldKey="contact.timings" value={wj.contact.timings} onSave={saveField} saving={savingField} />
            </SectionCard>

            {/* Social */}
            <SectionCard title="Social Media Links" icon={Share2}>
              <FieldRow label="Instagram URL" fieldKey="social.instagram" value={wj.social?.instagram || ""} onSave={saveField} saving={savingField} />
              <FieldRow label="Facebook URL" fieldKey="social.facebook" value={wj.social?.facebook || ""} onSave={saveField} saving={savingField} />
              <FieldRow label="Twitter / X URL" fieldKey="social.twitter" value={wj.social?.twitter || ""} onSave={saveField} saving={savingField} />
              <FieldRow label="YouTube URL" fieldKey="social.youtube" value={wj.social?.youtube || ""} onSave={saveField} saving={savingField} />
            </SectionCard>

            {/* Theme */}
            <SectionCard title="Colors & Theme" icon={Palette}>
              <ColorPicker label="Primary Color" field="theme_color" value={wj.theme_color} onSave={saveColor} saving={savingField} />
              <ColorPicker label="Accent Color" field="accent_color" value={wj.accent_color} onSave={saveColor} saving={savingField} />
            </SectionCard>

            {/* SEO */}
            <SectionCard title="SEO & Meta" icon={Search}>
              <p className="text-xs text-white/30 mt-3 mb-2">Controls the tab title and Google search snippet for this site.</p>
              <FieldRow label="SEO Title" fieldKey="seo.seo_title" value={wj.seo_title || ""} onSave={saveField} saving={savingField} />
              <FieldRow label="Meta Description (150 chars)" fieldKey="seo.seo_description" value={wj.seo_description || ""} multiline onSave={saveField} saving={savingField} />
            </SectionCard>
          </>
        )}

        {tab === "visual" && !wj && (
          <div className="text-center py-20 text-white/30">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-white/50">No website generated yet.</p>
            <Link href={`/create-business`}>
              <Button className="mt-4 bg-purple-600 hover:bg-purple-700">Generate Website</Button>
            </Link>
          </div>
        )}

        {/* ─── AI ASSISTANT TAB ─── */}
        {tab === "ai" && (
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
              <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> AI Assistant
              </h2>
              <p className="text-sm text-white/40 mb-4">
                Describe any change in plain language — AI will apply it instantly.
              </p>
              <Textarea
                rows={3}
                value={instruction}
                onChange={e => setInstruction(e.target.value)}
                placeholder='e.g. "Translate everything to Hindi" or "Add iPhone 16 Pro for ₹1,29,000"'
                className="resize-none text-sm bg-white/5 border-white/10 text-white placeholder:text-white/25"
                onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAiEdit(); }}
              />
              {aiError && <p className="text-sm text-red-400 mt-2">{aiError}</p>}
              {aiSuccess && <p className="text-sm text-green-400 font-medium mt-2">{aiSuccess}</p>}
              <div className="flex gap-2 mt-3">
                <Button onClick={handleAiEdit} disabled={!instruction.trim() || aiLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20">
                  {aiLoading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Applying…</>
                    : <><Send className="w-4 h-4 mr-2" /> Apply Change</>}
                </Button>
                <Button onClick={handleUndo} disabled={undoing}
                  variant="outline"
                  className="border-white/10 text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0"
                  title="Undo last AI edit">
                  {undoing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />}
                </Button>
              </div>
              {undoError && <p className="text-xs text-amber-400 mt-2">{undoError}</p>}
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
              <p className="text-sm font-semibold text-white/40 mb-3">Quick suggestions</p>
              <div className="flex flex-wrap gap-2">
                {AI_SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => setInstruction(s)}
                    className="text-xs bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 border border-white/10 hover:border-purple-500/30 rounded-full px-3 py-1.5 transition-colors text-white/50 font-medium text-left">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── DANGER ZONE (always visible) ─── */}
        <div className="bg-red-500/5 rounded-2xl border border-red-500/20 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-red-500/10 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="font-semibold text-red-400 text-sm">Danger Zone</span>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white/70">Unpublish website</p>
                <p className="text-xs text-white/30 mt-0.5">
                  {website?.is_published ? "Take the site offline." : "Website is already offline."}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleUnpublish}
                disabled={publishing || !website?.is_published}
                className="flex-shrink-0 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 disabled:opacity-30 bg-transparent">
                {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5 mr-1" />}
                Unpublish
              </Button>
            </div>

            <div className="border-t border-red-500/10" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-red-400">Delete website</p>
                <p className="text-xs text-white/30 mt-0.5">Permanently deletes all data. Cannot be undone.</p>
                {deleteError && <p className="text-xs text-red-400 mt-1">{deleteError}</p>}
              </div>
              <Button size="sm" variant="outline" onClick={handleDelete} disabled={deleting}
                className="flex-shrink-0 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 bg-transparent">
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
        {/* Hidden file input for image uploads */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        </main>
        </div>

        {/* ── Preview panel ── */}
        {showPreview && previewUrl && (
          <div className="flex-1 flex flex-col bg-black/30 border-l border-white/10 min-w-0">
            <div className="h-10 bg-black/40 border-b border-white/10 flex items-center gap-2 px-3 flex-shrink-0">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 bg-white/5 rounded px-2 py-0.5 text-xs text-white/30 font-mono truncate">
                localhost:3000{previewUrl}
              </div>
              <button onClick={() => setMobilePreview(m => !m)}
                className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${mobilePreview ? "bg-purple-500/30 text-purple-400" : "hover:bg-white/10 text-white/30 hover:text-white/70"}`}
                title={mobilePreview ? "Switch to desktop" : "Switch to mobile"}>
                {mobilePreview ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setPreviewKey(k => k + 1)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <Link href={previewUrl} target="_blank"
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className={`flex-1 overflow-auto bg-black/20 flex ${mobilePreview ? "items-start justify-center py-4" : ""}`}>
              <iframe
                key={`${previewKey}-${mobilePreview}`}
                src={`${previewUrl}?preview=1`}
                className={`border-none ${mobilePreview ? "w-[390px] h-[844px] rounded-xl shadow-2xl shadow-black/50 flex-shrink-0" : "w-full h-full"}`}
                title="Website preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductFormCard({
  form, onChange, onSave, onCancel, saving,
}: {
  form: ProductForm;
  onChange: (f: ProductForm) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Product Name *</label>
          <Input value={form.name} onChange={e => onChange({ ...form, name: e.target.value })}
            placeholder="e.g. iPhone 15 Pro" className="text-sm h-8" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
          <Input value={form.description} onChange={e => onChange({ ...form, description: e.target.value })}
            placeholder="Short description" className="text-sm h-8" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Price (₹)</label>
          <Input type="number" value={form.price} onChange={e => onChange({ ...form, price: e.target.value })}
            placeholder="0" className="text-sm h-8" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Badge</label>
          <Input value={form.badge} onChange={e => onChange({ ...form, badge: e.target.value })}
            placeholder="New / Popular" className="text-sm h-8" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} disabled={saving || !form.name.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs flex-1">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1" />}
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="h-8 text-xs">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function ColorPicker({
  label, field, value, onSave, saving,
}: {
  label: string;
  field: "theme_color" | "accent_color";
  value: string;
  onSave: (field: "theme_color" | "accent_color", val: string) => Promise<void>;
  saving: string | null;
}) {
  const [color, setColor] = useState(value);
  const isSaving = saving === field;

  return (
    <div className="mt-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-mono text-gray-700 mt-0.5">{color}</p>
      </div>
      <div className="flex items-center gap-2">
        <input type="color" value={color} onChange={e => setColor(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 p-0.5" />
        <button onClick={() => onSave(field, color)} disabled={isSaving || color === value}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1">
          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          Apply
        </button>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
