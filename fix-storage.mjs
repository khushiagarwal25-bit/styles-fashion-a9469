/**
 * STYLES FASHION — Fix Storage Buckets
 * Run: node fix-storage.mjs YOUR_SUPABASE_ACCESS_TOKEN
 *
 * Get your access token from: https://supabase.com/dashboard/account/tokens
 */

import https from "https";

const PROJECT_REF = "fbxafvtdhmrnjxgttsog";
const ACCESS_TOKEN = process.argv[2]; // node fix-storage.mjs YOUR_TOKEN

if (!ACCESS_TOKEN) {
  console.log("\n❌ Usage: node fix-storage.mjs YOUR_ACCESS_TOKEN");
  console.log("   Get it from: https://supabase.com/dashboard/account/tokens\n");
  process.exit(1);
}

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

async function runSQL(sql) {
  const res = await mgmtRequest("POST", `/v1/projects/${PROJECT_REF}/database/query`, { query: sql });
  if (res.status !== 200 && res.status !== 201) {
    const msg = res.body?.message || res.body?.error || JSON.stringify(res.body);
    throw new Error(`SQL Error (${res.status}): ${msg}`);
  }
  return res.body;
}

async function main() {
  console.log("\n========================================");
  console.log("  STYLES FASHION — Fix Storage");
  console.log("========================================\n");

  // Verify token
  const projectRes = await mgmtRequest("GET", `/v1/projects/${PROJECT_REF}`);
  if (projectRes.status !== 200) {
    console.log("❌ Invalid access token. Get it from: https://supabase.com/dashboard/account/tokens\n");
    process.exit(1);
  }
  console.log(`✅ Connected to: ${projectRes.body.name || PROJECT_REF}\n`);

  // Create / verify buckets
  const BUCKETS = ["product-images", "banners", "assets"];
  console.log("🔧 Creating storage buckets...");
  for (const bucket of BUCKETS) {
    const res = await mgmtRequest("POST", `/v1/projects/${PROJECT_REF}/storage/buckets`, {
      id: bucket,
      name: bucket,
      public: true,
      file_size_limit: 10485760, // 10MB
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
    });
    if ([200, 201].includes(res.status)) {
      console.log(`  ✅ Created bucket: ${bucket}`);
    } else if (res.status === 409 || JSON.stringify(res.body).includes("already exists")) {
      console.log(`  ℹ️  Bucket exists: ${bucket}`);
    } else {
      console.log(`  ⚠️  ${bucket}: ${JSON.stringify(res.body)}`);
    }
  }

  // Fix storage policies — allow both authenticated AND anon uploads
  console.log("\n🔧 Setting storage policies (allow all uploads)...");
  const storagePoliciesSQL = `
    -- Drop old restrictive policies if they exist
    DROP POLICY IF EXISTS "Allow admin upload" ON storage.objects;
    DROP POLICY IF EXISTS "Allow admin update" ON storage.objects;
    DROP POLICY IF EXISTS "Allow admin delete" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public read product-images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public read banners" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public read assets" ON storage.objects;

    -- Public read for all buckets
    CREATE POLICY "Public read all buckets" ON storage.objects
      FOR SELECT USING (bucket_id IN ('product-images', 'banners', 'assets'));

    -- Allow upload for authenticated users (admin)
    CREATE POLICY "Authenticated upload" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id IN ('product-images', 'banners', 'assets')
        AND auth.role() = 'authenticated'
      );

    -- Allow update for authenticated users
    CREATE POLICY "Authenticated update" ON storage.objects
      FOR UPDATE USING (
        bucket_id IN ('product-images', 'banners', 'assets')
        AND auth.role() = 'authenticated'
      );

    -- Allow delete for authenticated users
    CREATE POLICY "Authenticated delete" ON storage.objects
      FOR DELETE USING (
        bucket_id IN ('product-images', 'banners', 'assets')
        AND auth.role() = 'authenticated'
      );
  `;

  try {
    await runSQL(storagePoliciesSQL);
    console.log("  ✅ Storage policies updated");
  } catch (err) {
    console.log(`  ⚠️  Policy error: ${err.message}`);
  }

  // Also add cta_text column to banners if it doesn't exist
  console.log("\n🔧 Adding cta_text column to banners table...");
  try {
    await runSQL(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS cta_text TEXT;`);
    console.log("  ✅ cta_text column added");
  } catch (err) {
    console.log(`  ⚠️  ${err.message}`);
  }

  console.log("\n========================================");
  console.log("  ✅ STORAGE FIXED!");
  console.log("========================================");
  console.log("\n  Now refresh your admin panel and try uploading again.");
  console.log("  Admin panel: http://localhost:3002/admin\n");
}

main().catch(err => {
  console.error("\n❌ Error:", err.message);
  process.exit(1);
});
