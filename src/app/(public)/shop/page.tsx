import type { Metadata } from "next";
import ShopClient from "./ShopClient";
import { getCategories } from "@/lib/actions/categories";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse our complete collection of premium fashion.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    min?: string;
    max?: string;
    filter?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categories = await getCategories();

  return <ShopClient searchParams={params} categories={categories} />;
}
