"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Banner } from "@/types";
import { getImageUrl } from "@/lib/utils";

interface HeroSectionProps {
  banners: Banner[];
}

// Fallback slides when no banners in DB
const fallbackSlides = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=85",
    title: "New Season",
    subtitle: "Elevate Your Style",
    cta: "Shop Collection",
    href: "/shop",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85",
    title: "Premium Fabrics",
    subtitle: "Crafted for You",
    cta: "Explore Now",
    href: "/shop",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=85",
    title: "Latest Trends",
    subtitle: "The New Collection",
    cta: "Discover More",
    href: "/shop",
  },
];

export default function HeroSection({ banners }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const slides = banners.length > 0
    ? banners.map((b) => ({
        id: b.id,
        image: getImageUrl(b.image_url),
        title: b.title || "",
        subtitle: b.subtitle || "",
        cta: (b as Banner & { cta_text?: string }).cta_text || "Shop Now",
        href: b.link_url || "/shop",
      }))
    : fallbackSlides;

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [autoPlay, slides.length]);

  const prev = () => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
    setAutoPlay(false);
  };

  const next = () => {
    setCurrent((c) => (c + 1) % slides.length);
    setAutoPlay(false);
  };

  return (
    <section className="relative h-[80vh] md:h-[90vh] overflow-hidden bg-stone-100">
      <AnimatePresence mode="wait">
        {slides.map((slide, i) =>
          i === current ? (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={slide.image}
                alt={slide.title || "Fashion collection"}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50" />

              {/* Text Content */}
              <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                <div>
                  {slide.subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="text-white/80 text-xs md:text-sm tracking-[0.3em] uppercase font-medium mb-4"
                    >
                      {slide.subtitle}
                    </motion.p>
                  )}
                  {slide.title && (
                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.7 }}
                      className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-medium leading-tight mb-8"
                    >
                      {slide.title}
                    </motion.h1>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <Link
                      href={slide.href}
                      className="inline-block bg-white text-stone-900 px-10 py-4 text-xs font-medium tracking-[0.2em] uppercase hover:bg-stone-100 transition-colors duration-300"
                    >
                      {slide.cta}
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setAutoPlay(false); }}
              className={`h-0.5 transition-all duration-500 ${
                i === current ? "w-8 bg-white" : "w-4 bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
