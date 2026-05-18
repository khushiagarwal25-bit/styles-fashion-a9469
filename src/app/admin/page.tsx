import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShoppingBag, Tags, Image, Eye, MessageCircle, TrendingUp, Plus } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardStats() {
  const supabase = await createClient();

  const [
    { count: totalProducts },
    { count: totalCategories },
    { count: totalBanners },
    { data: topProducts },
    { count: totalViews },
    { count: totalInquiries },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("categories").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("banners").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("products")
      .select("id, name, view_count, whatsapp_inquiry_count, price")
      .eq("is_active", true)
      .order("view_count", { ascending: false })
      .limit(5),
    supabase.from("analytics").select("*", { count: "exact", head: true }).eq("event_type", "view"),
    supabase
      .from("analytics")
      .select("*", { count: "exact", head: true })
      .in("event_type", ["whatsapp_inquiry", "reserve_inquiry"]),
  ]);

  return {
    totalProducts: totalProducts || 0,
    totalCategories: totalCategories || 0,
    totalBanners: totalBanners || 0,
    topProducts: topProducts || [],
    totalViews: totalViews || 0,
    totalInquiries: totalInquiries || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statCards = [
    { label: "Total Products", value: stats.totalProducts, icon: ShoppingBag, href: "/admin/products", color: "bg-stone-100 text-stone-700" },
    { label: "Categories", value: stats.totalCategories, icon: Tags, href: "/admin/categories", color: "bg-amber-50 text-amber-700" },
    { label: "Banners", value: stats.totalBanners, icon: Image, href: "/admin/banners", color: "bg-blue-50 text-blue-700" },
    { label: "Total Page Views", value: stats.totalViews, icon: Eye, href: "#", color: "bg-green-50 text-green-700" },
    { label: "WhatsApp Inquiries", value: stats.totalInquiries, icon: MessageCircle, href: "#", color: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">Welcome back! Here&apos;s your store overview.</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 py-2.5 px-5 text-xs">
          <Plus size={15} />
          Add Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="admin-card hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-stone-900">{card.value.toLocaleString()}</p>
            <p className="text-xs text-stone-400 mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Top Products */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-medium text-stone-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-stone-500" />
            Most Viewed Products
          </h2>
          <Link href="/admin/products" className="text-xs text-stone-400 hover:text-stone-700">
            View All →
          </Link>
        </div>

        {stats.topProducts.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-8">No products yet.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {stats.topProducts.map((p: { id: string; name: string; view_count: number; whatsapp_inquiry_count: number; price: number }, i) => (
              <div key={p.id} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-stone-300 text-sm font-medium w-5">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{p.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-xs text-stone-400">
                  <span className="flex items-center gap-1">
                    <Eye size={12} /> {p.view_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} /> {p.whatsapp_inquiry_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { label: "Add Product", href: "/admin/products/new", icon: ShoppingBag },
          { label: "Add Category", href: "/admin/categories", icon: Tags },
          { label: "Upload Banner", href: "/admin/banners", icon: Image },
          { label: "Site Settings", href: "/admin/settings", icon: TrendingUp },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="border border-stone-200 bg-white p-4 flex items-center gap-3 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all"
          >
            <action.icon size={18} className="text-stone-500" />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
