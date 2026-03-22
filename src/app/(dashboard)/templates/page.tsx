"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AccessGate } from "@/components/access-gate";
import {
  Search,
  Target,
  FileText,
  Share2,
  BarChart3,
  Briefcase,
  TrendingUp,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import catalog from "@/data/templates/catalog.json";

const CATEGORIES = [
  "All",
  "Brand",
  "Content",
  "Channels",
  "Analytics",
  "Growth",
  "Research",
  "Strategy",
] as const;

const iconMap: Record<string, React.ReactNode> = {
  target: <Target className="h-5 w-5" />,
  "file-text": <FileText className="h-5 w-5" />,
  "share-2": <Share2 className="h-5 w-5" />,
  "bar-chart": <BarChart3 className="h-5 w-5" />,
  briefcase: <Briefcase className="h-5 w-5" />,
  "trending-up": <TrendingUp className="h-5 w-5" />,
  search: <Search className="h-5 w-5" />,
};

const categoryColors: Record<string, string> = {
  strategy: "bg-navy/10 text-navy",
  content: "bg-teal/10 text-teal",
  channels: "bg-coral/10 text-coral",
  analytics: "bg-purple-100 text-purple-700",
  brand: "bg-amber-100 text-amber-700",
  growth: "bg-emerald-100 text-emerald-700",
  research: "bg-blue-100 text-blue-700",
};

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    return catalog.templates.filter((t) => {
      const matchesSearch =
        search === "" ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        activeCategory === "All" ||
        t.category.toLowerCase() === activeCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <AccessGate requires="templates">
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-navy sm:text-4xl">
            Template Library
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {catalog.total_templates} marketing templates to execute your
            strategy
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-coral text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="mb-4 text-sm text-muted-foreground">
          Showing {filtered.length} template{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Template Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
            <p className="text-lg font-medium text-foreground">
              No templates found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((template) => (
              <div
                key={template.id}
                className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
              >
                {/* Icon + Category */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
                    {iconMap[template.icon] ?? (
                      <Layers className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      categoryColors[template.category] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {template.category}
                  </span>
                </div>

                {/* Name + Description */}
                <h3 className="font-[family-name:var(--font-oswald)] text-base font-semibold text-foreground">
                  {template.name}
                </h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>

                {/* Meta */}
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {template.estimatedTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" />
                    {template.fields_count} field
                    {template.fields_count !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* CTA */}
                <Link
                  href={`/templates/${template.id}`}
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy/90 group-hover:bg-coral"
                >
                  Open Template
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </AccessGate>
  );
}
