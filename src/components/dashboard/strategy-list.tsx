"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { deleteStrategyProject } from "@/app/actions/strategy";

interface Strategy {
  id: string;
  title: string;
  status: string;
  created_at: string;
  generated_strategy_id: string | null;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function StrategyList({
  strategies,
}: {
  strategies: Strategy[];
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [items, setItems] = useState(strategies);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}" strategy? This cannot be undone.`)) return;

    setDeleting(id);
    const result = await deleteStrategyProject(id);
    if (result.error) {
      alert(`Failed to delete: ${result.error}`);
      setDeleting(null);
    } else {
      setItems((prev) => prev.filter((s) => s.id !== id));
      setDeleting(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
        <Brain className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 text-sm text-gray-400">
          No strategies yet. Create your first one!
        </p>
        <Link
          href="/strategy/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--coral)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Create Strategy <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="divide-y divide-gray-100">
        {items.map((strategy) => {
          const isCompleted =
            strategy.status === "completed" ||
            strategy.generated_strategy_id != null;
          const isFailed = strategy.status === "failed";
          const isDeleting = deleting === strategy.id;

          return (
            <div
              key={strategy.id}
              className={`flex items-center gap-4 px-6 py-4 ${isDeleting ? "opacity-50" : ""}`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isCompleted
                    ? "bg-emerald-100"
                    : isFailed
                      ? "bg-red-100"
                      : "bg-indigo-100"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : isFailed ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <Brain className="h-5 w-5 text-indigo-600" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">
                  {strategy.title || "Untitled Strategy"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700"
                        : isFailed
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {isCompleted ? "Completed" : isFailed ? "Failed" : "In Progress"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(new Date(strategy.created_at))}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <Link
                    href={`/strategy/${strategy.id}/result`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                ) : !isFailed ? (
                  <Link
                    href={`/strategy/${strategy.id}/questionnaire`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Continue
                  </Link>
                ) : null}

                <button
                  onClick={() => handleDelete(strategy.id, strategy.title)}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  title="Delete strategy"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
