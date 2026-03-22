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
  const [exporting, setExporting] = useState(false);
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

  // ── Template PDF Export ──────────────────────────────────────────
  const handleExportPDF = () => {
    setExporting(true);
    const origin = window.location.origin;
    const logoWhite = `${origin}/brand/au-logo-white.png`;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const yearStr = new Date().getFullYear();

    // Build section HTML from form data
    const sectionsHtml = sections.map((section) => {
      const fieldsHtml = section.fields.map((field) => {
        const key = fieldKey(section.id, field.id);
        const value = formData[key]?.trim() || '';
        const displayValue = value || '<span class="empty">Not filled</span>';
        return `
          <div class="field">
            <p class="field-label">${field.label}</p>
            <div class="field-value">${displayValue}</div>
          </div>`;
      }).join('');

      return `
        <div class="section-block">
          <h2 class="section-title">${section.title}</h2>
          ${section.description ? `<p class="section-desc">${section.description}</p>` : ''}
          <div class="fields">${fieldsHtml}</div>
        </div>`;
    }).join('');

    const w = window.open('', '_blank');
    if (!w) { setExporting(false); alert("Allow popups to export PDF"); return; }

    w.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${templateData.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200;300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
@page { margin: 0; size: A4; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: Inter, -apple-system, sans-serif;
  font-size: 13px; color: #2d2d2d; line-height: 1.7;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}

/* Cover */
.cover {
  width: 100%; height: 100vh; background: #1A1A2E; color: #fff;
  display: flex; flex-direction: column; justify-content: space-between;
  page-break-after: always; position: relative; overflow: hidden;
}
.cover::before {
  content: ''; position: absolute; top: -180px; right: -120px;
  width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(42,185,176,0.15) 0%, transparent 70%);
}
.cover-top { position: relative; z-index: 1; padding: 56px 72px; }
.cover-logo { width: 180px; height: auto; }
.cover-center {
  position: relative; z-index: 1; flex: 1;
  display: flex; flex-direction: column; justify-content: center; padding: 0 72px;
}
.cover-bar { width: 80px; height: 3px; margin-bottom: 28px;
  background: linear-gradient(90deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30); }
.cover-category {
  font-family: Oswald, sans-serif; font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 6px; color: #2AB9B0; margin-bottom: 16px;
}
.cover-title {
  font-family: Oswald, sans-serif; font-size: 48px; font-weight: 700;
  color: #fff; line-height: 1.1; max-width: 520px; margin-bottom: 16px;
}
.cover-desc { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.8; max-width: 400px; }
.cover-bottom { position: relative; z-index: 1; padding: 0 72px 44px; }
.cover-gradient-bar { width: 100%; height: 4px; margin-bottom: 24px;
  background: linear-gradient(90deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30); }
.cover-ft {
  display: flex; justify-content: space-between;
  font-family: Oswald, sans-serif; font-size: 9px; letter-spacing: 3px;
  text-transform: uppercase; color: rgba(255,255,255,0.25);
}

/* Content pages */
.content-page {
  padding: 56px 64px 48px 64px; position: relative; min-height: 100vh;
}
.content-page .sidebar {
  position: absolute; top: 0; left: 0; width: 52px; height: 100%;
  background: #1A1A2E; display: flex; flex-direction: column; align-items: center; padding-top: 56px;
}
.sidebar-label {
  font-family: Oswald, sans-serif; font-size: 7px; font-weight: 500;
  color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 2px;
  writing-mode: vertical-rl; text-orientation: mixed; white-space: nowrap;
}
.content-main { margin-left: 52px; padding: 0 0 0 28px; }
.content-head {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 14px; margin-bottom: 28px; border-bottom: 2px solid #2AB9B0;
}
.content-head-label {
  font-family: Oswald, sans-serif; font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 3px; color: #2AB9B0;
}
.content-head-date { font-size: 9px; color: #bbb; }
.page-footer {
  position: absolute; bottom: 24px; left: 80px; right: 64px;
  display: flex; justify-content: space-between;
  font-size: 7px; color: #ccc; border-top: 1px solid #f0f0f0; padding-top: 10px;
}
.page-footer-brand { text-transform: uppercase; letter-spacing: 1.5px; }

/* Section blocks */
.section-block {
  padding-top: 14px; margin-bottom: 24px;
  break-inside: avoid; page-break-inside: avoid;
}
.section-title {
  font-family: Oswald, sans-serif; font-size: 20px; font-weight: 700;
  color: #1A1A2E; text-transform: uppercase; letter-spacing: 1px;
  padding-bottom: 8px; border-bottom: 2px solid #e0e0e0; margin-bottom: 20px;
  padding-left: 14px; border-left: 4px solid #2AB9B0;
}
.section-desc {
  font-size: 12px; color: #777; margin-bottom: 16px; font-style: italic;
}

/* Fields */
.fields { }
.field {
  padding: 12px 0; border-bottom: 1px solid #f0f0f0;
  break-inside: avoid; page-break-inside: avoid;
}
.field:last-child { border-bottom: none; }
.field-label {
  font-family: Oswald, sans-serif; font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 1.5px; color: #2AB9B0; margin-bottom: 6px;
}
.field-value {
  font-size: 13px; line-height: 1.75; color: #333;
  white-space: pre-wrap;
}
.empty { color: #ccc; font-style: italic; font-size: 12px; }

/* Back cover */
.back-cover {
  page-break-before: always; height: 100vh; background: #1A1A2E;
  display: flex; flex-direction: column; justify-content: center;
  align-items: center; text-align: center; position: relative;
}
.back-cover::before {
  content: ''; position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%); width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle, rgba(42,185,176,0.06) 0%, transparent 70%);
}
.bc-logo { width: 160px; height: auto; margin-bottom: 40px; position: relative; z-index: 1; }
.bc-bar { width: 120px; height: 3px; margin-bottom: 32px; position: relative; z-index: 1;
  background: linear-gradient(90deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30); }
.bc-tag { font-family: Oswald, sans-serif; font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 6px; color: rgba(255,255,255,0.5);
  margin-bottom: 8px; position: relative; z-index: 1; }
.bc-mot { font-size: 15px; color: rgba(255,255,255,0.3); font-style: italic;
  position: relative; z-index: 1; }
.bc-url { font-family: Oswald, sans-serif; font-size: 10px; color: #2AB9B0;
  text-transform: uppercase; letter-spacing: 4px; margin-top: 48px;
  position: relative; z-index: 1; }
.bc-year { font-size: 9px; color: rgba(255,255,255,0.15); margin-top: 20px;
  position: relative; z-index: 1; }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-top"><img src="${logoWhite}" class="cover-logo"/></div>
  <div class="cover-center">
    <div class="cover-bar"></div>
    <p class="cover-category">${templateData.category} Template</p>
    <h1 class="cover-title">${templateData.name}</h1>
    <p class="cover-desc">${templateData.description || ''}</p>
  </div>
  <div class="cover-bottom">
    <div class="cover-gradient-bar"></div>
    <div class="cover-ft">
      <span>Confidential &mdash; ${yearStr}</span>
      <span>${dateStr}</span>
      <span>advertisingunplugged.com</span>
    </div>
  </div>
</div>

<!-- CONTENT -->
<div class="content-page">
  <div class="sidebar"><span class="sidebar-label">${templateData.name}</span></div>
  <div class="content-main">
    <div class="content-head">
      <span class="content-head-label">${templateData.name}</span>
      <span class="content-head-date">${dateStr}</span>
    </div>
    ${sectionsHtml}
  </div>
  <div class="page-footer">
    <span class="page-footer-brand">Advertising Unplugged &bull; ${templateData.category} Template</span>
    <span>${dateStr}</span>
  </div>
</div>

<!-- BACK COVER -->
<div class="back-cover">
  <img src="${logoWhite}" class="bc-logo"/>
  <div class="bc-bar"></div>
  <p class="bc-tag">Advertising Unplugged</p>
  <p class="bc-mot">Clarity Over Noise. Purpose Beyond Profit.</p>
  <p class="bc-url">advertisingunplugged.com</p>
  <p class="bc-year">&copy; ${yearStr} All rights reserved.</p>
</div>

</body></html>`);

    w.document.close();

    const fontsReady = w.document.fonts ? w.document.fonts.ready : Promise.resolve();
    const images = Array.from(w.document.querySelectorAll('img'));
    const imagePromises = images.map(img =>
      img.complete ? Promise.resolve() : new Promise<void>(r => { img.onload = () => r(); img.onerror = () => r(); })
    );

    Promise.all([fontsReady, ...imagePromises])
      .then(() => setTimeout(() => { w.print(); setExporting(false); }, 500))
      .catch(() => setTimeout(() => { w.print(); setExporting(false); }, 5000));

    setTimeout(() => setExporting(false), 10000);
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
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
              {exporting ? "Exporting..." : "PDF"}
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
