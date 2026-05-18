import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/actions/products";
import { getSiteSettings } from "@/lib/actions/settings";
import ProductDetailClient from "./ProductDetailClient";
import { getImageUrl } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const imageUrl = product.images?.[0] ? getImageUrl(product.images[0]) : undefined;

  return {
    title: product.name,
    description: product.description || `Shop ${product.name} at Styles`,
    openGraph: {
      title: product.name,
      description: product.description || "",
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description || "",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
  ]);

  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.category_id, 4);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={related}
      whatsappNumber={settings.whatsapp_number || "+919999999999"}
      siteUrl={process.env.NEXT_PUBLIC_SITE_URL || ""}
    />
  );
}
