"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SiteSettings } from "@/types";
import { settingsArrayToObject } from "@/lib/utils";

const fetchSettings = unstable_cache(
  async (): Promise<Partial<SiteSettings>> => {
    const supabase = await createClient();
    const { data } = await supabase.from("settings").select("key, value");
    if (!data) return {};
    return settingsArrayToObject(data) as Partial<SiteSettings>;
  },
  ["site-settings"],
  { revalidate: 300 } // cache 5 minutes
);

export async function getSiteSettings(): Promise<Partial<SiteSettings>> {
  return fetchSettings();
}

export async function updateSiteSettings(
  updates: Partial<SiteSettings>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const upserts = Object.entries(updates).map(([key, value]) => ({
    key,
    value: value || "",
  }));

  const { error } = await supabase
    .from("settings")
    .upsert(upserts, { onConflict: "key" });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
