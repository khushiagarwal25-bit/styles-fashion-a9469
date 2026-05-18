"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Upload, Plus, GripVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { generateSlug, getImageUrl } from "@/lib/utils";
import { Product } from "@/types";

interface ProductFormProps {
  product?: Product;
  categories: { id: string; name: string }[];
}

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(String(product?.price || ""));
  const [originalPrice, setOriginalPrice] = useState(String(product?.original_price || ""));
  const [categoryId, setCategoryId] = useState(product?.category_id || "");
  const [material, setMaterial] = useState(product?.material || "");
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [sizes, setSizes] = useState<string[]>(product?.sizes || []);
  const [colors, setColors] = useState<string[]>(product?.colors || []);
  const [tags, setTags] = useState<string[]>(product?.tags || []);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured || false);
  const [isTrending, setIsTrending] = useState(product?.is_trending || false);
  const [isNewArrival, setIsNewArrival] = useState(product?.is_new_arrival || false);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);

  const [colorInput, setColorInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const handleNameChange = (val: string) => {
    setName(val);
    if (!product) setSlug(generateSlug(val));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, { contentType: file.type });

      if (error) {
        toast.error(`Failed to upload ${file.name}`);
      } else {
        setImages((prev) => [...prev, `product-images/${data.path}`]);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = async (imgPath: string) => {
    setImages((prev) => prev.filter((i) => i !== imgPath));
    if (imgPath.startsWith("product-images/")) {
      const path = imgPath.replace("product-images/", "");
      await supabase.storage.from("product-images").remove([path]);
    }
  };

  const toggleSize = (size: string) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const addColor = () => {
    const c = colorInput.trim();
    if (c && !colors.includes(c)) setColors((prev) => [...prev, c]);
    setColorInput("");
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return toast.error("Name and price are required");
    setLoading(true);

    const payload = {
      name,
      slug,
      description: description || null,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      category_id: categoryId || null,
      material: material || null,
      images,
      sizes,
      colors,
      tags,
      is_featured: isFeatured,
      is_trending: isTrending,
      is_new_arrival: isNewArrival,
      is_active: isActive,
    };

    const { error } = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(product ? "Product updated!" : "Product created!");
      router.push("/admin/products");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="admin-card">
            <h2 className="font-medium text-stone-900 mb-5">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="label-field">Product Name *</label>
                <input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Floral Midi Dress"
                  required
                />
              </div>
              <div>
                <label className="label-field">URL Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="input-field font-mono text-xs"
                  placeholder="auto-generated-from-name"
                />
              </div>
              <div>
                <label className="label-field">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Describe the product..."
                />
              </div>
              <div>
                <label className="label-field">Material / Fabric</label>
                <input
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="input-field"
                  placeholder="e.g. 100% Cotton, Polyester blend"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="admin-card">
            <h2 className="font-medium text-stone-900 mb-5">Product Images</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
              {images.map((img, i) => (
                <div key={img} className="relative aspect-[3/4] bg-stone-100 group">
                  <Image
                    src={getImageUrl(img)}
                    alt={`Image ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[9px] bg-stone-900 text-white px-1.5 py-0.5">Main</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-[3/4] border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-colors"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload size={18} className="mb-1" />
                    <span className="text-[10px]">Upload</span>
                  </>
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
            <p className="text-xs text-stone-400">
              First image will be the main product image. Drag images to reorder (coming soon).
            </p>
          </div>

          {/* Sizes & Colors */}
          <div className="admin-card">
            <h2 className="font-medium text-stone-900 mb-5">Sizes & Colors</h2>

            <div className="mb-5">
              <label className="label-field mb-3">Available Sizes</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1.5 text-xs border transition-all ${
                      sizes.includes(size)
                        ? "bg-stone-900 text-white border-stone-900"
                        : "border-stone-200 text-stone-600 hover:border-stone-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-field mb-2">Colors</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {colors.map((c) => (
                  <span key={c} className="flex items-center gap-1.5 bg-stone-100 text-stone-700 text-xs px-3 py-1.5">
                    {c}
                    <button type="button" onClick={() => setColors((prev) => prev.filter((x) => x !== c))}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                  className="input-field flex-1 py-2"
                  placeholder="Add color (e.g. Navy Blue)"
                />
                <button type="button" onClick={addColor} className="btn-outline px-3 py-2 text-xs">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="admin-card">
            <h2 className="font-medium text-stone-900 mb-5">Tags</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1.5 bg-stone-100 text-stone-600 text-xs px-3 py-1.5">
                  #{t}
                  <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))}>
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="input-field flex-1 py-2"
                placeholder="Add tag (e.g. summer, casual)"
              />
              <button type="button" onClick={addTag} className="btn-outline px-3 py-2 text-xs">
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-5">
          {/* Pricing */}
          <div className="admin-card">
            <h2 className="font-medium text-stone-900 mb-5">Pricing</h2>
            <div className="space-y-4">
              <div>
                <label className="label-field">Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input-field"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="label-field">Original / MRP (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="input-field"
                  placeholder="0.00 (for strike-through)"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="admin-card">
            <h2 className="font-medium text-stone-900 mb-4">Category</h2>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-field"
            >
              <option value="">— No Category —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Badges */}
          <div className="admin-card">
            <h2 className="font-medium text-stone-900 mb-4">Product Badges</h2>
            <div className="space-y-3">
              {[
                { label: "Featured Product", value: isFeatured, setter: setIsFeatured, desc: "Shows in featured section" },
                { label: "Trending", value: isTrending, setter: setIsTrending, desc: "Shows in trending section" },
                { label: "New Arrival", value: isNewArrival, setter: setIsNewArrival, desc: "Shows 'New' badge" },
              ].map(({ label, value, setter, desc }) => (
                <label key={label} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setter(e.target.checked)}
                    className="mt-0.5 accent-stone-900"
                  />
                  <div>
                    <p className="text-sm font-medium text-stone-900">{label}</p>
                    <p className="text-xs text-stone-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="admin-card">
            <h2 className="font-medium text-stone-900 mb-4">Visibility</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setIsActive(!isActive)}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                  isActive ? "bg-green-500" : "bg-stone-300"
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  isActive ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </div>
              <span className="text-sm font-medium text-stone-900">
                {isActive ? "Active (visible)" : "Hidden"}
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              product ? "Update Product" : "Create Product"
            )}
          </button>

          {product && (
            <a
              href={`/product/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-stone-400 hover:text-stone-700 transition-colors"
            >
              Preview on website →
            </a>
          )}
        </div>
      </div>
    </form>
  );
}
