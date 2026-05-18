import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Styles — our story, values, and passion for fashion.",
};

async function getAboutSettings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .like("key", "about_%");

  if (!data || data.length === 0) return null;
  return data.reduce<Record<string, string>>(
    (acc, { key, value }) => ({ ...acc, [key]: value || "" }),
    {}
  );
}

const DEFAULTS = {
  about_hero_subheading: "Our Story",
  about_hero_heading: "Fashion That Tells Your Story",
  about_story_image: "",
  about_story_subheading: "Who We Are",
  about_story_heading: "Curated Fashion for the Modern Individual",
  about_story_para1:
    "Styles was born from a passion for clothing that goes beyond trends — fashion that speaks to who you are. We believe every piece of clothing is an opportunity for self-expression, and that's exactly what we curate for you.",
  about_story_para2:
    "Our team handpicks every item in our collection, ensuring quality, style, and comfort go hand-in-hand. From premium fabrics to thoughtful designs, every detail is considered so you don't have to think twice.",
  about_story_para3:
    "We're more than a store — we're your personal style destination. Visit us in store or reach us on WhatsApp to find exactly what you're looking for.",
  about_values_heading: "Our Values",
  about_val1_icon: "✦",
  about_val1_title: "Quality First",
  about_val1_desc: "Every piece is carefully selected for its craftsmanship, fabric quality, and lasting style.",
  about_val2_icon: "◈",
  about_val2_title: "Personal Style",
  about_val2_desc: "We believe fashion should be personal. Our collection caters to every taste and occasion.",
  about_val3_icon: "◉",
  about_val3_title: "Customer Love",
  about_val3_desc: "From first visit to final purchase, we provide a premium, personalized experience.",
  about_cta_heading: "Ready to Elevate Your Wardrobe?",
  about_cta_text: "Browse our latest collection or contact us directly on WhatsApp.",
};

export default async function AboutPage() {
  const dbSettings = await getAboutSettings();
  const s = { ...DEFAULTS, ...(dbSettings || {}) };

  const values = [
    { icon: s.about_val1_icon, title: s.about_val1_title, desc: s.about_val1_desc },
    { icon: s.about_val2_icon, title: s.about_val2_title, desc: s.about_val2_desc },
    { icon: s.about_val3_icon, title: s.about_val3_title, desc: s.about_val3_desc },
  ];

  const storyImage = s.about_story_image
    ? getImageUrl(s.about_story_image)
    : "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&q=85";

  return (
    <div className="py-16 md:py-24">
      <div className="page-container">
        {/* Hero */}
        <div className="text-center mb-20">
          {s.about_hero_subheading && (
            <p className="section-subheading text-stone-400 mb-3">{s.about_hero_subheading}</p>
          )}
          <h1 className="section-heading max-w-2xl mx-auto">{s.about_hero_heading}</h1>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative h-96 md:h-[500px] overflow-hidden">
            <Image
              src={storyImage}
              alt="About Styles"
              fill
              className="object-cover"
            />
          </div>
          <div>
            {s.about_story_subheading && (
              <p className="section-subheading text-stone-400 mb-3">{s.about_story_subheading}</p>
            )}
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-stone-900 mb-6 leading-tight">
              {s.about_story_heading}
            </h2>
            <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
              {s.about_story_para1 && <p>{s.about_story_para1}</p>}
              {s.about_story_para2 && <p>{s.about_story_para2}</p>}
              {s.about_story_para3 && <p>{s.about_story_para3}</p>}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-stone-50 px-8 py-16 mb-24">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-medium text-stone-900">{s.about_values_heading}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {values.map((v, i) => (
              v.title ? (
                <div key={i} className="text-center">
                  <p className="text-3xl mb-4 text-stone-400">{v.icon}</p>
                  <h3 className="font-medium text-stone-900 mb-2">{v.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ) : null
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-stone-900 mb-4">
            {s.about_cta_heading}
          </h2>
          <p className="text-stone-500 text-sm mb-8">{s.about_cta_text}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="btn-primary">
              Shop Collection
            </Link>
            <Link href="/contact" className="btn-outline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
