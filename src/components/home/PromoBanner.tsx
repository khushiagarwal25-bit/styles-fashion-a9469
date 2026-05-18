"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Banner } from "@/types";
import { getImageUrl } from "@/lib/utils";

interface PromoBannerProps {
  banner?: Banner;
}

export default function PromoBanner({ banner }: PromoBannerProps) {
  const imageUrl = banner?.image_url
    ? getImageUrl(banner.image_url)
    : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=85";

  return (
    <section className="py-8 md:py-12">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden h-[300px] md:h-[400px] lg:h-[500px]"
        >
          <Image
            src={imageUrl}
            alt={banner?.title || "Special offer"}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <div>
              {banner?.subtitle && (
                <p className="text-white/70 text-xs tracking-[0.3em] uppercase mb-3">
                  {banner.subtitle}
                </p>
              )}
              <h2 className="font-serif text-3xl md:text-5xl text-white font-medium mb-6">
                {banner?.title || "The New Season Is Here"}
              </h2>
              <Link
                href={banner?.link_url || "/shop"}
                className="inline-block bg-white text-stone-900 px-10 py-3.5 text-xs font-medium tracking-[0.2em] uppercase hover:bg-stone-100 transition-colors"
              >
                Explore Now
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
