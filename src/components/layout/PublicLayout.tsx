import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import { getSiteSettings } from "@/lib/actions/settings";
import { getCategories } from "@/lib/actions/categories";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getCategories(),
  ]);

  return (
    <>
      <Navbar
        storeName={settings.store_name || "Styles"}
        logoUrl={settings.logo_url || ""}
        categories={categories}
      />
      <main className="pt-16 md:pt-20">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton phoneNumber={settings.whatsapp_number || "+919999999999"} />
    </>
  );
}
