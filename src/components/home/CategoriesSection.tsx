"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import { Category } from "@/types";
import { getImageUrl } from "@/lib/utils";

// Fallback images for categories
const fallbackImages: Record<string, string> = {
  women: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80",
  men: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80",
  kids: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=80",
  accessories: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
  sale: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&q=80",
};

interface CategoriesSectionProps {
  categories: Category[];
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  const mainCategories = categories.slice(0, 5);

  return (
    <section className="py-20 md:py-28 bg-stone-50">
      <div className="page-container">
        <SectionHeader
          label="Shop By"
          title="Our Categories"
          subtitle="Explore our carefully curated collections for every occasion"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {mainCategories.map((category, i) => {
            const imageUrl = category.image_url
              ? getImageUrl(category.image_url)
              : fallbackImages[category.slug] || fallbackImages.women;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="group block relative overflow-hidden"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-end justify-center pb-6">
                      <div className="text-center">
                        <h3 className="text-white font-serif text-xl font-medium">
                          {category.name}
                        </h3>
                        <span className="text-white/70 text-xs tracking-[0.15em] uppercase mt-1 block group-hover:text-white transition-colors">
                          Shop Now
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
