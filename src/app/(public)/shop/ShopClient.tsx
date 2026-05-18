"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import { Category, Product } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

interface ShopClientProps {
  searchParams: {
    category?: string;
    search?: string;
    min?: string;
    max?: string;
    filter?: string;
    page?: string;
  };
  categories: Category[];
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹2,500", min: 1000, max: 2500 },
  { label: "₹2,500 – ₹5,000", min: 2500, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: 99999 },
];
const LIMIT = 12;

export default function ShopClient({ searchParams, categories }: ShopClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const currentPage = parseInt(searchParams.page || "1");
  const [searchInput, setSearchInput] = useState(searchParams.search || "");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const offset = (currentPage - 1) * LIMIT;

    let query = supabase
      .from("products")
      .select("*, categories(id,name,slug)", { count: "exact" })
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (searchParams.category) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", searchParams.category)
        .single();
      if (cat) query = query.eq("category_id", cat.id);
    }

    if (searchParams.search) {
      query = query.ilike("name", `%${searchParams.search}%`);
    }

    if (searchParams.min) query = query.gte("price", parseInt(searchParams.min));
    if (searchParams.max) query = query.lte("price", parseInt(searchParams.max));

    if (searchParams.filter === "new") query = query.eq("is_new_arrival", true);
    if (searchParams.filter === "trending") query = query.eq("is_trending", true);
    if (searchParams.filter === "featured") query = query.eq("is_featured", true);

    const { data, count } = await query.range(offset, offset + LIMIT - 1);
    setProducts((data as Product[]) || []);
    setTotal(count || 0);
    setLoading(false);
  }, [searchParams, currentPage]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
      )
    );
    if (value === null) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("search", searchInput || null);
  };

  const clearAll = () => {
    setSearchInput("");
    router.push(pathname);
  };

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters =
    searchParams.category ||
    searchParams.search ||
    searchParams.min ||
    searchParams.max ||
    searchParams.filter;

  const activeCategory = categories.find((c) => c.slug === searchParams.category);
  const activePriceRange = PRICE_RANGES.find(
    (r) => r.min === parseInt(searchParams.min || "0") && r.max === parseInt(searchParams.max || "0")
  );

  return (
    <div className="py-12 md:py-16">
      <div className="page-container">
        {/* Page Header */}
        <div className="mb-10">
          <p className="section-subheading text-stone-400 mb-2">
            {activeCategory ? activeCategory.name : "All Products"}
          </p>
          <h1 className="section-heading">
            {searchParams.filter === "new"
              ? "New Arrivals"
              : searchParams.filter === "trending"
              ? "Trending Now"
              : searchParams.filter === "featured"
              ? "Featured"
              : activeCategory
              ? activeCategory.name
              : "Shop"}
          </h1>
          {total > 0 && (
            <p className="text-stone-400 text-sm mt-2">{total} products</p>
          )}
        </div>

        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="input-field pl-10"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-3">Search</button>
          </form>

          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="btn-outline px-5 py-3 flex items-center gap-2"
          >
            <SlidersHorizontal size={16} />
            Filters
            {hasFilters && (
              <span className="w-2 h-2 bg-stone-900 rounded-full" />
            )}
          </button>
        </div>

        {/* Active Filters */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeCategory && (
              <span className="flex items-center gap-1.5 bg-stone-100 text-stone-700 text-xs px-3 py-1.5">
                {activeCategory.name}
                <button onClick={() => updateParam("category", null)}><X size={12} /></button>
              </span>
            )}
            {searchParams.search && (
              <span className="flex items-center gap-1.5 bg-stone-100 text-stone-700 text-xs px-3 py-1.5">
                &ldquo;{searchParams.search}&rdquo;
                <button onClick={() => { setSearchInput(""); updateParam("search", null); }}><X size={12} /></button>
              </span>
            )}
            {activePriceRange && (
              <span className="flex items-center gap-1.5 bg-stone-100 text-stone-700 text-xs px-3 py-1.5">
                {activePriceRange.label}
                <button onClick={() => { updateParam("min", null); updateParam("max", null); }}><X size={12} /></button>
              </span>
            )}
            {searchParams.filter && (
              <span className="flex items-center gap-1.5 bg-stone-100 text-stone-700 text-xs px-3 py-1.5 capitalize">
                {searchParams.filter}
                <button onClick={() => updateParam("filter", null)}><X size={12} /></button>
              </span>
            )}
            <button onClick={clearAll} className="text-xs text-red-500 underline">
              Clear All
            </button>
          </div>
        )}

        {/* Filter Panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8 border border-stone-100 bg-stone-50"
            >
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Categories */}
                <div>
                  <p className="label-field mb-3">Category</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateParam("category", null)}
                      className={`text-xs px-3 py-1.5 border transition-colors ${
                        !searchParams.category
                          ? "bg-stone-900 text-white border-stone-900"
                          : "border-stone-200 text-stone-600 hover:border-stone-400"
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => updateParam("category", cat.slug)}
                        className={`text-xs px-3 py-1.5 border transition-colors ${
                          searchParams.category === cat.slug
                            ? "bg-stone-900 text-white border-stone-900"
                            : "border-stone-200 text-stone-600 hover:border-stone-400"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <p className="label-field mb-3">Price Range</p>
                  <div className="flex flex-col gap-2">
                    {PRICE_RANGES.map((range) => {
                      const isActive =
                        parseInt(searchParams.min || "0") === range.min &&
                        parseInt(searchParams.max || "0") === range.max;
                      return (
                        <button
                          key={range.label}
                          onClick={() => {
                            if (isActive) {
                              updateParam("min", null);
                              updateParam("max", null);
                            } else {
                              const p = new URLSearchParams(
                                Object.fromEntries(
                                  Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
                                )
                              );
                              p.set("min", String(range.min));
                              p.set("max", String(range.max));
                              p.delete("page");
                              router.push(`${pathname}?${p.toString()}`);
                            }
                          }}
                          className={`text-left text-xs px-3 py-2 border transition-colors ${
                            isActive
                              ? "bg-stone-900 text-white border-stone-900"
                              : "border-stone-200 text-stone-600 hover:border-stone-400"
                          }`}
                        >
                          {range.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filter badges */}
                <div>
                  <p className="label-field mb-3">Filter</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "New Arrivals", value: "new" },
                      { label: "Trending", value: "trending" },
                      { label: "Featured", value: "featured" },
                    ].map((f) => (
                      <button
                        key={f.value}
                        onClick={() =>
                          updateParam("filter", searchParams.filter === f.value ? null : f.value)
                        }
                        className={`text-xs px-3 py-1.5 border transition-colors ${
                          searchParams.filter === f.value
                            ? "bg-stone-900 text-white border-stone-900"
                            : "border-stone-200 text-stone-600 hover:border-stone-400"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={LIMIT} />
        ) : products.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid-products">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-14">
                <button
                  onClick={() => updateParam("page", String(currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="w-10 h-10 border border-stone-200 flex items-center justify-center text-stone-600 disabled:opacity-30 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateParam("page", String(p))}
                    className={`w-10 h-10 border text-sm transition-all ${
                      p === currentPage
                        ? "bg-stone-900 text-white border-stone-900"
                        : "border-stone-200 text-stone-600 hover:border-stone-400"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => updateParam("page", String(currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="w-10 h-10 border border-stone-200 flex items-center justify-center text-stone-600 disabled:opacity-30 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all"
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
