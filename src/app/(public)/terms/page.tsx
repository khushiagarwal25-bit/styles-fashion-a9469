import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="page-container max-w-3xl">
        <h1 className="font-serif text-4xl font-medium text-stone-900 mb-2">Terms & Conditions</h1>
        <p className="text-stone-400 text-sm mb-12">Last updated: January 2025</p>

        <div className="space-y-8">
          {[
            {
              title: "1. Acceptance of Terms",
              content:
                "By accessing and using the Styles website, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our website.",
            },
            {
              title: "2. Catalog & Product Information",
              content:
                "This website is a fashion catalog only. Product availability, prices, and details are subject to change. All prices are in Indian Rupees (INR) and are inclusive of applicable taxes.",
            },
            {
              title: "3. WhatsApp Inquiries",
              content:
                "Product inquiries made via WhatsApp are not confirmed orders. All purchases are completed in-store. We reserve the right to decline any inquiry at our discretion.",
            },
            {
              title: "4. Intellectual Property",
              content:
                "All content on this website, including images, text, logos, and designs, is the property of Styles and may not be reproduced without written permission.",
            },
            {
              title: "5. Limitation of Liability",
              content:
                "Styles shall not be liable for any indirect, incidental, or consequential damages arising from the use of this website or the inability to access it.",
            },
            {
              title: "6. Changes to Terms",
              content:
                "We reserve the right to modify these terms at any time. Continued use of the website after changes constitutes acceptance of the new terms.",
            },
            {
              title: "7. Governing Law",
              content:
                "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.",
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
