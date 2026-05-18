"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { Product } from "@/types";

interface NewArrivalsProps {
  products: Product[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-stone-50">
      <div className="page-container">
        <SectionHeader
          label="Just In"
          title="New Arrivals"
          subtitle="The latest additions to our curated collection"
        />

        <div className="grid-products">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/shop?filter=new" className="btn-primary">
            Shop New Arrivals
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
