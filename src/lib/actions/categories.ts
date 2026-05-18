"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { Category } from "@/types";

export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, display_order, is_active, created_at, updated_at")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    return (data as Category[]) || [];
  },
  ["categories"],
  { revalidate: 300 }
);

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return data as Category | null;
}
