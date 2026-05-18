import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/actions/categories";
import { getImageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all fashion categories at Styles.",
};

const fallbackImages: Record<string, string> = {
  women: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80",
  men: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80",
  kids: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=80",
  accessories: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
  sale: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&q=80",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="py-16 md:py-24">
      <div className="page-container">
        <div className="text-center mb-14">
          <p className="section-subheading text-stone-400 mb-3">Browse</p>
          <h1 className="section-heading">All Categories</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, i) => {
            const imageUrl = category.image_url
              ? getImageUrl(category.image_url)
              : fallbackImages[category.slug] || fallbackImages.women;

            return (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group relative overflow-hidden block"
              >
                <div className="relative h-72 md:h-96 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <h2 className="font-serif text-3xl text-white font-medium mb-2">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-white/70 text-sm max-w-xs">
                        {category.description}
                      </p>
                    )}
                    <span className="mt-4 text-xs tracking-[0.2em] uppercase text-white border-b border-white/50 pb-0.5 group-hover:border-white transition-colors">
                      Shop Now
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
