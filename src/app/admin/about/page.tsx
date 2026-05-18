"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Save, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
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
          type="text"
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

// ───────────────────────────────────────────────────────────────────────────

type AboutSettings = {
  // Hero section
  about_hero_subheading: string;
  about_hero_heading: string;
  // Story section
  about_story_image: string;
  about_story_subheading: string;
  about_story_heading: string;
  about_story_para1: string;
  about_story_para2: string;
  about_story_para3: string;
  // Values section
  about_values_heading: string;
  about_val1_icon: string;
  about_val1_title: string;
  about_val1_desc: string;
  about_val2_icon: string;
  about_val2_title: string;
  about_val2_desc: string;
  about_val3_icon: string;
  about_val3_title: string;
  about_val3_desc: string;
  // CTA section
  about_cta_heading: string;
  about_cta_text: string;
};

const DEFAULTS: AboutSettings = {
  about_hero_subheading: "Our Story",
  about_hero_heading: "Fashion That Tells Your Story",
  about_story_image: "",
  about_story_subheading: "Who We Are",
  about_story_heading: "Curated Fashion for the Modern Individual",
  about_story_para1:
    "Styles was born from a passion for clothing that goes beyond trends — fashion that speaks to who you are. We believe every piece of clothing is an opportunity for self-expression, and that's exactly what we curate for you.",
  about_story_para2:
    "Our team handpicks every item in our collection, ensuring quality, style, and comfort go hand-in-hand. From premium fabrics to thoughtful designs, every detail is considered so you don't have to think twice.",
  about_story_para3:
    "We're more than a store — we're your personal style destination. Visit us in store or reach us on WhatsApp to find exactly what you're looking for.",
  about_values_heading: "Our Values",
  about_val1_icon: "✦",
  about_val1_title: "Quality First",
  about_val1_desc: "Every piece is carefully selected for its craftsmanship, fabric quality, and lasting style.",
  about_val2_icon: "◈",
  about_val2_title: "Personal Style",
  about_val2_desc: "We believe fashion should be personal. Our collection caters to every taste and occasion.",
  about_val3_icon: "◉",
  about_val3_title: "Customer Love",
  about_val3_desc: "From first visit to final purchase, we provide a premium, personalized experience.",
  about_cta_heading: "Ready to Elevate Your Wardrobe?",
  about_cta_text: "Browse our latest collection or contact us directly on WhatsApp.",
};

export default function AdminAboutPage() {
  const supabase = createClient();
  const storyImageRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<AboutSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("settings")
        .select("key, value")
        .like("key", "about_%");

      if (data && data.length > 0) {
        const obj = data.reduce<Partial<AboutSettings>>(
          (acc, { key, value }) => ({ ...acc, [key]: value || "" }),
          {}
        );
        setSettings({ ...DEFAULTS, ...obj });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const set = (key: keyof AboutSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleStoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const ext = file.name.split(".").pop();
    const fileName = `about-story-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("assets")
      .upload(fileName, file, { contentType: file.type, upsert: true });
    if (error) {
      toast.error(`Upload failed: ${error.message}`);
    } else {
      set("about_story_image", `assets/${data.path}`);
      toast.success("Image uploaded");
    }
    setUploadingImage(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const upserts = Object.entries(settings).map(([key, value]) => ({ key, value: value || "" }));
    const { error } = await supabase
      .from("settings")
      .upsert(upserts, { onConflict: "key" });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("About page saved!");
    }
    setSaving(false);
  };


  if (loading) {
    return <div className="text-stone-400 text-sm text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">About Page</h1>
          <p className="text-stone-500 text-sm mt-1">Edit all content on the About Us page</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 py-2.5 px-5 text-xs"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={15} />
          )}
          Save Page
        </button>
      </div>

      {/* Hero Section */}
      <Section title="Hero Section">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Subheading (small text)" value={settings.about_hero_subheading} onChange={(v) => set("about_hero_subheading", v)} placeholder="Our Story" />
          <Field label="Main Heading" value={settings.about_hero_heading} onChange={(v) => set("about_hero_heading", v)} placeholder="Fashion That Tells Your Story" />
        </div>
      </Section>

      {/* Story Section */}
      <Section title="Story Section">
        {/* Image Upload */}
        <div>
          <label className="label-field">Story Image</label>
          {settings.about_story_image ? (
            <div className="relative h-48 w-full overflow-hidden bg-stone-100 mb-2">
              <Image
                src={getImageUrl(settings.about_story_image)}
                alt="Story image"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => set("about_story_image", "")}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => storyImageRef.current?.click()}
              disabled={uploadingImage}
              className="w-full h-32 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-stone-400 transition-colors mb-2"
            >
              {uploadingImage ? (
                <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
              ) : (
                <>
                  <Upload size={20} className="mb-2" />
                  <span className="text-xs">Click to upload story image</span>
                </>
              )}
            </button>
          )}
          <input ref={storyImageRef} type="file" accept="image/*" className="hidden" onChange={handleStoryImageUpload} />
          <p className="text-xs text-stone-400">Recommended: portrait or square image, min 800px wide</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Subheading" value={settings.about_story_subheading} onChange={(v) => set("about_story_subheading", v)} placeholder="Who We Are" />
          <Field label="Heading" value={settings.about_story_heading} onChange={(v) => set("about_story_heading", v)} placeholder="Curated Fashion for the Modern Individual" />
        </div>
        <Field label="Paragraph 1" value={settings.about_story_para1} onChange={(v) => set("about_story_para1", v)} type="textarea" placeholder="Your store's origin story..." />
        <Field label="Paragraph 2" value={settings.about_story_para2} onChange={(v) => set("about_story_para2", v)} type="textarea" placeholder="About your team and curation process..." />
        <Field label="Paragraph 3" value={settings.about_story_para3} onChange={(v) => set("about_story_para3", v)} type="textarea" placeholder="Your mission or invitation..." />
      </Section>

      {/* Values Section */}
      <Section title="Values Section">
        <Field label="Section Heading" value={settings.about_values_heading} onChange={(v) => set("about_values_heading", v)} placeholder="Our Values" />
        <div className="grid grid-cols-1 gap-6">
          {/* Value 1 */}
          <div className="border border-stone-100 p-4">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">Value 1</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label-field">Icon (emoji/symbol)</label>
                <input value={settings.about_val1_icon} onChange={(e) => set("about_val1_icon", e.target.value)} className="input-field text-xl text-center" placeholder="✦" />
              </div>
              <div>
                <label className="label-field">Title</label>
                <input value={settings.about_val1_title} onChange={(e) => set("about_val1_title", e.target.value)} className="input-field" placeholder="Quality First" />
              </div>
              <div>
                <label className="label-field">Description</label>
                <input value={settings.about_val1_desc} onChange={(e) => set("about_val1_desc", e.target.value)} className="input-field" placeholder="Every piece is carefully selected..." />
              </div>
            </div>
          </div>

          {/* Value 2 */}
          <div className="border border-stone-100 p-4">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">Value 2</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label-field">Icon (emoji/symbol)</label>
                <input value={settings.about_val2_icon} onChange={(e) => set("about_val2_icon", e.target.value)} className="input-field text-xl text-center" placeholder="◈" />
              </div>
              <div>
                <label className="label-field">Title</label>
                <input value={settings.about_val2_title} onChange={(e) => set("about_val2_title", e.target.value)} className="input-field" placeholder="Personal Style" />
              </div>
              <div>
                <label className="label-field">Description</label>
                <input value={settings.about_val2_desc} onChange={(e) => set("about_val2_desc", e.target.value)} className="input-field" placeholder="We believe fashion should be personal..." />
              </div>
            </div>
          </div>

          {/* Value 3 */}
          <div className="border border-stone-100 p-4">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">Value 3</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label-field">Icon (emoji/symbol)</label>
                <input value={settings.about_val3_icon} onChange={(e) => set("about_val3_icon", e.target.value)} className="input-field text-xl text-center" placeholder="◉" />
              </div>
              <div>
                <label className="label-field">Title</label>
                <input value={settings.about_val3_title} onChange={(e) => set("about_val3_title", e.target.value)} className="input-field" placeholder="Customer Love" />
              </div>
              <div>
                <label className="label-field">Description</label>
                <input value={settings.about_val3_desc} onChange={(e) => set("about_val3_desc", e.target.value)} className="input-field" placeholder="From first visit to final purchase..." />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section title="Call to Action Section">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Heading" value={settings.about_cta_heading} onChange={(v) => set("about_cta_heading", v)} placeholder="Ready to Elevate Your Wardrobe?" />
          <Field label="Subtext" value={settings.about_cta_text} onChange={(v) => set("about_cta_text", v)} placeholder="Browse our latest collection or contact us on WhatsApp." />
        </div>
      </Section>

      {/* Save Button (bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 py-3 px-8"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save All Changes
        </button>
      </div>
    </div>
  );
}
