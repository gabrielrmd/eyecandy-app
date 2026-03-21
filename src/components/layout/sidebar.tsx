"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LayoutTemplate,
  Brain,
  Trophy,
  Users,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/strategy/new", label: "Strategy Builder", icon: Brain },
  { href: "/challenge", label: "Growth Challenge", icon: Trophy },
  { href: "/community", label: "Community", icon: Users },
  { href: "/account", label: "Settings", icon: Settings },
  { href: "/account/billing", label: "Billing", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-16 hidden h-[calc(100vh-4rem)] flex-shrink-0 border-r border-border bg-white transition-all duration-200 md:block",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-full flex-col justify-between p-3">
        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--coral)]/10 text-[var(--coral)]"
                    : "text-[var(--charcoal)] hover:bg-muted"
                )}
                title={collapsed ? link.label : undefined}
              >
                <link.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
