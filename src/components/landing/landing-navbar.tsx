"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#who-its-for", label: "Who It's For" },
  { href: "#products", label: "Products" },
  { href: "#pricing", label: "Pricing" },
  { href: "#consulting", label: "Consulting" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-[38px] z-[999] bg-[rgba(26,26,46,0.92)] backdrop-blur-[20px] backdrop-saturate-[180%] border-b border-white/[0.06] px-5 sm:px-10 py-3 flex justify-between items-center">
      <a href="#" className="flex items-center gap-2.5">
        <Image
          src="/brand/au-logo-white.png"
          alt="Advertising Unplugged"
          width={150}
          height={36}
          className="h-9 w-auto"
          priority
        />
      </a>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-7">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-white/55 text-[13px] font-medium hover:text-[var(--teal)] transition-colors relative group"
          >
            {link.label}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[linear-gradient(90deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] group-hover:w-full transition-all duration-300" />
          </a>
        ))}
        <a
          href="#pricing"
          className="bg-[var(--teal)] text-[var(--navy)] px-[22px] py-[9px] rounded-[10px] font-bold text-[13px] shadow-[0_2px_12px_rgba(42,185,176,0.35)] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(42,185,176,0.35)] transition-all"
        >
          Get Started
        </a>
      </div>

      {/* Mobile toggle */}
      <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-[var(--navy)] border-t border-white/10 md:hidden">
          <div className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-white/60 text-sm font-medium py-2 px-3 rounded-md hover:bg-white/5 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="bg-[var(--teal)] text-[var(--navy)] text-sm font-bold py-2.5 px-4 rounded-lg text-center mt-2"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
