"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  FileText,
  Newspaper,
  Megaphone,
  Plus,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string | null;
  thumbnail_url: string | null;
  is_recommended: boolean;
}

interface Draft {
  id: string;
  name: string;
  subject: string | null;
  status: string;
  template_id: string | null;
  updated_at: string;
}

interface Props {
  recommendedTemplates: Template[];
  allTemplates: Template[];
  recentDrafts: Draft[];
  draftCount: number;
  userId: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  simple: <FileText className="h-8 w-8 text-blue-500" />,
  newsletter: <Newspaper className="h-8 w-8 text-emerald-500" />,
  promotion: <Megaphone className="h-8 w-8 text-orange-500" />,
  transactional: <Mail className="h-8 w-8 text-purple-500" />,
  custom: <Sparkles className="h-8 w-8 text-pink-500" />,
};

const categoryColors: Record<string, string> = {
  simple: "bg-blue-50 border-blue-100",
  newsletter: "bg-emerald-50 border-emerald-100",
  promotion: "bg-orange-50 border-orange-100",
  transactional: "bg-purple-50 border-purple-100",
  custom: "bg-pink-50 border-pink-100",
};

export default function MarketingEmailClient({
  recommendedTemplates,
  allTemplates,
  recentDrafts,
  draftCount,
  userId,
}: Props) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  const handleUseTemplate = async (templateId: string) => {
    setCreating(templateId);
    try {
      const supabase = createClient();

      // Fetch template content
      const { data: template } = await supabase
        .from("marketing_email_templates")
        .select("id, name, content_html, content_structure")
        .eq("id", templateId)
        .single();

      if (!template) return;

      // Create draft from template
      const { data: draft } = await supabase
        .from("marketing_email_drafts")
        .insert({
          user_id: userId,
          template_id: template.id,
          name: `${template.name} — ${new Date().toLocaleDateString()}`,
          content_html: template.content_html,
          content_structure: template.content_structure,
          status: "draft",
        })
        .select("id")
        .single();

      if (draft) {
        router.refresh();
      }
    } finally {
      setCreating(null);
    }
  };

  const handleStartFromScratch = async () => {
    setCreating("scratch");
    try {
      const supabase = createClient();
      const { data: draft } = await supabase
        .from("marketing_email_drafts")
        .insert({
          user_id: userId,
          template_id: null,
          name: `New Email — ${new Date().toLocaleDateString()}`,
          content_html: "",
          status: "draft",
        })
        .select("id")
        .single();

      if (draft) {
        router.refresh();
      }
    } finally {
      setCreating(null);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-600",
      scheduled: "bg-blue-50 text-blue-700",
      sending: "bg-amber-50 text-amber-700",
      sent: "bg-emerald-50 text-emerald-700",
      canceled: "bg-red-50 text-red-600",
      failed: "bg-red-50 text-red-700",
    };
    return (
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const templates = showAll ? allTemplates : recommendedTemplates;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--coral)]/10">
            <Mail className="h-8 w-8 text-[var(--coral)]" />
          </div>
          <h1 className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-[var(--navy)]">
            Marketing email
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-gray-500">
            Send personalized emails to connect to your audience and grow revenue
          </p>
        </div>

        {/* Template Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-oswald)] text-lg font-semibold text-[var(--navy)]">
              {showAll ? "All templates" : "Choose a recommended template to get started"}
            </h2>
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--coral)] hover:underline"
            >
              {showAll ? "Show recommended" : "View all templates"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`group relative overflow-hidden rounded-xl border p-6 transition-all hover:shadow-md ${
                  categoryColors[template.category] ?? "bg-white border-gray-200"
                }`}
              >
                <div className="mb-4">
                  {categoryIcons[template.category] ?? (
                    <FileText className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h3 className="mb-1 text-lg font-semibold text-[var(--navy)]">
                  {template.name}
                </h3>
                <p className="mb-6 text-sm text-gray-500">
                  {template.description ?? `A ${template.category} email template`}
                </p>
                <button
                  onClick={() => handleUseTemplate(template.id)}
                  disabled={creating !== null}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[var(--navy)] shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  {creating === template.id ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--coral)]" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Use template
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Start from scratch */}
        <div className="mb-10 text-center">
          <button
            onClick={handleStartFromScratch}
            disabled={creating !== null}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[var(--coral)] disabled:opacity-50"
          >
            {creating === "scratch" ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--coral)]" />
                Creating blank email...
              </>
            ) : (
              <>Or start from scratch</>
            )}
          </button>
        </div>

        {/* Recent Drafts */}
        {recentDrafts.length > 0 && (
          <div>
            <h2 className="mb-4 font-[family-name:var(--font-oswald)] text-lg font-semibold text-[var(--navy)]">
              Recent drafts
              {draftCount > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({draftCount})
                </span>
              )}
            </h2>
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="divide-y divide-gray-100">
                {recentDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {draft.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {new Date(draft.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    {statusBadge(draft.status)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
