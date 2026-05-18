"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Category } from "@/types";
import { generateSlug, getImageUrl } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const emptyForm = { name: "", slug: "", description: "", display_order: 0, image_url: "" };
  const [form, setForm] = useState(emptyForm);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("display_order");
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `category-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("assets")
      .upload(fileName, file, { contentType: file.type });
    if (error) {
      toast.error(`Upload failed: ${error.message}`);
    } else {
      setForm((f) => ({ ...f, image_url: `assets/${data.path}` }));
      toast.success("Image uploaded");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return toast.error("Name required");

    const payload = { ...form, is_active: true };

    const { error } = editingId
      ? await supabase.from("categories").update(payload).eq("id", editingId)
      : await supabase.from("categories").insert(payload);

    if (error) return toast.error(error.message);
    toast.success(editingId ? "Category updated" : "Category created");
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchCategories();
  };

  const startEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      display_order: cat.display_order,
      image_url: cat.image_url || "",
    });
    setEditingId(cat.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Category deleted");
    fetchCategories();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("categories").update({ is_active: !current }).eq("id", id);
    fetchCategories();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Categories</h1>
          <p className="text-stone-500 text-sm mt-1">{categories.length} categories</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="btn-primary flex items-center gap-2 py-2.5 px-5 text-xs"
        >
          <Plus size={15} />
          Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="admin-card mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-medium text-stone-900">
              {editingId ? "Edit Category" : "New Category"}
            </h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>
              <X size={18} className="text-stone-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="label-field">Category Image</label>
              {form.image_url ? (
                <div className="relative h-36 w-full overflow-hidden bg-stone-100 mb-2">
                  <Image
                    src={getImageUrl(form.image_url)}
                    alt="Category preview"
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
                  className="w-full h-28 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-stone-400 transition-colors"
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload size={20} className="mb-2" />
                      <span className="text-xs">Click to upload category image</span>
                    </>
                  )}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label-field">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="input-field font-mono text-xs"
                />
              </div>
              <div>
                <label className="label-field">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Display Order</label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary py-2.5 px-6 text-xs">
                {editingId ? "Update" : "Create"} Category
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="btn-outline py-2.5 px-6 text-xs">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50">
              <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Image</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider hidden sm:table-cell">Slug</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider hidden md:table-cell">Description</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Order</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-stone-400 text-sm">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-stone-400 text-sm">No categories yet.</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3">
                    {cat.image_url ? (
                      <div className="relative w-12 h-12 overflow-hidden bg-stone-100 flex-shrink-0">
                        <Image
                          src={getImageUrl(cat.image_url)}
                          alt={cat.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-stone-100 flex items-center justify-center text-stone-300 text-[10px]">No img</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-stone-900">{cat.name}</td>
                  <td className="px-5 py-3.5 text-stone-400 text-xs font-mono hidden sm:table-cell">{cat.slug}</td>
                  <td className="px-5 py-3.5 text-stone-500 text-xs hidden md:table-cell line-clamp-1">
                    {cat.description || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-stone-400 text-sm">{cat.display_order}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleActive(cat.id, cat.is_active)}
                      className={`text-[10px] px-2 py-1 font-medium ${
                        cat.is_active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {cat.is_active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(cat)}
                        className="w-8 h-8 border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id, cat.name)}
                        className="w-8 h-8 border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
