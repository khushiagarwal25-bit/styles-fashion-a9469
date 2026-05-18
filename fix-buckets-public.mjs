/**
 * Makes all 3 storage buckets public via direct SQL
 */
import https from "https";

const PROJECT_REF = "fbxafvtdhmrnjxgttsog";
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || ""; // pass via env var

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: "api.supabase.com",
      path,
      method,
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let raw = "";
      res.on("data", c => (raw += c));
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

async function runSQL(label, sql) {
  const res = await api("POST", `/v1/projects/${PROJECT_REF}/database/query`, { query: sql });
  if ([200, 201].includes(res.status)) {
    console.log(`✅ ${label}`);
  } else {
    console.log(`⚠️  ${label}: ${JSON.stringify(res.body)}`);
  }
  return res;
}

async function main() {
  console.log("\n=== Fixing Storage Buckets ===\n");

  // 1. Make all buckets public via SQL
  await runSQL("Make buckets public", `
    UPDATE storage.buckets
    SET public = true
    WHERE id IN ('product-images', 'banners', 'assets');
  `);

  // 2. Check current bucket state
  const check = await api("POST", `/v1/projects/${PROJECT_REF}/database/query`, {
    query: `SELECT id, name, public FROM storage.buckets WHERE id IN ('product-images', 'banners', 'assets');`
  });
  if (check.body && Array.isArray(check.body)) {
    console.log("\nBucket status:");
    check.body.forEach(b => console.log(`  ${b.public ? "🟢" : "🔴"} ${b.id} — public: ${b.public}`));
  }

  // 3. Clean + reset RLS policies
  console.log("\n=== Fixing Storage Policies ===\n");

  await runSQL("Drop old policies", `
    DO $$ DECLARE r RECORD; BEGIN
      FOR r IN SELECT policyname FROM pg_policies
        WHERE tablename = 'objects' AND schemaname = 'storage'
      LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
      END LOOP;
    END $$;
  `);

  await runSQL("Create public read policy", `
    CREATE POLICY "Public read all buckets" ON storage.objects
      FOR SELECT USING (bucket_id IN ('product-images', 'banners', 'assets'));
  `);

  await runSQL("Create upload policy", `
    CREATE POLICY "Authenticated upload" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id IN ('product-images', 'banners', 'assets')
        AND auth.role() = 'authenticated'
      );
  `);

  await runSQL("Create update policy", `
    CREATE POLICY "Authenticated update" ON storage.objects
      FOR UPDATE USING (
        bucket_id IN ('product-images', 'banners', 'assets')
        AND auth.role() = 'authenticated'
      );
  `);

  await runSQL("Create delete policy", `
    CREATE POLICY "Authenticated delete" ON storage.objects
      FOR DELETE USING (
        bucket_id IN ('product-images', 'banners', 'assets')
        AND auth.role() = 'authenticated'
      );
  `);

  console.log("\n✅ All done! Now refresh your admin panel and try uploading an image.\n");
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
