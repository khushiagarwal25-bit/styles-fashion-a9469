"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { Category } from "@/types";

interface NavbarProps {
  storeName: string;
  logoUrl: string;
  categories: Category[];
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar({ storeName, logoUrl, categories }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shopDropdown, setShopDropdown] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-sm" : "bg-white"
      }`}
      style={{ top: "var(--announcement-height, 0px)" }}
    >
      <nav className="page-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            {logoUrl ? (
              <Image src={logoUrl} alt={storeName} width={120} height={40} className="h-8 w-auto object-contain" />
            ) : (
              <span className="font-serif text-2xl md:text-3xl font-semibold tracking-[0.15em] text-stone-900 uppercase">
                {storeName}
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              link.label === "Shop" ? (
                <div key={link.label} className="relative group">
                  <button
                    className={`flex items-center gap-1 text-xs font-medium tracking-widest uppercase transition-colors duration-200 ${
                      pathname.startsWith("/shop") || pathname.startsWith("/categories")
                        ? "text-stone-900"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                    onMouseEnter={() => setShopDropdown(true)}
                    onMouseLeave={() => setShopDropdown(false)}
                  >
                    {link.label}
                    <ChevronDown size={12} />
                  </button>
                  <AnimatePresence>
                    {shopDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 bg-white border border-stone-100 shadow-lg min-w-[160px] py-2"
                        onMouseEnter={() => setShopDropdown(true)}
                        onMouseLeave={() => setShopDropdown(false)}
                      >
                        <Link href="/shop" className="block px-4 py-2 text-xs tracking-wider uppercase text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors">
                          All Products
                        </Link>
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            className="block px-4 py-2 text-xs tracking-wider uppercase text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-xs font-medium tracking-widest uppercase transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-stone-900 border-b border-stone-900"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-stone-600 hover:text-stone-900 transition-colors p-1"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-stone-600 hover:text-stone-900 transition-colors p-1"
              aria-label="Menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-stone-100"
            >
              <form onSubmit={handleSearch} className="py-4 flex gap-3">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search products, styles, collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-sm border-b border-stone-300 pb-2 focus:outline-none focus:border-stone-900 bg-transparent placeholder-stone-400 transition-colors"
                />
                <button type="submit" className="text-xs font-medium tracking-widest uppercase text-stone-900 hover:text-stone-600 transition-colors">
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 top-0 z-40 bg-white flex flex-col pt-20"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-5 right-5 text-stone-600"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col px-8 py-6 gap-0">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={link.href}
                    className="block py-4 border-b border-stone-100 text-lg font-medium tracking-widest uppercase text-stone-700 hover:text-stone-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-6">
                <p className="text-xs text-stone-400 tracking-widest uppercase mb-3">Categories</p>
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    <Link
                      href={`/shop?category=${cat.slug}`}
                      className="block py-2.5 text-sm tracking-wider text-stone-500 hover:text-stone-900 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
