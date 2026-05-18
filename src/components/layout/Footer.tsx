import Link from "next/link";
import { Instagram, Facebook, Mail, Phone, MapPin, Clock } from "lucide-react";
import { SiteSettings } from "@/types";

interface FooterProps {
  settings: Partial<SiteSettings>;
}

export default function Footer({ settings }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-300">
      {/* Main Footer */}
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="font-serif text-3xl text-white font-medium tracking-wider mb-4">
              {settings.store_name || "Styles"}
            </h3>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              {settings.store_tagline || "Elevate Your Style"}
            </p>
            <div className="flex gap-4">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
              )}
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-medium tracking-[0.2em] uppercase mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Shop", href: "/shop" },
                { label: "Categories", href: "/categories" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white text-xs font-medium tracking-[0.2em] uppercase mb-5">
              Information
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms & Conditions", href: "/terms" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-xs font-medium tracking-[0.2em] uppercase mb-5">
              Visit Us
            </h4>
            <ul className="space-y-4">
              {settings.store_address && (
                <li className="flex gap-3 text-stone-400 text-sm">
                  <MapPin size={16} className="flex-shrink-0 mt-0.5 text-stone-500" />
                  <span className="leading-relaxed">{settings.store_address}</span>
                </li>
              )}
              {settings.store_hours && (
                <li className="flex gap-3 text-stone-400 text-sm">
                  <Clock size={16} className="flex-shrink-0 mt-0.5 text-stone-500" />
                  <span className="leading-relaxed">{settings.store_hours}</span>
                </li>
              )}
              {settings.store_phone && (
                <li className="flex gap-3 text-stone-400 text-sm">
                  <Phone size={16} className="flex-shrink-0 mt-0.5 text-stone-500" />
                  <a
                    href={`tel:${settings.store_phone}`}
                    className="hover:text-white transition-colors"
                  >
                    {settings.store_phone}
                  </a>
                </li>
              )}
              {settings.store_email && (
                <li className="flex gap-3 text-stone-400 text-sm">
                  <Mail size={16} className="flex-shrink-0 mt-0.5 text-stone-500" />
                  <a
                    href={`mailto:${settings.store_email}`}
                    className="hover:text-white transition-colors"
                  >
                    {settings.store_email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-stone-800">
        <div className="page-container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-stone-500 text-xs">
            {settings.footer_text || `© ${year} ${settings.store_name || "Styles"}. All rights reserved.`}
          </p>
          <p className="text-stone-600 text-xs">
            WhatsApp inquiries welcome
          </p>
        </div>
      </div>
    </footer>
  );
}
