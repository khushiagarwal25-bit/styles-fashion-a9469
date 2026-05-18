-- ============================================================
-- STYLES FASHION CATALOG - COMPLETE DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10, 2),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  material TEXT,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  whatsapp_inquiry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: banners
-- ============================================================
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  banner_type TEXT DEFAULT 'hero' CHECK (banner_type IN ('hero', 'promotional', 'category')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: settings (Key-Value store for site configuration)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: analytics (track product views & inquiries)
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'whatsapp_inquiry', 'reserve_inquiry')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_trending ON products(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival) WHERE is_new_arrival = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_analytics_product ON analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(event_type);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- PUBLIC read policies (anyone can read active content)
CREATE POLICY "Public can read active categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active banners" ON banners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Public can insert analytics" ON analytics
  FOR INSERT WITH CHECK (true);

-- ADMIN policies (authenticated users can do everything)
CREATE POLICY "Authenticated users full access to categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to banners" ON banners
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to settings" ON settings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to analytics" ON analytics
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- DEFAULT SETTINGS DATA
-- ============================================================
INSERT INTO settings (key, value) VALUES
  ('store_name', 'Styles'),
  ('store_tagline', 'Elevate Your Style'),
  ('whatsapp_number', '+919999999999'),
  ('store_email', 'hello@styles.com'),
  ('store_phone', '+91 99999 99999'),
  ('store_address', '123 Fashion Street, Mumbai, Maharashtra 400001'),
  ('store_city', 'Mumbai'),
  ('store_hours', 'Mon–Sat: 10am–9pm  |  Sun: 11am–8pm'),
  ('instagram_url', 'https://instagram.com/stylesfashion'),
  ('facebook_url', ''),
  ('seo_title', 'Styles — Premium Fashion Catalog'),
  ('seo_description', 'Discover the latest fashion trends at Styles. Shop our curated collection of premium clothing, accessories, and more.'),
  ('logo_url', ''),
  ('favicon_url', ''),
  ('footer_text', '© 2025 Styles. All rights reserved.'),
  ('google_maps_embed', ''),
  ('announcement_bar', 'Free alterations on all purchases above ₹2,000')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SAMPLE CATEGORIES
-- ============================================================
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Women', 'women', 'Explore our exclusive women''s collection', 1),
  ('Men', 'men', 'Premium menswear for every occasion', 2),
  ('Kids', 'kids', 'Stylish and comfortable clothing for kids', 3),
  ('Accessories', 'accessories', 'Complete your look with our accessories', 4),
  ('Sale', 'sale', 'Great deals on premium fashion', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STORAGE BUCKETS (Run these in Supabase Storage section)
-- Or via SQL:
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);

-- Storage policies (run after creating buckets)
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('product-images', 'banners', 'assets'));
-- CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id IN ('product-images', 'banners', 'assets'));
-- CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');
