"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { Product } from "@/types";

interface TrendingProductsProps {
  products: Product[];
}

export default function TrendingProducts({ products }: TrendingProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  return (
    <section className="py-20 md:py-28">
      <div className="page-container">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <SectionHeader
            label="Most Popular"
            title="Trending Now"
            centered={false}
          />
          <div className="hidden md:flex gap-2 mb-1">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 border border-stone-200 flex items-center justify-center hover:bg-stone-900 hover:border-stone-900 hover:text-white transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 border border-stone-200 flex items-center justify-center hover:bg-stone-900 hover:border-stone-900 hover:text-white transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 hide-scrollbar"
        >
          {products.map((product, i) => (
            <div key={product.id} className="w-56 md:w-64 flex-shrink-0">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link href="/shop?filter=trending" className="btn-outline">
            View All Trending
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
