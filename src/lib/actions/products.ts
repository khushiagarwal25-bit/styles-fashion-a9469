"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { Product, ProductFilters } from "@/types";

// Only fetch columns needed for product cards
const CARD_FIELDS = "id, name, slug, price, original_price, images, sizes, colors, tags, is_featured, is_trending, is_new_arrival, is_active, view_count, categories(id, name, slug)";

export async function getProducts(
  filters: ProductFilters = {},
  page = 1,
  limit = 12
): Promise<{ products: Product[]; total: number }> {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from("products")
    .select("*, categories(id, name, slug)", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (filters.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`
    );
  }

  if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
  if (filters.isFeatured)   query = query.eq("is_featured", true);
  if (filters.isTrending)   query = query.eq("is_trending", true);
  if (filters.isNewArrival) query = query.eq("is_new_arrival", true);

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching products:", error);
    return { products: [], total: 0 };
  }

  return { products: (data as Product[]) || [], total: count || 0 };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;

  void supabase
    .from("products")
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq("id", data.id);

  return data as Product;
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4
): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(CARD_FIELDS)
    .eq("is_active", true)
    .neq("id", productId)
    .limit(limit);

  if (categoryId) query = query.eq("category_id", categoryId);

  const { data } = await query.order("created_at", { ascending: false });
  return (data as unknown as Product[]) || [];
}

export const getFeaturedProducts = unstable_cache(
  async (limit = 8): Promise<Product[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select(CARD_FIELDS)
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data as unknown as Product[]) || [];
  },
  ["featured-products"],
  { revalidate: 180 }
);

export const getTrendingProducts = unstable_cache(
  async (limit = 8): Promise<Product[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select(CARD_FIELDS)
      .eq("is_active", true)
      .eq("is_trending", true)
      .order("view_count", { ascending: false })
      .limit(limit);
    return (data as unknown as Product[]) || [];
  },
  ["trending-products"],
  { revalidate: 180 }
);

export const getNewArrivals = unstable_cache(
  async (limit = 8): Promise<Product[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select(CARD_FIELDS)
      .eq("is_active", true)
      .eq("is_new_arrival", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data as unknown as Product[]) || [];
  },
  ["new-arrivals"],
  { revalidate: 180 }
);

export async function trackAnalytics(
  productId: string,
  eventType: "view" | "whatsapp_inquiry" | "reserve_inquiry"
) {
  const supabase = await createClient();
  await supabase.from("analytics").insert({ product_id: productId, event_type: eventType });
}
