import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Product: [
    { label: "Templates", href: "/templates" },
    { label: "Strategy Builder", href: "/strategy/new" },
    { label: "Growth Challenge", href: "/challenge" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Community", href: "/community" },
    { label: "Contact", href: "mailto:gabriel@marketingdepartment.ro" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/legal/terms" },
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Cookie Policy", href: "/legal/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-[var(--navy)] text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/brand/au-logo-white.png"
              alt="Advertising Unplugged"
              width={160}
              height={40}
              className="mb-4 h-10 w-auto"
            />
            <p className="text-sm leading-relaxed">
              Clarity Over Noise.
              <br />
              Purpose Beyond Profit.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-sm font-semibold text-white">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} Advertising Unplugged. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
