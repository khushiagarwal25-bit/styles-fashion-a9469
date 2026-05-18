import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/actions/settings";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Styles. We love hearing from you.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return <ContactClient settings={settings} />;
}
