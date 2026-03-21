"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  LayoutTemplate,
  Brain,
  Trophy,
  Users,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/strategy/new", label: "Strategy Builder", icon: Brain },
  { href: "/challenge", label: "Growth Challenge", icon: Trophy },
  { href: "/community", label: "Community", icon: Users },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--navy)] text-white">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/brand/au-logo.png"
            alt="Advertising Unplugged"
            className="h-9 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10",
                pathname.startsWith(link.href)
                  ? "bg-white/15 text-white"
                  : "text-white/70"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-white/80 hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-[var(--coral)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--coral)]/90"
          >
            Start Free
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[var(--navy)] md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-white/80"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-[var(--coral)] px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
