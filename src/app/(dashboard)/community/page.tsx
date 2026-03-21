"use client";

import { useState } from "react";
import { Trophy, Star, ExternalLink, Search, Filter } from "lucide-react";

const wallOfFame = [
  {
    id: 1,
    name: "Ana Popescu",
    company: "TechStart SRL",
    industry: "SaaS",
    achievement: "Grew revenue 35% in 90 days",
    rating: 5,
    avatar: null,
    featured: true,
  },
  {
    id: 2,
    name: "Mihai Cristescu",
    company: "GreenBox",
    industry: "E-commerce",
    achievement: "3x lead generation in 60 days",
    rating: 5,
    avatar: null,
    featured: true,
  },
  {
    id: 3,
    name: "Cristina Ionescu",
    company: "DesignHub",
    industry: "Creative Agency",
    achievement: "35% conversion rate improvement",
    rating: 5,
    avatar: null,
    featured: false,
  },
  {
    id: 4,
    name: "Alex Dragomir",
    company: "FoodTech",
    industry: "Food & Beverage",
    achievement: "Launched in 3 new markets",
    rating: 4,
    avatar: null,
    featured: false,
  },
  {
    id: 5,
    name: "Elena Radu",
    company: "EduPlatform",
    industry: "EdTech",
    achievement: "2x customer retention",
    rating: 5,
    avatar: null,
    featured: false,
  },
  {
    id: 6,
    name: "Stefan Marin",
    company: "LogiTrack",
    industry: "Logistics",
    achievement: "Reduced CAC by 40%",
    rating: 4,
    avatar: null,
    featured: false,
  },
];

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = wallOfFame.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" || (filter === "featured" && member.featured);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--coral)]/10">
          <Trophy className="h-8 w-8 text-[var(--coral)]" />
        </div>
        <h1 className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-[var(--navy)]">
          Unplugged Circle
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
          Meet the entrepreneurs and marketers who are building remarkable brands
          with Advertising Unplugged.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-border bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--coral)]"
          />
        </div>
        <div className="flex gap-2">
          {["all", "featured"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-[var(--navy)] text-white"
                  : "bg-white border border-border hover:bg-muted"
              }`}
            >
              {f === "all" ? "All Members" : "Wall of Fame"}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((member) => (
          <div
            key={member.id}
            className="group rounded-xl border border-border bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1"
          >
            {member.featured && (
              <div className="mb-3 flex items-center gap-1">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-600">
                  Wall of Fame
                </span>
              </div>
            )}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-lg font-bold text-white">
                {member.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--navy)]">
                  {member.name}
                </h3>
                <p className="text-sm text-muted-foreground">{member.company}</p>
                <span className="mt-1 inline-block rounded-full bg-[var(--teal)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--teal)]">
                  {member.industry}
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-[var(--charcoal)]">
              {member.achievement}
            </p>
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < member.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Join CTA */}
      <div className="rounded-xl bg-[var(--navy)] p-8 text-center text-white">
        <h2 className="font-[family-name:var(--font-oswald)] text-2xl font-bold">
          Ready to Join the Circle?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-white/70">
          Complete the 90-Day Growth Challenge and earn your spot on the Wall of
          Fame.
        </p>
        <a
          href="/challenge"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--coral)] px-6 py-3 font-semibold text-white transition-colors hover:bg-[var(--coral)]/90"
        >
          Start the Challenge
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
