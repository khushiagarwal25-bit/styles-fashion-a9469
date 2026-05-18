"use server";

import { createClient } from "@/lib/supabase/server";
import { Banner } from "@/types";

export async function getBanners(
  type?: "hero" | "promotional" | "category"
): Promise<Banner[]> {
  const supabase = await createClient();
  let query = supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (type) query = query.eq("banner_type", type);

  const { data } = await query;
  return (data as Banner[]) || [];
}
