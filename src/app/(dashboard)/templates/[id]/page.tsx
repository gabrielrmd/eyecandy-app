"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Lightbulb,
  Save,
  FileDown,
  FileSpreadsheet,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  fields: { id: string; label: string; type: "text" | "textarea" | "select"; placeholder: string; options?: string[] }[];
}

const PLACEHOLDER_SECTIONS: Section[] = [
  {
    id: "overview",
    title: "Overview",
    fields: [
      { id: "project-name", label: "Project / Campaign Name", type: "text", placeholder: "Enter your project name" },
      { id: "objective", label: "Primary Objective", type: "textarea", placeholder: "What is the main goal of this initiative?" },
      { id: "timeline", label: "Timeline", type: "select", placeholder: "Select timeline", options: ["1 week", "2 weeks", "1 month", "3 months", "6 months", "12 months"] },
    ],
  },
  {
    id: "target-audience",
    title: "Target Audience",
    fields: [
      { id: "audience-primary", label: "Primary Audience", type: "textarea", placeholder: "Describe your primary target audience" },
      { id: "audience-secondary", label: "Secondary Audience", type: "textarea", placeholder: "Describe any secondary audiences" },
      { id: "pain-points", label: "Key Pain Points", type: "textarea", placeholder: "What problems does your audience face?" },
    ],
  },
  {
    id: "strategy",
    title: "Strategy & Approach",
    fields: [
      { id: "key-messages", label: "Key Messages", type: "textarea", placeholder: "What are your core messages?" },
      { id: "channels", label: "Channels", type: "textarea", placeholder: "Which channels will you use?" },
      { id: "budget", label: "Budget Range", type: "select", placeholder: "Select budget range", options: ["Under $1,000", "$1,000 - $5,000", "$5,000 - $10,000", "$10,000 - $25,000", "$25,000 - $50,000", "$50,000+"] },
    ],
  },
  {
    id: "metrics",
    title: "Metrics & KPIs",
    fields: [
      { id: "kpi-1", label: "Primary KPI", type: "text", placeholder: "e.g., Conversion rate" },
      { id: "kpi-2", label: "Secondary KPI", type: "text", placeholder: "e.g., Email open rate" },
      { id: "success-criteria", label: "Success Criteria", type: "textarea", placeholder: "What does success look like?" },
    ],
  },
  {
    id: "action-items",
    title: "Action Items",
    fields: [
      { id: "next-steps", label: "Immediate Next Steps", type: "textarea", placeholder: "List the first 3 actions to take" },
      { id: "owner", label: "Owner / Responsible", type: "text", placeholder: "Who is responsible?" },
      { id: "deadline", label: "Deadline", type: "text", placeholder: "When does this need to be done?" },
    ],
  },
];

export default function TemplateEditorPage() {
  const params = useParams();
  const templateId = params.id as string;
  const templateName = templateId
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const [activeSection, setActiveSection] = useState(PLACEHOLDER_SECTIONS[0].id);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const currentSection = PLACEHOLDER_SECTIONS.find((s) => s.id === activeSection)!;

  const totalFields = PLACEHOLDER_SECTIONS.reduce((sum, s) => sum + s.fields.length, 0);
  const filledFields = Object.values(formData).filter((v) => v.trim() !== "").length;
  const progress = Math.round((filledFields / totalFields) * 100);

  // Auto-save simulation
  useEffect(() => {
    if (filledFields === 0) return;
    setSaveStatus("saving");
    const timeout = setTimeout(() => setSaveStatus("saved"), 1200);
    return () => clearTimeout(timeout);
  }, [formData, filledFields]);

  const updateField = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/templates"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Templates
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-navy">
              {templateName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-save indicator */}
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {saveStatus === "saving" && (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Saved
                </>
              )}
              {saveStatus === "idle" && (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Auto-save on
                </>
              )}
            </span>

            {/* Export buttons */}
            <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
              <FileDown className="h-3.5 w-3.5" />
              PDF
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              XLSX
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-coral transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {progress}% complete
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Sidebar navigation */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-36 space-y-1">
            {PLACEHOLDER_SECTIONS.map((section, idx) => {
              const sectionFilled = section.fields.filter(
                (f) => formData[f.id]?.trim()
              ).length;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-coral/10 font-medium text-coral"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                      sectionFilled === section.fields.length
                        ? "bg-emerald-100 text-emerald-600"
                        : isActive
                          ? "bg-coral/20 text-coral"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {sectionFilled === section.fields.length ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  {section.title}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main form area */}
        <main className="min-w-0 flex-1">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-navy">
              {currentSection.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill in the fields below. AI suggestions are available for text
              fields.
            </p>

            <div className="mt-6 space-y-6">
              {currentSection.fields.map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    {field.label}
                  </label>

                  <div className="relative">
                    {field.type === "textarea" ? (
                      <textarea
                        id={field.id}
                        rows={4}
                        placeholder={field.placeholder}
                        value={formData[field.id] ?? ""}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                      />
                    ) : field.type === "select" ? (
                      <select
                        id={field.id}
                        value={formData[field.id] ?? ""}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        className="w-full appearance-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                      >
                        <option value="">{field.placeholder}</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={field.id}
                        type="text"
                        placeholder={field.placeholder}
                        value={formData[field.id] ?? ""}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                      />
                    )}

                    {/* AI suggestion button for text fields */}
                    {(field.type === "text" || field.type === "textarea") && (
                      <button
                        type="button"
                        title="Get AI suggestion"
                        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground/50 transition-colors hover:bg-amber-50 hover:text-amber-500"
                      >
                        <Lightbulb className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Section navigation */}
            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <button
                onClick={() => {
                  const idx = PLACEHOLDER_SECTIONS.findIndex(
                    (s) => s.id === activeSection
                  );
                  if (idx > 0)
                    setActiveSection(PLACEHOLDER_SECTIONS[idx - 1].id);
                }}
                disabled={
                  PLACEHOLDER_SECTIONS.findIndex(
                    (s) => s.id === activeSection
                  ) === 0
                }
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous Section
              </button>
              <button
                onClick={() => {
                  const idx = PLACEHOLDER_SECTIONS.findIndex(
                    (s) => s.id === activeSection
                  );
                  if (idx < PLACEHOLDER_SECTIONS.length - 1)
                    setActiveSection(PLACEHOLDER_SECTIONS[idx + 1].id);
                }}
                disabled={
                  PLACEHOLDER_SECTIONS.findIndex(
                    (s) => s.id === activeSection
                  ) ===
                  PLACEHOLDER_SECTIONS.length - 1
                }
                className="rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next Section
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
