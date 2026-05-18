# STYLES FASHION CATALOG — COMPLETE SETUP GUIDE
### Step-by-step guide for beginners (no coding knowledge needed)

---

## WHAT YOU NEED BEFORE STARTING

1. A computer with internet connection
2. [Node.js](https://nodejs.org) installed (download the "LTS" version)
3. A free [Supabase account](https://supabase.com)
4. A free [Vercel account](https://vercel.com) (for hosting)
5. A [GitHub account](https://github.com) (for deploying)

---

## STEP 1 — SET UP SUPABASE (Your Database)

### 1.1 Create a Supabase Project

1. Go to **https://supabase.com** and sign up for free
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: `styles-fashion`
   - **Database Password**: Choose a strong password (SAVE THIS!)
   - **Region**: Choose closest to you (e.g., Southeast Asia for India)
4. Click **"Create new project"** — wait 2 minutes

### 1.2 Get Your API Keys

1. In your Supabase project, click **"Settings"** (gear icon on left)
2. Click **"API"**
3. You will see:
   - **Project URL** → looks like `https://abcdefghijk.supabase.co`
   - **anon public key** → a long text starting with `eyJ...`
4. **COPY BOTH OF THESE** — you'll need them soon

### 1.3 Run the Database Schema

1. In Supabase, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase/schema.sql` from this project
4. Copy the entire content and paste it into the SQL editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see "Success" — your tables are now created!

### 1.4 Create Storage Buckets

1. In Supabase, click **"Storage"** (left sidebar)
2. Click **"New bucket"** and create these 3 buckets:
   - Name: `product-images` | ✅ Public bucket
   - Name: `banners` | ✅ Public bucket
   - Name: `assets` | ✅ Public bucket
3. For each bucket, click on it → go to **"Policies"** tab → click **"New Policy"** → choose "For full customization" and set:
   - Policy Name: `public-read`
   - Allowed operation: SELECT
   - Target roles: Leave empty (public)
   - Check expression: `true`
4. Add another policy for uploads:
   - Policy Name: `admin-upload`
   - Allowed operations: INSERT, UPDATE, DELETE
   - Target roles: `authenticated`
   - Check expression: `true`

### 1.5 Create Admin User

1. In Supabase, click **"Authentication"** (left sidebar)
2. Click **"Users"** tab
3. Click **"Invite user"** (or **"Add user"**)
4. Enter your email and a password
5. **This will be your admin login!**

---

## STEP 2 — SET UP THE PROJECT ON YOUR COMPUTER

### 2.1 Open the Project Folder

The project is already in the `styles-fashion` folder.

### 2.2 Create Environment File

1. In the `styles-fashion` folder, find the file `.env.local.example`
2. Make a **copy** of it and rename the copy to `.env.local`
3. Open `.env.local` in any text editor (Notepad works)
4. Replace the values:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Replace:
- `https://YOUR_PROJECT_ID.supabase.co` → your actual Supabase URL
- `your_anon_key_here` → your actual anon key

5. Save the file

### 2.3 Install Dependencies

1. Open **Command Prompt** (Windows) or **Terminal** (Mac)
2. Navigate to the styles-fashion folder:
   ```
   cd path/to/styles-fashion
   ```
3. Run:
   ```
   npm install
   ```
   Wait for it to finish (may take 2-3 minutes)

### 2.4 Start the Development Server

```
npm run dev
```

Open your browser and go to: **http://localhost:3000**

🎉 **Your website is now running locally!**

To access the admin panel: **http://localhost:3000/admin**

---

## STEP 3 — DEPLOY TO VERCEL (Put It Online)

### 3.1 Push to GitHub

1. Create a new repository on GitHub
2. Upload your `styles-fashion` folder to it

### 3.2 Deploy on Vercel

1. Go to **https://vercel.com** and sign in with GitHub
2. Click **"New Project"**
3. Import your GitHub repository
4. In the **"Environment Variables"** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - `NEXT_PUBLIC_SITE_URL` = your Vercel URL (you'll get this after first deploy, then redeploy)
5. Click **"Deploy"**

Wait 2-3 minutes. Your site is now live! 🚀

---

## HOW TO USE THE ADMIN PANEL

### Access Admin Panel
- URL: `https://yoursite.com/admin`
- Login with the email/password you created in Supabase

---

### HOW TO ADD PRODUCTS

1. Go to **Admin → Products**
2. Click **"Add Product"**
3. Fill in:
   - **Product Name**: e.g., "Floral Midi Dress"
   - **Price**: e.g., 1299
   - **Original Price**: e.g., 1999 (shows as strikethrough)
   - **Category**: Select from dropdown
   - **Description**: Describe the product
   - **Material**: e.g., "100% Cotton"
4. **Upload Images**:
   - Click the upload box
   - Select multiple photos from your computer
   - First image = main display image
5. **Sizes**: Click the size buttons (S, M, L, XL, etc.)
6. **Colors**: Type color name and press Enter (e.g., "Navy Blue")
7. **Tags**: Type tags and press Enter (e.g., "summer", "casual")
8. **Badges**:
   - ✅ Featured → shows in Featured section on homepage
   - ✅ Trending → shows in Trending section on homepage
   - ✅ New Arrival → shows in New Arrivals + gets "New" badge
9. **Visibility**: Toggle ON to make it visible to customers
10. Click **"Create Product"**

---

### HOW TO CHANGE WHATSAPP NUMBER

1. Go to **Admin → Settings**
2. Find **"WhatsApp Number"**
3. Type your number with country code: `+919999999999`
4. Click **"Save All Settings"**

That's it! All WhatsApp inquiry buttons on the website will now use your new number.

---

### HOW TO CHANGE LOGO / STORE NAME / FAVICON

1. Go to **Admin → Settings**
2. **Store Name**: Type your store name
3. **Logo**: Click "Upload Logo" → select your logo image (PNG with transparent background recommended)
4. **Favicon**: Click "Upload Favicon" → select 32×32 or 64×64 icon
5. Click **"Save All Settings"**

---

### HOW TO MANAGE HOMEPAGE BANNERS

1. Go to **Admin → Banners**
2. Click **"Add Banner"**
3. Upload a banner image (recommended size: 1600×900 pixels)
4. Select type:
   - **Hero Slider** → appears in the main homepage slider
   - **Promotional** → appears in the mid-page promotional section
5. Add title and subtitle text (optional)
6. Set a link URL (e.g., `/shop` or `/shop?category=women`)
7. Click **"Create Banner"**

---

### HOW TO MANAGE SEO

1. Go to **Admin → Settings**
2. Scroll to **"SEO & Meta Tags"**
3. **SEO Title**: What appears in Google search results (keep under 60 characters)
   - Example: "Styles — Premium Fashion Store in Mumbai"
4. **SEO Description**: Short description in Google results (keep under 160 characters)
   - Example: "Discover premium fashion at Styles. Browse women's, men's & kids clothing."
5. Click **"Save All Settings"**

---

### HOW TO ADD STORE LOCATION (Google Maps)

1. Go to **https://maps.google.com**
2. Search for your store address
3. Click **"Share"** → click **"Embed a map"** tab
4. Copy the `<iframe>` HTML code
5. Go to **Admin → Settings → Google Maps**
6. Paste the code there
7. Save

---

## PRODUCT IMAGE TIPS

- Use high-quality photos (minimum 800×1000 pixels)
- Show product from multiple angles (front, back, detail)
- Use white or neutral backgrounds for clean look
- The first uploaded image will be the main display image
- Upload 3-5 images per product for best results

---

## WHATSAPP INQUIRY FLOW

When a customer clicks **"WhatsApp Inquiry"** on a product:

1. WhatsApp opens on their phone/computer
2. A pre-written message appears:
   ```
   Hi Styles, I am interested in this product.
   
   Product: [Product Name]
   Price: ₹1,299
   Link: https://yoursite.com/product/floral-midi-dress
   ```
3. Customer just taps **Send**
4. You receive the inquiry on your WhatsApp

---

## TROUBLESHOOTING

**Q: The website shows a blank page or error**
→ Check that your `.env.local` file has the correct Supabase URL and key

**Q: Images are not uploading**
→ Make sure you created the 3 storage buckets in Supabase and set the policies

**Q: I can't log in to admin**
→ Make sure you created a user in Supabase Authentication

**Q: Products are not showing on the homepage**
→ Make sure you checked "Featured", "Trending", or "New Arrival" when creating products

**Q: WhatsApp number is wrong**
→ Go to Admin → Settings → update WhatsApp number → Save

---

## NEED HELP?

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs

---

Built with ❤️ using Next.js, TypeScript, Tailwind CSS, Framer Motion & Supabase
