"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Banner } from "@/types";

export const getBanners = unstable_cache(
  async (type?: "hero" | "promotional" | "category"): Promise<Banner[]> => {
    const supabase = await createClient();
    let query = supabase
      .from("banners")
      .select("id, title, subtitle, image_url, link_url, cta_text, banner_type, display_order, is_active")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (type) query = query.eq("banner_type", type);
    const { data } = await query;
    return (data as unknown as Banner[]) || [];
  },
  ["banners"],
  { revalidate: 300 }
);
