/**
 * STYLES FASHION — Automated Supabase Setup Script
 * Run: node setup.mjs YOUR_SUPABASE_ACCESS_TOKEN YOUR_ADMIN_EMAIL YOUR_ADMIN_PASSWORD
 *
 * Get your access token from: https://supabase.com/dashboard/account/tokens
 */

import https from "https";

const PROJECT_REF = "fbxafvtdhmrnjxgttsog";
const SUPABASE_URL = "https://fbxafvtdhmrnjxgttsog.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZieGFmdnRkaG1ybmp4Z3R0c29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzYyODAsImV4cCI6MjA5NDYxMjI4MH0.t1tXW1ZCBhBz9-2zVS8VyEhf8FLyRNRVRt-J8SqbW7I";

const ACCESS_TOKEN = process.argv[2];
const ADMIN_EMAIL   = process.argv[3];
const ADMIN_PASSWORD = process.argv[4];

if (!ACCESS_TOKEN || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.log("\n❌ Usage: node setup.mjs ACCESS_TOKEN ADMIN_EMAIL ADMIN_PASSWORD");
  console.log("\n   Example: node setup.mjs sbp_abc123... admin@gmail.com MyPass@123");
  console.log("\n   Get your ACCESS_TOKEN from: https://supabase.com/dashboard/account/tokens\n");
  process.exit(1);
}

// ─── helpers ───────────────────────────────────────────────────────────────
function mgmtRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: "api.supabase.com",
      path,
      method,
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

function projectRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: `${PROJECT_REF}.supabase.co`,
      path,
      method,
      headers: {
        "apikey": ANON_KEY,
        "Authorization": `Bearer ${token || ANON_KEY}`,
        "Content-Type": "application/json",
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runSQL(sql) {
  const res = await mgmtRequest("POST", `/v1/projects/${PROJECT_REF}/database/query`, { query: sql });
  if (res.status !== 200 && res.status !== 201) {
    const msg = res.body?.message || res.body?.error || JSON.stringify(res.body);
    throw new Error(`SQL Error (${res.status}): ${msg}`);
  }
  return res.body;
}

function log(msg)    { console.log(`  ✅ ${msg}`); }
function warn(msg)   { console.log(`  ⚠️  ${msg}`); }
function section(msg){ console.log(`\n🔧 ${msg}`); }

// ─── SQL SCHEMA ─────────────────────────────────────────────────────────────
const SCHEMA_STEPS = [
  {
    name: "Enable UUID extension",
    sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
  },
  {
    name: "Create categories table",
    sql: `CREATE TABLE IF NOT EXISTS categories (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image_url TEXT,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: "Create products table",
    sql: `CREATE TABLE IF NOT EXISTS products (
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
    );`
  },
  {
    name: "Create banners table",
    sql: `CREATE TABLE IF NOT EXISTS banners (
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
    );`
  },
  {
    name: "Create settings table",
    sql: `CREATE TABLE IF NOT EXISTS settings (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: "Create analytics table",
    sql: `CREATE TABLE IF NOT EXISTS analytics (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL CHECK (event_type IN ('view', 'whatsapp_inquiry', 'reserve_inquiry')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: "Create performance indexes",
    sql: `
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
      CREATE INDEX IF NOT EXISTS idx_products_trending ON products(is_trending) WHERE is_trending = true;
      CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival) WHERE is_new_arrival = true;
      CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
      CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
      CREATE INDEX IF NOT EXISTS idx_analytics_product ON analytics(product_id);
    `
  },
  {
    name: "Create updated_at trigger function",
    sql: `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ language 'plpgsql';
    `
  },
  {
    name: "Attach updated_at triggers",
    sql: `
      DROP TRIGGER IF EXISTS update_products_updated_at ON products;
      CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
      CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      DROP TRIGGER IF EXISTS update_banners_updated_at ON banners;
      CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
      CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `
  },
  {
    name: "Enable Row Level Security",
    sql: `
      ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE products ENABLE ROW LEVEL SECURITY;
      ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
      ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
    `
  },
  {
    name: "Create public read policies",
    sql: `
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read active categories') THEN
          CREATE POLICY "Public can read active categories" ON categories FOR SELECT USING (is_active = true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read active products') THEN
          CREATE POLICY "Public can read active products" ON products FOR SELECT USING (is_active = true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read active banners') THEN
          CREATE POLICY "Public can read active banners" ON banners FOR SELECT USING (is_active = true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read settings') THEN
          CREATE POLICY "Public can read settings" ON settings FOR SELECT USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can insert analytics') THEN
          CREATE POLICY "Public can insert analytics" ON analytics FOR INSERT WITH CHECK (true);
        END IF;
      END $$;
    `
  },
  {
    name: "Create admin (authenticated) policies",
    sql: `
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users full access to categories') THEN
          CREATE POLICY "Authenticated users full access to categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users full access to products') THEN
          CREATE POLICY "Authenticated users full access to products" ON products FOR ALL USING (auth.role() = 'authenticated');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users full access to banners') THEN
          CREATE POLICY "Authenticated users full access to banners" ON banners FOR ALL USING (auth.role() = 'authenticated');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users full access to settings') THEN
          CREATE POLICY "Authenticated users full access to settings" ON settings FOR ALL USING (auth.role() = 'authenticated');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users full access to analytics') THEN
          CREATE POLICY "Authenticated users full access to analytics" ON analytics FOR ALL USING (auth.role() = 'authenticated');
        END IF;
      END $$;
    `
  },
  {
    name: "Insert default settings",
    sql: `
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
    `
  },
  {
    name: "Insert default categories",
    sql: `
      INSERT INTO categories (name, slug, description, display_order) VALUES
        ('Women', 'women', 'Explore our exclusive women''s collection', 1),
        ('Men', 'men', 'Premium menswear for every occasion', 2),
        ('Kids', 'kids', 'Stylish and comfortable clothing for kids', 3),
        ('Accessories', 'accessories', 'Complete your look with our accessories', 4),
        ('Sale', 'sale', 'Great deals on premium fashion', 5)
      ON CONFLICT (slug) DO NOTHING;
    `
  },
];

// ─── STORAGE BUCKETS ────────────────────────────────────────────────────────
const BUCKETS = ["product-images", "banners", "assets"];

async function createBuckets() {
  section("Creating Storage Buckets");
  for (const bucket of BUCKETS) {
    const res = await mgmtRequest("POST", `/v1/projects/${PROJECT_REF}/storage/buckets`, {
      id: bucket,
      name: bucket,
      public: true,
    });
    if (res.status === 200 || res.status === 201) {
      log(`Created bucket: ${bucket}`);
    } else if (res.body?.error?.includes("already exists") || res.body?.message?.includes("already exists") || res.status === 409) {
      warn(`Bucket already exists: ${bucket}`);
    } else {
      warn(`Bucket ${bucket}: ${JSON.stringify(res.body)}`);
    }
  }
}

async function createStoragePolicies() {
  section("Setting Storage Policies (public read + admin upload)");
  const storagePoliciesSQL = `
    DO $$ BEGIN
      -- Public read for all 3 buckets
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read product-images' AND tablename = 'objects') THEN
        CREATE POLICY "Allow public read product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read banners' AND tablename = 'objects') THEN
        CREATE POLICY "Allow public read banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read assets' AND tablename = 'objects') THEN
        CREATE POLICY "Allow public read assets" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
      END IF;
      -- Admin upload
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin upload' AND tablename = 'objects') THEN
        CREATE POLICY "Allow admin upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin update' AND tablename = 'objects') THEN
        CREATE POLICY "Allow admin update" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin delete' AND tablename = 'objects') THEN
        CREATE POLICY "Allow admin delete" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');
      END IF;
    END $$;
  `;
  await runSQL(storagePoliciesSQL);
  log("Storage policies set");
}

// ─── ADMIN USER ─────────────────────────────────────────────────────────────
async function createAdminUser() {
  section(`Creating Admin User: ${ADMIN_EMAIL}`);
  const res = await mgmtRequest("POST", `/v1/projects/${PROJECT_REF}/auth/users`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });

  if (res.status === 200 || res.status === 201) {
    log(`Admin user created: ${ADMIN_EMAIL}`);
  } else if (res.body?.message?.includes("already been registered") || res.body?.message?.includes("already exists")) {
    warn(`User already exists: ${ADMIN_EMAIL}`);
  } else {
    warn(`User creation: ${JSON.stringify(res.body)}`);
  }
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n========================================");
  console.log("  STYLES FASHION — Supabase Setup");
  console.log("========================================");

  // 1. Verify token
  section("Verifying Access Token");
  const projectRes = await mgmtRequest("GET", `/v1/projects/${PROJECT_REF}`);
  if (projectRes.status !== 200) {
    console.log(`\n❌ Invalid access token or project not found (status ${projectRes.status})`);
    console.log("   Get your token from: https://supabase.com/dashboard/account/tokens\n");
    process.exit(1);
  }
  log(`Connected to project: ${projectRes.body.name || PROJECT_REF}`);

  // 2. Run schema
  section("Running Database Schema");
  for (const step of SCHEMA_STEPS) {
    try {
      await runSQL(step.sql);
      log(step.name);
    } catch (err) {
      warn(`${step.name}: ${err.message}`);
    }
  }

  // 3. Storage buckets
  await createBuckets();

  // 4. Storage policies
  await createStoragePolicies();

  // 5. Admin user
  await createAdminUser();

  // Done!
  console.log("\n========================================");
  console.log("  ✅ SETUP COMPLETE!");
  console.log("========================================");
  console.log("\n  Your website is ready. Next steps:");
  console.log(`\n  1. Double-click START.bat on your desktop`);
  console.log(`  2. Website opens at: http://localhost:3000`);
  console.log(`  3. Admin panel at:   http://localhost:3000/admin`);
  console.log(`  4. Admin login:      ${ADMIN_EMAIL}`);
  console.log(`  5. Admin password:   ${ADMIN_PASSWORD}`);
  console.log("\n========================================\n");
}

main().catch(err => {
  console.error("\n❌ Setup failed:", err.message);
  process.exit(1);
});
