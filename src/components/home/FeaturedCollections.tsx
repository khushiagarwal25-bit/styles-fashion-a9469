"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { Product } from "@/types";

interface FeaturedCollectionsProps {
  products: Product[];
}

export default function FeaturedCollections({ products }: FeaturedCollectionsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="page-container">
        <SectionHeader
          label="Curated For You"
          title="Featured Collections"
          subtitle="Handpicked pieces that define modern elegance"
        />

        <div className="grid-products">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/shop" className="btn-outline">
            View All Products
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
