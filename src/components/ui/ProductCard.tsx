"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Heart } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, calculateDiscount, getImageUrl } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
  priority?: boolean;
}

export default function ProductCard({ product, index = 0, priority = false }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(
    product.images?.[0] ? getImageUrl(product.images[0]) : "/images/placeholder.svg"
  );
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const secondImage = product.images?.[1] ? getImageUrl(product.images[1]) : null;
  const discount =
    product.original_price && product.original_price > product.price
      ? calculateDiscount(product.original_price, product.price)
      : null;

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
        className="group"
      >
        <Link href={`/product/${product.slug}`}>
          <div
            className="relative overflow-hidden bg-stone-100 aspect-product"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Main Image */}
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-all duration-500 ${
                hovered && secondImage ? "opacity-0 scale-105" : "opacity-100 scale-100"
              }`}
              onError={() => setImgSrc("/images/placeholder.svg")}
            />

            {/* Hover Image */}
            {secondImage && (
              <Image
                src={secondImage}
                alt={`${product.name} alt`}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-all duration-500 absolute inset-0 ${
                  hovered ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
              />
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.is_new_arrival && (
                <span className="bg-stone-900 text-white text-[10px] px-2 py-1 font-medium tracking-widest uppercase">New</span>
              )}
              {discount && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-1 font-medium tracking-wider">-{discount}%</span>
              )}
              {product.is_trending && (
                <span className="bg-amber-500 text-white text-[10px] px-2 py-1 font-medium tracking-widest uppercase">Trending</span>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
              aria-label="Add to wishlist"
            >
              <Heart size={15} className={wishlisted ? "fill-red-500 text-red-500" : "text-stone-600"} />
            </button>

            {/* Quick View overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-stone-900/90 text-white text-center py-3 text-xs tracking-widest uppercase font-medium translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              View Details
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-3 px-0.5">
            <p className="text-[11px] text-stone-400 tracking-wider uppercase mb-1">
              {(product as Product & { categories?: { name: string } }).categories?.name || ""}
            </p>
            <h3 className="text-sm font-medium text-stone-900 leading-tight line-clamp-2 group-hover:text-stone-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm font-semibold text-stone-900">{formatPrice(product.price)}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs text-stone-400 line-through">{formatPrice(product.original_price)}</span>
              )}
            </div>
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {product.sizes.slice(0, 4).map((size) => (
                  <span key={size} className="text-[10px] border border-stone-200 px-1.5 py-0.5 text-stone-400">{size}</span>
                ))}
                {product.sizes.length > 4 && (
                  <span className="text-[10px] text-stone-400">+{product.sizes.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </Link>
      </m.div>
    </LazyMotion>
  );
}
