"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Share2, ChevronRight, ZoomIn } from "lucide-react";
import toast from "react-hot-toast";
import { Product } from "@/types";
import { formatPrice, calculateDiscount, getImageUrl, buildWhatsAppUrl, buildReserveUrl } from "@/lib/utils";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  whatsappNumber: string;
  siteUrl: string;
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  whatsappNumber,
  siteUrl,
}: ProductDetailClientProps) {
  const images = product.images?.length
    ? product.images.map((img) => getImageUrl(img))
    : ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80"];

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes?.[0] || null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0] || null
  );
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const productUrl = `${siteUrl}/product/${product.slug}`;
  const discount =
    product.original_price && product.original_price > product.price
      ? calculateDiscount(product.original_price, product.price)
      : null;

  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, product.name, product.price, productUrl);
  const reserveUrl = buildReserveUrl(whatsappNumber, product.name);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: `Check out ${product.name} at Styles`,
        url: productUrl,
      });
    } else {
      await navigator.clipboard.writeText(productUrl);
      toast.success("Link copied to clipboard");
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="py-10 md:py-16">
      <div className="page-container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-stone-400 mb-8 flex-wrap">
          <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-stone-900 transition-colors">Shop</Link>
          {(product as Product & { categories?: { name: string; slug: string } }).categories && (
            <>
              <ChevronRight size={12} />
              <Link
                href={`/shop?category=${(product as Product & { categories?: { slug: string; name: string } }).categories?.slug}`}
                className="hover:text-stone-900 transition-colors"
              >
                {(product as Product & { categories?: { name: string } }).categories?.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-stone-600">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 w-16 flex-shrink-0">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative aspect-square overflow-hidden border-2 transition-all duration-200 ${
                      activeImage === i ? "border-stone-900" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image with Zoom */}
            <div className="flex-1">
              <div
                className="relative overflow-hidden aspect-[3/4] cursor-zoom-in bg-stone-50"
                onMouseEnter={() => setZoomed(true)}
                onMouseLeave={() => setZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <Image
                  src={images[activeImage]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`object-cover transition-transform duration-200 ${
                    zoomed ? "scale-150" : "scale-100"
                  }`}
                  style={
                    zoomed
                      ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                      : {}
                  }
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.is_new_arrival && (
                    <span className="bg-stone-900 text-white text-[10px] px-2.5 py-1 tracking-widest uppercase">New</span>
                  )}
                  {discount && (
                    <span className="bg-red-500 text-white text-[10px] px-2.5 py-1 tracking-wider">-{discount}%</span>
                  )}
                </div>
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2">
                  <ZoomIn size={16} className="text-stone-600" />
                </div>
              </div>

              {/* Mobile thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 lg:hidden overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative w-16 h-16 flex-shrink-0 border-2 transition-all ${
                        activeImage === i ? "border-stone-900" : "border-transparent opacity-60"
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            {/* Category */}
            {(product as Product & { categories?: { name: string; slug: string } }).categories && (
              <Link
                href={`/shop?category=${(product as Product & { categories?: { slug: string } }).categories?.slug}`}
                className="text-xs font-medium tracking-[0.2em] uppercase text-stone-400 hover:text-stone-900 transition-colors mb-3"
              >
                {(product as Product & { categories?: { name: string } }).categories?.name}
              </Link>
            )}

            <h1 className="font-serif text-3xl md:text-4xl font-medium text-stone-900 leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-semibold text-stone-900">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-lg text-stone-400 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                  <span className="text-sm text-red-500 font-medium">
                    {discount}% off
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            <div className="border-t border-stone-100 pt-6 space-y-6">
              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <p className="label-field mb-2.5">
                    Color:{" "}
                    <span className="text-stone-900 normal-case font-medium">
                      {selectedColor}
                    </span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 text-xs border transition-all duration-200 ${
                          selectedColor === color
                            ? "bg-stone-900 text-white border-stone-900"
                            : "border-stone-200 text-stone-600 hover:border-stone-400"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <p className="label-field mb-2.5">
                    Size:{" "}
                    <span className="text-stone-900 normal-case font-medium">
                      {selectedSize}
                    </span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-10 text-xs border transition-all duration-200 ${
                          selectedSize === size
                            ? "bg-stone-900 text-white border-stone-900"
                            : "border-stone-200 text-stone-600 hover:border-stone-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Material */}
              {product.material && (
                <div>
                  <p className="label-field mb-1">Material</p>
                  <p className="text-sm text-stone-600">{product.material}</p>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/shop?search=${tag}`}
                      className="text-[11px] bg-stone-100 text-stone-500 px-2.5 py-1 hover:bg-stone-200 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp flex-1 justify-center py-4 text-sm"
              >
                <MessageCircle size={18} />
                WhatsApp Inquiry
              </a>
              <a
                href={reserveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex-1 text-center py-4 text-sm"
              >
                Reserve in Store
              </a>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors text-xs mt-5 w-fit"
            >
              <Share2 size={14} />
              Share this product
            </button>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <SectionHeader label="You May Also Like" title="Related Products" />
            <div className="grid-products">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
