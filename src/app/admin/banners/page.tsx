"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, X, Upload, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Banner } from "@/types";
import { getImageUrl } from "@/lib/utils";

export default function AdminBannersPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const emptyForm: {
    title: string;
    subtitle: string;
    image_url: string;
    link_url: string;
    cta_text: string;
    banner_type: "hero" | "promotional" | "category";
    display_order: number;
    is_active: boolean;
  } = {
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    cta_text: "",
    banner_type: "hero",
    display_order: 0,
    is_active: true,
  };
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const fetchBanners = async () => {
    const { data } = await supabase
      .from("banners")
      .select("*")
      .order("banner_type")
      .order("display_order");
    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("banners")
      .upload(fileName, file, { contentType: file.type });

    if (error) {
      toast.error(`Upload failed: ${error.message}`);
    } else {
      setForm((f) => ({ ...f, image_url: `banners/${data.path}` }));
      toast.success("Image uploaded");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url) return toast.error("Image required");

    const { error } = editingId
      ? await supabase.from("banners").update(form).eq("id", editingId)
      : await supabase.from("banners").insert(form);

    if (error) return toast.error(error.message);
    toast.success(editingId ? "Banner updated" : "Banner created");
    closeForm();
    fetchBanners();
  };

  const startEdit = (banner: Banner) => {
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      image_url: banner.image_url,
      link_url: banner.link_url || "",
      cta_text: (banner as Banner & { cta_text?: string }).cta_text || "",
      banner_type: banner.banner_type,
      display_order: banner.display_order,
      is_active: banner.is_active,
    });
    setEditingId(banner.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const deleteBanner = async (id: string, imageUrl: string) => {
    if (!confirm("Delete this banner?")) return;
    await supabase.from("banners").delete().eq("id", id);
    if (imageUrl.startsWith("banners/")) {
      await supabase.storage.from("banners").remove([imageUrl.replace("banners/", "")]);
    }
    toast.success("Banner deleted");
    fetchBanners();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("banners").update({ is_active: !current }).eq("id", id);
    fetchBanners();
  };

  const typeLabels: Record<"hero" | "promotional" | "category", string> = {
    hero: "Hero Slider",
    promotional: "Promotional",
    category: "Category",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Banners</h1>
          <p className="text-stone-500 text-sm mt-1">{banners.length} banners total</p>
        </div>
        <button
          onClick={() => { closeForm(); setShowForm(true); }}
          className="btn-primary flex items-center gap-2 py-2.5 px-5 text-xs"
        >
          <Plus size={15} />
          Add Banner
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="admin-card mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-medium text-stone-900">{editingId ? "Edit Banner" : "New Banner"}</h2>
            <button onClick={closeForm}>
              <X size={18} className="text-stone-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="label-field">Banner Image *</label>
              {form.image_url ? (
                <div className="relative h-40 w-full overflow-hidden bg-stone-100 mb-2">
                  <Image
                    src={getImageUrl(form.image_url)}
                    alt="Banner preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-32 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-stone-400 transition-colors"
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload size={20} className="mb-2" />
                      <span className="text-xs">Click to upload banner image</span>
                    </>
                  )}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. New Season" />
              </div>
              <div>
                <label className="label-field">Subtitle</label>
                <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input-field" placeholder="e.g. Elevate Your Style" />
              </div>
              <div>
                <label className="label-field">CTA Button Text</label>
                <input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} className="input-field" placeholder="Shop Now" />
              </div>
              <div>
                <label className="label-field">Link URL</label>
                <input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} className="input-field" placeholder="/shop" />
              </div>
              <div>
                <label className="label-field">Banner Type</label>
                <select value={form.banner_type} onChange={(e) => setForm({ ...form, banner_type: e.target.value as "hero" | "promotional" | "category" })} className="input-field">
                  <option value="hero">Hero Slider</option>
                  <option value="promotional">Promotional Banner</option>
                  <option value="category">Category Banner</option>
                </select>
              </div>
              <div>
                <label className="label-field">Display Order</label>
                <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) })} className="input-field" />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary py-2.5 px-6 text-xs">
                {editingId ? "Update" : "Create"} Banner
              </button>
              <button type="button" onClick={closeForm} className="btn-outline py-2.5 px-6 text-xs">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Banner Grid */}
      {loading ? (
        <div className="text-center py-12 text-stone-400">Loading...</div>
      ) : banners.length === 0 ? (
        <div className="admin-card text-center py-12 text-stone-400">
          No banners yet. Add your first banner.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((banner) => (
            <div key={banner.id} className="admin-card p-0 overflow-hidden">
              <div className="relative h-40 bg-stone-100">
                <Image
                  src={getImageUrl(banner.image_url)}
                  alt={banner.title || "Banner"}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 text-[10px] bg-stone-900/80 text-white px-2 py-0.5 backdrop-blur-sm">
                  {typeLabels[banner.banner_type]}
                </span>
              </div>
              <div className="p-4">
                <p className="font-medium text-stone-900 text-sm">{banner.title || "—"}</p>
                <p className="text-stone-400 text-xs mt-0.5">{banner.subtitle || "—"}</p>
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => toggleActive(banner.id, banner.is_active)}
                    className={`text-[10px] px-2 py-1 font-medium ${
                      banner.is_active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {banner.is_active ? "Active" : "Hidden"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(banner)}
                      className="w-8 h-8 border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => deleteBanner(banner.id, banner.image_url)}
                      className="w-8 h-8 border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
