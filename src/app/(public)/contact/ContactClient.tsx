"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Mail, MessageCircle, Instagram } from "lucide-react";
import { SiteSettings } from "@/types";

interface ContactClientProps {
  settings: Partial<SiteSettings>;
}

export default function ContactClient({ settings }: ContactClientProps) {
  const cleanNumber = (settings.whatsapp_number || "").replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent("Hi Styles, I'd like to get in touch.")}`;

  return (
    <div className="py-16 md:py-24">
      <div className="page-container">
        <div className="text-center mb-16">
          <p className="section-subheading text-stone-400 mb-3">Get In Touch</p>
          <h1 className="section-heading">Contact Us</h1>
          <p className="text-stone-500 text-sm mt-3 max-w-md mx-auto">
            We&apos;d love to hear from you. Reach us on WhatsApp or visit our store.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {[
              {
                Icon: MapPin,
                title: "Visit Our Store",
                content: settings.store_address,
                href: undefined,
              },
              {
                Icon: Clock,
                title: "Store Hours",
                content: settings.store_hours,
                href: undefined,
              },
              {
                Icon: Phone,
                title: "Call Us",
                content: settings.store_phone,
                href: `tel:${settings.store_phone}`,
              },
              {
                Icon: Mail,
                title: "Email",
                content: settings.store_email,
                href: `mailto:${settings.store_email}`,
              },
              {
                Icon: Instagram,
                title: "Instagram",
                content: settings.instagram_url?.replace("https://", "") || "",
                href: settings.instagram_url,
              },
            ]
              .filter((i) => i.content)
              .map(({ Icon, title, content, href }) => (
                <div key={title} className="flex gap-4 items-start">
                  <div className="w-11 h-11 bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-stone-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium tracking-widest uppercase text-stone-400 mb-1">
                      {title}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("https") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-stone-800 text-sm hover:text-stone-600 transition-colors"
                      >
                        {content}
                      </a>
                    ) : (
                      <p className="text-stone-800 text-sm">{content}</p>
                    )}
                  </div>
                </div>
              ))}
          </motion.div>

          {/* WhatsApp CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-stone-50 p-10 flex flex-col items-center justify-center text-center"
          >
            <div className="w-20 h-20 bg-[#25D366] rounded-full flex items-center justify-center mb-6">
              <MessageCircle size={36} className="text-white" fill="white" />
            </div>
            <h2 className="font-serif text-2xl font-medium text-stone-900 mb-3">
              Chat on WhatsApp
            </h2>
            <p className="text-stone-500 text-sm mb-8 max-w-xs leading-relaxed">
              The quickest way to reach us. Ask about products, availability, prices, or anything else.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-base px-8 py-4"
            >
              <MessageCircle size={20} />
              Open WhatsApp
            </a>
            <p className="text-stone-400 text-xs mt-4">
              {settings.whatsapp_number}
            </p>
          </motion.div>
        </div>

        {/* Map */}
        {settings.google_maps_embed && (
          <div
            className="mt-16 w-full h-80 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: settings.google_maps_embed }}
          />
        )}
      </div>
    </div>
  );
}
