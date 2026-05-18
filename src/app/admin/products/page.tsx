import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Plus, Pencil, Trash2, Eye, Star, TrendingUp } from "lucide-react";
import { formatPrice, getImageUrl } from "@/lib/utils";
import DeleteProductButton from "./DeleteProductButton";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Products</h1>
          <p className="text-stone-500 text-sm mt-1">{products?.length || 0} products total</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 py-2.5 px-5 text-xs">
          <Plus size={15} />
          Add Product
        </Link>
      </div>

      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Price</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider hidden md:table-cell">Tags</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider hidden lg:table-cell">Views</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {!products || products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400 text-sm">
                    No products yet.{" "}
                    <Link href="/admin/products/new" className="text-stone-700 underline">
                      Add your first product
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const imgUrl = product.images?.[0]
                    ? getImageUrl(product.images[0])
                    : null;
                  return (
                    <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-stone-100 flex-shrink-0 relative overflow-hidden">
                            {imgUrl ? (
                              <Image src={imgUrl} alt={product.name} fill className="object-cover" sizes="40px" />
                            ) : (
                              <div className="w-full h-full bg-stone-200" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-stone-400 mt-0.5 font-mono">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-stone-500 text-xs hidden sm:table-cell">
                        {(product as { categories?: { name: string } }).categories?.name || "—"}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-stone-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex gap-1.5">
                          {product.is_featured && (
                            <span title="Featured" className="w-5 h-5 bg-amber-100 text-amber-600 rounded flex items-center justify-center">
                              <Star size={11} />
                            </span>
                          )}
                          {product.is_trending && (
                            <span title="Trending" className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center">
                              <TrendingUp size={11} />
                            </span>
                          )}
                          {product.is_new_arrival && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">New</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-stone-400 text-xs hidden lg:table-cell">
                        <span className="flex items-center gap-1">
                          <Eye size={12} /> {product.view_count}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] px-2 py-1 font-medium ${
                          product.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-stone-100 text-stone-500"
                        }`}>
                          {product.is_active ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="w-8 h-8 border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </Link>
                          <DeleteProductButton productId={product.id} productName={product.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
