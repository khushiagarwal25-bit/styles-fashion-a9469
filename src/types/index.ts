export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  categories?: Category;
  images: string[];
  sizes: string[];
  colors: string[];
  material: string | null;
  tags: string[];
  is_featured: boolean;
  is_trending: boolean;
  is_new_arrival: boolean;
  is_active: boolean;
  view_count: number;
  whatsapp_inquiry_count: number;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  banner_type: "hero" | "promotional" | "category";
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  store_name: string;
  store_tagline: string;
  whatsapp_number: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  store_city: string;
  store_hours: string;
  instagram_url: string;
  facebook_url: string;
  seo_title: string;
  seo_description: string;
  logo_url: string;
  favicon_url: string;
  footer_text: string;
  google_maps_embed: string;
  announcement_bar: string;
}

export interface Analytics {
  id: string;
  product_id: string;
  event_type: "view" | "whatsapp_inquiry" | "reserve_inquiry";
  created_at: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}
