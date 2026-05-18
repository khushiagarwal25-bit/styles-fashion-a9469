import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { getSiteSettings } from "@/lib/actions/settings";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: {
      default: settings.seo_title || "Styles — Premium Fashion Catalog",
      template: `%s | ${settings.store_name || "Styles"}`,
    },
    description:
      settings.seo_description ||
      "Discover the latest fashion trends at Styles.",
    keywords: [
      "fashion",
      "clothing",
      "style",
      "premium fashion",
      settings.store_city || "Mumbai",
    ],
    openGraph: {
      title: settings.seo_title || "Styles — Premium Fashion Catalog",
      description: settings.seo_description || "",
      type: "website",
      locale: "en_IN",
      siteName: settings.store_name || "Styles",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seo_title || "Styles — Premium Fashion Catalog",
      description: settings.seo_description || "",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    icons: {
      icon: settings.favicon_url || "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white text-stone-900 antialiased">
        {settings.announcement_bar && (
          <div className="announcement-bar">
            {settings.announcement_bar}
          </div>
        )}
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#1c1917",
              color: "#fff",
              borderRadius: "0",
              fontSize: "13px",
              letterSpacing: "0.05em",
            },
          }}
        />
      </body>
    </html>
  );
}
