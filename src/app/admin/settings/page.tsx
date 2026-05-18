"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Upload, Save, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { SiteSettings } from "@/types";
import { getImageUrl } from "@/lib/utils";

// ── Standalone sub-components (outside page fn so they never remount) ──────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="admin-card mb-6">
      <h2 className="font-semibold text-stone-900 mb-5 pb-3 border-b border-stone-100">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="label-field">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="input-field resize-none"
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
          placeholder={placeholder}
        />
      )}
      {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Partial<SiteSettings> = {
  store_name: "",
  store_tagline: "",
  whatsapp_number: "",
  store_email: "",
  store_phone: "",
  store_address: "",
  store_city: "",
  store_hours: "",
  instagram_url: "",
  facebook_url: "",
  seo_title: "",
  seo_description: "",
  logo_url: "",
  favicon_url: "",
  footer_text: "",
  google_maps_embed: "",
  announcement_bar: "",
};

// ── Page ────────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const supabase = createClient();
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<Partial<SiteSettings>>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("settings").select("key, value");
      if (data) {
        const obj = data.reduce<Partial<SiteSettings>>(
          (acc, { key, value }) => ({ ...acc, [key]: value || "" }),
          {}
        );
        setSettings({ ...DEFAULT_SETTINGS, ...obj });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const set = (key: keyof SiteSettings) => (value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "logo_url" | "favicon_url"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const ext = file.name.split(".").pop();
    const fileName = `${key}-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("assets")
      .upload(fileName, file, { contentType: file.type, upsert: true });
    if (error) {
      toast.error(`Upload failed: ${error.message}`);
    } else {
      setSettings((prev) => ({ ...prev, [key]: `assets/${data.path}` }));
      toast.success("Image uploaded");
    }
    setUploadingLogo(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const upserts = Object.entries(settings).map(([key, value]) => ({ key, value: value || "" }));
    const { error } = await supabase.from("settings").upsert(upserts, { onConflict: "key" });
    if (error) toast.error(error.message);
    else toast.success("Settings saved!");
    setSaving(false);
  };

  const g = (key: keyof SiteSettings) => settings[key] || "";

  if (loading) {
    return <div className="text-stone-400 text-sm text-center py-12">Loading settings...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Website Settings</h1>
          <p className="text-stone-500 text-sm mt-1">Manage your store information and appearance</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 py-2.5 px-5 text-xs">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
          Save Settings
        </button>
      </div>

      {/* Store Info */}
      <Section title="Store Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Store Name" value={g("store_name")} onChange={set("store_name")} placeholder="Styles" />
          <Field label="Tagline" value={g("store_tagline")} onChange={set("store_tagline")} placeholder="Elevate Your Style" />
          <Field label="Phone" value={g("store_phone")} onChange={set("store_phone")} placeholder="+91 99999 99999" />
          <Field label="Email" value={g("store_email")} onChange={set("store_email")} type="email" placeholder="hello@styles.com" />
          <Field label="City" value={g("store_city")} onChange={set("store_city")} placeholder="Mumbai" />
          <Field label="Store Hours" value={g("store_hours")} onChange={set("store_hours")} placeholder="Mon–Sat: 10am–9pm" />
        </div>
        <Field label="Full Address" value={g("store_address")} onChange={set("store_address")} type="textarea" placeholder="123 Fashion Street, Mumbai, Maharashtra 400001" />
        <Field
          label="Announcement Bar"
          value={g("announcement_bar")}
          onChange={set("announcement_bar")}
          placeholder="Free alterations on purchases above ₹2,000"
          hint="Shows at the top of every page. Leave blank to hide."
        />
      </Section>

      {/* WhatsApp */}
      <Section title="WhatsApp">
        <Field
          label="WhatsApp Number"
          value={g("whatsapp_number")}
          onChange={set("whatsapp_number")}
          placeholder="+919999999999"
          hint="Include country code. e.g. +919999999999 — customers will contact this number."
        />
        {settings.whatsapp_number && (
          <a
            href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700"
          >
            <ExternalLink size={13} />
            Test WhatsApp link
          </a>
        )}
      </Section>

      {/* Social */}
      <Section title="Social Media">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Instagram URL" value={g("instagram_url")} onChange={set("instagram_url")} placeholder="https://instagram.com/stylesfashion" />
          <Field label="Facebook URL" value={g("facebook_url")} onChange={set("facebook_url")} placeholder="https://facebook.com/stylesfashion" />
        </div>
      </Section>

      {/* Branding */}
      <Section title="Branding">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Logo */}
          <div>
            <label className="label-field mb-2">Logo</label>
            {settings.logo_url && (
              <div className="relative h-16 w-32 bg-stone-100 mb-3 overflow-hidden">
                <Image src={getImageUrl(settings.logo_url)} alt="Logo" fill className="object-contain p-2" />
              </div>
            )}
            <button type="button" onClick={() => logoRef.current?.click()} disabled={uploadingLogo} className="btn-outline py-2 px-4 text-xs flex items-center gap-2">
              <Upload size={14} />
              {uploadingLogo ? "Uploading..." : "Upload Logo"}
            </button>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "logo_url")} />
            <p className="text-xs text-stone-400 mt-1">Recommended: PNG with transparent background</p>
          </div>

          {/* Favicon */}
          <div>
            <label className="label-field mb-2">Favicon</label>
            {settings.favicon_url && (
              <div className="relative h-12 w-12 bg-stone-100 mb-3 overflow-hidden">
                <Image src={getImageUrl(settings.favicon_url)} alt="Favicon" fill className="object-contain p-1" />
              </div>
            )}
            <button type="button" onClick={() => faviconRef.current?.click()} disabled={uploadingLogo} className="btn-outline py-2 px-4 text-xs flex items-center gap-2">
              <Upload size={14} />
              Upload Favicon
            </button>
            <input ref={faviconRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "favicon_url")} />
            <p className="text-xs text-stone-400 mt-1">32×32 or 64×64 ICO/PNG</p>
          </div>
        </div>
        <Field label="Footer Text" value={g("footer_text")} onChange={set("footer_text")} placeholder="© 2025 Styles. All rights reserved." />
      </Section>

      {/* SEO */}
      <Section title="SEO & Meta Tags">
        <Field
          label="SEO Title"
          value={g("seo_title")}
          onChange={set("seo_title")}
          placeholder="Styles — Premium Fashion Catalog"
          hint="Appears in browser tab and Google search results. Keep under 60 characters."
        />
        <Field
          label="SEO Description"
          value={g("seo_description")}
          onChange={set("seo_description")}
          type="textarea"
          placeholder="Discover the latest fashion trends at Styles..."
          hint="Shown in Google search results. Keep under 160 characters."
        />
      </Section>

      {/* Map */}
      <Section title="Google Maps">
        <Field
          label="Google Maps Embed Code"
          value={g("google_maps_embed")}
          onChange={set("google_maps_embed")}
          type="textarea"
          placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
          hint="Paste the full embed HTML from Google Maps → Share → Embed a map"
        />
      </Section>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 py-3 px-8">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          Save All Settings
        </button>
      </div>
    </div>
  );
}
