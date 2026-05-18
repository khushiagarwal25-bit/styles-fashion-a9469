"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Phone, MessageCircle } from "lucide-react";
import { SiteSettings } from "@/types";

interface StoreInfoProps {
  settings: Partial<SiteSettings>;
}

export default function StoreInfo({ settings }: StoreInfoProps) {
  const cleanNumber = (settings.whatsapp_number || "").replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent("Hi Styles, I would like to visit your store.")}`;

  const infoCards = [
    {
      icon: MapPin,
      title: "Visit Us",
      content: settings.store_address || "Mumbai, Maharashtra",
    },
    {
      icon: Clock,
      title: "Store Hours",
      content: settings.store_hours || "Mon–Sat: 10am–9pm",
    },
    {
      icon: Phone,
      title: "Call Us",
      content: settings.store_phone || "",
      href: `tel:${settings.store_phone}`,
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      content: settings.whatsapp_number || "",
      href: whatsappUrl,
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Map / Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {settings.google_maps_embed ? (
              <div
                className="w-full h-72 md:h-96"
                dangerouslySetInnerHTML={{ __html: settings.google_maps_embed }}
              />
            ) : (
              <div className="w-full h-72 md:h-96 bg-stone-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={40} className="text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-400 text-sm">
                    {settings.store_address || "Mumbai, Maharashtra"}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-subheading text-stone-400 mb-3">Find Us</p>
            <h2 className="section-heading mb-8">
              Come Visit Our Store
            </h2>

            <div className="space-y-6">
              {infoCards.filter(c => c.content).map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-10 h-10 bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <card.icon size={18} className="text-stone-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium tracking-widest uppercase text-stone-400 mb-0.5">
                      {card.title}
                    </p>
                    {card.href ? (
                      <a
                        href={card.href}
                        target={card.href.startsWith("https") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-stone-900 text-sm font-medium hover:text-stone-600 transition-colors"
                      >
                        {card.content}
                      </a>
                    ) : (
                      <p className="text-stone-900 text-sm font-medium">{card.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp inline-flex"
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
