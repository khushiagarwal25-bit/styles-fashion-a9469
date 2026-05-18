import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="page-container max-w-3xl">
        <h1 className="font-serif text-4xl font-medium text-stone-900 mb-2">Privacy Policy</h1>
        <p className="text-stone-400 text-sm mb-12">Last updated: January 2025</p>

        <div className="prose prose-stone max-w-none space-y-8">
          {[
            {
              title: "1. Information We Collect",
              content:
                "We collect information you provide directly to us, such as when you contact us via WhatsApp, email, or in person at our store. This may include your name, phone number, email address, and product preferences.",
            },
            {
              title: "2. How We Use Your Information",
              content:
                "We use your information to respond to inquiries, provide product recommendations, notify you about promotions, and improve our services. We do not sell your personal data to third parties.",
            },
            {
              title: "3. WhatsApp Communication",
              content:
                "When you contact us via WhatsApp, your messages are subject to WhatsApp's privacy policy. We use WhatsApp solely for customer communication regarding products and inquiries.",
            },
            {
              title: "4. Cookies & Analytics",
              content:
                "Our website uses cookies to understand how visitors use our site and to improve your experience. You can disable cookies in your browser settings, though some features may not function properly.",
            },
            {
              title: "5. Data Security",
              content:
                "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
            },
            {
              title: "6. Contact Us",
              content:
                "If you have questions about this Privacy Policy or how we handle your data, please contact us via WhatsApp or email provided on our Contact page.",
            },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="font-medium text-stone-900 text-lg mb-3">{section.title}</h2>
              <p className="text-stone-600 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
