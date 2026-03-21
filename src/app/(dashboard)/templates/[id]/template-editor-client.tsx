"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Lightbulb,
  Save,
  FileDown,
  FileSpreadsheet,
  CheckCircle2,
  ChevronRight,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { saveTemplateResponse } from "@/app/actions/templates";

interface TemplateField {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
}

interface TemplateSection {
  id: string;
  title: string;
  description: string;
  fields: TemplateField[];
}

interface TemplateData {
  id: string;
  name: string;
  number: number;
  category: string;
  description: string;
  instructions?: string;
  icon: string;
  tags: string[];
  estimatedTime: string;
  sections: TemplateSection[];
}

interface AiSuggestion {
  text: string;
  explanation: string;
  relevance_score: number;
}

interface Props {
  templateData: TemplateData;
  savedResponses: Record<string, string>;
}

export default function TemplateEditorClient({
  templateData,
  savedResponses,
}: Props) {
  const sections = templateData.sections;
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");
  const [formData, setFormData] = useState<Record<string, string>>(
    savedResponses
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [suggestingFieldKey, setSuggestingFieldKey] = useState<string | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<
    Record<string, AiSuggestion[]>
  >({});
  const [suggestLoading, setSuggestLoading] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSection = sections.find((s) => s.id === activeSection);

  // Composite key for form data: sectionId:fieldId to avoid collisions
  const fieldKey = (sectionId: string, fieldId: string) =>
    `${sectionId}:${fieldId}`;

  const totalFields = sections.reduce((sum, s) => sum + s.fields.length, 0);
  const filledFields = Object.values(formData).filter(
    (v) => v && v.trim() !== ""
  ).length;
  const progress = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  // Auto-save with debounce
  const performSave = useCallback(
    async (data: Record<string, string>) => {
      setSaveStatus("saving");
      try {
        await saveTemplateResponse(templateData.id, data);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("idle");
      }
    },
    [templateData.id]
  );

  useEffect(() => {
    if (filledFields === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      performSave(formData);
    }, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [formData, filledFields, performSave]);

  const updateField = (sectionId: string, fieldId: string, value: string) => {
    const key = fieldKey(sectionId, fieldId);
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAiSuggest = async (
    sectionId: string,
    field: TemplateField
  ) => {
    const key = fieldKey(sectionId, field.id);

    // Toggle off if already showing
    if (suggestingFieldKey === key) {
      setSuggestingFieldKey(null);
      return;
    }

    setSuggestingFieldKey(key);
    setSuggestLoading(true);

    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: field.helpText
            ? `${field.label} - ${field.helpText}`
            : field.label,
          question_type: field.type,
          current_answer: formData[key] ?? "",
          context: {
            template_name: templateData.name,
            section_title: currentSection?.title ?? "",
            category: templateData.category,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuggestions((prev) => ({
          ...prev,
          [key]: data.suggestions ?? [],
        }));
      }
    } catch {
      // Silently fail - suggestions are optional
    } finally {
      setSuggestLoading(false);
    }
  };

  const applySuggestion = (
    sectionId: string,
    fieldId: string,
    text: string
  ) => {
    const key = fieldKey(sectionId, fieldId);
    setFormData((prev) => ({ ...prev, [key]: text }));
    setSuggestingFieldKey(null);
  };

  if (!currentSection) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">
          This template has no sections defined yet.
        </p>
      </div>
    );
  }

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
            <h1 className="font-[family-name:var(--font-oswald)] text-lg font-semibold text-navy">
              {templateData.name}
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
            {sections.map((section, idx) => {
              const sectionFilled = section.fields.filter((f) => {
                const key = fieldKey(section.id, f.id);
                return formData[key]?.trim();
              }).length;
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
                  <span className="min-w-0 truncate">{section.title}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main form area */}
        <main className="min-w-0 flex-1">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-[family-name:var(--font-oswald)] text-xl font-semibold text-navy">
              {currentSection.title}
            </h2>
            {currentSection.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {currentSection.description}
              </p>
            )}

            <div className="mt-6 space-y-6">
              {currentSection.fields.map((field) => {
                const key = fieldKey(currentSection.id, field.id);
                const isShowingSuggestions = suggestingFieldKey === key;
                const fieldSuggestions = suggestions[key] ?? [];

                return (
                  <div key={field.id}>
                    <label
                      htmlFor={key}
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      {field.label}
                      {field.required && (
                        <span className="ml-1 text-coral">*</span>
                      )}
                    </label>
                    {field.helpText && (
                      <p className="mb-1.5 text-xs text-muted-foreground">
                        {field.helpText}
                      </p>
                    )}

                    <div className="relative">
                      {field.type === "textarea" ? (
                        <textarea
                          id={key}
                          rows={4}
                          placeholder={field.placeholder}
                          value={formData[key] ?? ""}
                          onChange={(e) =>
                            updateField(
                              currentSection.id,
                              field.id,
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                        />
                      ) : field.type === "select" ? (
                        <select
                          id={key}
                          value={formData[key] ?? ""}
                          onChange={(e) =>
                            updateField(
                              currentSection.id,
                              field.id,
                              e.target.value
                            )
                          }
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
                          id={key}
                          type="text"
                          placeholder={field.placeholder}
                          value={formData[key] ?? ""}
                          onChange={(e) =>
                            updateField(
                              currentSection.id,
                              field.id,
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                        />
                      )}

                      {/* AI suggestion button for text/textarea fields */}
                      {(field.type === "text" || field.type === "textarea") && (
                        <button
                          type="button"
                          title="Get AI suggestion"
                          onClick={() =>
                            handleAiSuggest(currentSection.id, field)
                          }
                          className={`absolute right-2 top-2 rounded-md p-1 transition-colors ${
                            isShowingSuggestions
                              ? "bg-amber-100 text-amber-600"
                              : "text-muted-foreground/50 hover:bg-amber-50 hover:text-amber-500"
                          }`}
                        >
                          <Lightbulb className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* AI Suggestions inline card */}
                    {isShowingSuggestions && (
                      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
                            <Sparkles className="h-3.5 w-3.5" />
                            AI Suggestions
                          </span>
                          <button
                            onClick={() => setSuggestingFieldKey(null)}
                            className="rounded p-0.5 text-amber-400 hover:text-amber-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {suggestLoading ? (
                          <div className="flex items-center gap-2 py-2 text-xs text-amber-600">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Generating suggestions...
                          </div>
                        ) : fieldSuggestions.length > 0 ? (
                          <div className="space-y-2">
                            {fieldSuggestions.map((s, i) => (
                              <button
                                key={i}
                                onClick={() =>
                                  applySuggestion(
                                    currentSection.id,
                                    field.id,
                                    s.text
                                  )
                                }
                                className="block w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-left transition-colors hover:border-amber-400 hover:bg-amber-50"
                              >
                                <p className="text-sm text-foreground">
                                  {s.text}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {s.explanation}
                                </p>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="py-1 text-xs text-amber-600">
                            No suggestions available. Try adding more context to
                            your other fields first.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Section navigation */}
            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <button
                onClick={() => {
                  const idx = sections.findIndex(
                    (s) => s.id === activeSection
                  );
                  if (idx > 0) setActiveSection(sections[idx - 1].id);
                }}
                disabled={
                  sections.findIndex((s) => s.id === activeSection) === 0
                }
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous Section
              </button>
              <button
                onClick={() => {
                  const idx = sections.findIndex(
                    (s) => s.id === activeSection
                  );
                  if (idx < sections.length - 1)
                    setActiveSection(sections[idx + 1].id);
                }}
                disabled={
                  sections.findIndex((s) => s.id === activeSection) ===
                  sections.length - 1
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
