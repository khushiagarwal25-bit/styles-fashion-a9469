import { type ClassValue, clsx } from "clsx";
import { SiteSettings } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function calculateDiscount(original: number, current: number): number {
  return Math.round(((original - current) / original) * 100);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + "...";
}

export function buildWhatsAppUrl(
  phoneNumber: string,
  productName: string,
  price: number,
  productUrl: string
): string {
  const message = encodeURIComponent(
    `Hi Styles, I am interested in this product.\n\n*Product:* ${productName}\n*Price:* ${formatPrice(price)}\n*Link:* ${productUrl}`
  );
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanNumber}?text=${message}`;
}

export function buildReserveUrl(
  phoneNumber: string,
  productName: string
): string {
  const message = encodeURIComponent(
    `Hi Styles, I would like to reserve *${productName}* in store. Please let me know availability.`
  );
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanNumber}?text=${message}`;
}

export function settingsArrayToObject(
  settings: { key: string; value: string | null }[]
): Partial<SiteSettings> {
  return settings.reduce(
    (acc, { key, value }) => ({
      ...acc,
      [key]: value ?? "",
    }),
    {} as Partial<SiteSettings>
  );
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/images/placeholder.svg";
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`;
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
