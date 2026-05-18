import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 mb-8">Add New Product</h1>
      <ProductForm categories={categories || []} />
    </div>
  );
}
