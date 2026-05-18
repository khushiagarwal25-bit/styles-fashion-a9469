import HeroSection from "@/components/home/HeroSection";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import NewArrivals from "@/components/home/NewArrivals";
import TrendingProducts from "@/components/home/TrendingProducts";
import CategoriesSection from "@/components/home/CategoriesSection";
import PromoBanner from "@/components/home/PromoBanner";
import StoreInfo from "@/components/home/StoreInfo";
import { getBanners } from "@/lib/actions/banners";
import { getFeaturedProducts, getNewArrivals, getTrendingProducts } from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";
import { getSiteSettings } from "@/lib/actions/settings";

export default async function HomePage() {
  const [heroBanners, promoBanners, featured, newArrivals, trending, categories, settings] =
    await Promise.all([
      getBanners("hero"),
      getBanners("promotional"),
      getFeaturedProducts(8),
      getNewArrivals(8),
      getTrendingProducts(8),
      getCategories(),
      getSiteSettings(),
    ]);

  return (
    <>
      <HeroSection banners={heroBanners} />
      <FeaturedCollections products={featured} />
      <CategoriesSection categories={categories} />
      <NewArrivals products={newArrivals} />
      <PromoBanner banner={promoBanners[0]} />
      <TrendingProducts products={trending} />
      <StoreInfo settings={settings} />
    </>
  );
}
