"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Save,
  CheckCircle2,
  Loader2,
  FileDown,
  LayoutDashboard,
} from "lucide-react";
import type { TemplateSchema, TemplateData, TemplateSheet } from "./types";
import SpreadsheetTable from "./spreadsheet-table";
import StructuredForm from "./structured-form";
import LiveDashboard from "./live-dashboard";

interface TemplateRendererProps {
  schema: TemplateSchema;
  initialData?: TemplateData;
  onSave: (data: TemplateData) => Promise<void>;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function TemplateRenderer({
  schema,
  initialData,
  onSave,
}: TemplateRendererProps) {
  // Filter out Welcome / How to Use tabs
  const visibleSheets = schema.sheets.filter(
    (s) =>
      !s.name.toLowerCase().includes("welcome") &&
      !s.name.toLowerCase().includes("how to use")
  );

  // Determine if there's a dashboard sheet
  const dashboardSheet = visibleSheets.find((s) => s.type === "summary");
  const workingSheets = visibleSheets.filter((s) => s.type !== "summary");

  const allTabs = dashboardSheet
    ? [dashboardSheet, ...workingSheets]
    : workingSheets;

  const [activeTabId, setActiveTabId] = useState(allTabs[0]?.id ?? "");
  const [data, setData] = useState<TemplateData>(() => {
    if (initialData && Object.keys(initialData).length > 0) return initialData;
    // Initialize default data structure
    const init: TemplateData = {};
    for (const sheet of schema.sheets) {
      if (sheet.type === "table") {
        init[sheet.id] = [];
      } else if (sheet.type === "form") {
        init[sheet.id] = [{}];
      } else {
        init[sheet.id] = [];
      }
    }
    return init;
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save debounced
  const scheduleSave = useCallback(
    (newData: TemplateData) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          await onSave(newData);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("error");
          setTimeout(() => setSaveStatus("idle"), 3000);
        }
      }, 2000);
    },
    [onSave]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleTableDataChange = useCallback(
    (sheetId: string, rows: Record<string, unknown>[]) => {
      setData((prev) => {
        const next = { ...prev, [sheetId]: rows };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const handleFormDataChange = useCallback(
    (sheetId: string, formData: Record<string, unknown>) => {
      setData((prev) => {
        const next = { ...prev, [sheetId]: [formData] };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const handleManualSave = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    try {
      await onSave(data);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [data, onSave]);

  const [exporting, setExporting] = useState(false);

  // ── PDF Export for schema-based templates ──
  const handleExportPDF = useCallback(() => {
    setExporting(true);
    const origin = window.location.origin;
    const logoWhite = `${origin}/brand/au-logo-white.png`;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const yearStr = new Date().getFullYear();

    // Build content HTML from all working sheets
    const sheetsHtml = workingSheets.map((sheet) => {
      let contentHtml = '';

      if (sheet.type === 'form' && sheet.fields) {
        const formData = ((data[sheet.id] ?? [{}]) as Record<string, unknown>[])[0] ?? {};
        // Group by sections if available
        if (sheet.sections && sheet.sections.length > 0) {
          contentHtml = sheet.sections.map(sec => {
            const fieldIds = sec.fieldIds || [];
            const fieldsHtml = fieldIds.map(fid => {
              const field = sheet.fields?.find(f => f.id === fid);
              if (!field) return '';
              const val = String(formData[fid] ?? '').trim();
              return `<div class="field"><p class="field-label">${field.label}</p><div class="field-value">${val || '<span class="empty">Not filled</span>'}</div></div>`;
            }).join('');
            return `<div class="form-section"><h3 class="form-section-title">${sec.title}</h3>${fieldsHtml}</div>`;
          }).join('');
        } else {
          contentHtml = (sheet.fields || []).map(field => {
            const val = String(formData[field.id] ?? '').trim();
            return `<div class="field"><p class="field-label">${field.label}</p><div class="field-value">${val || '<span class="empty">Not filled</span>'}</div></div>`;
          }).join('');
        }
      } else if (sheet.type === 'table' && sheet.columns) {
        const rows = (data[sheet.id] ?? []) as Record<string, unknown>[];
        if (rows.length > 0) {
          const headers = sheet.columns.map(c => `<th>${c.header}</th>`).join('');
          const bodyRows = rows.map(row =>
            '<tr>' + sheet.columns!.map(c => `<td>${String(row[c.id] ?? '')}</td>`).join('') + '</tr>'
          ).join('');
          contentHtml = `<table class="pdf-table"><thead><tr>${headers}</tr></thead><tbody>${bodyRows}</tbody></table>`;
        } else {
          contentHtml = '<p class="empty">No data entered</p>';
        }
      }

      return `<div class="sheet-block"><h2 class="sheet-title">${sheet.name}</h2>${sheet.description ? `<p class="sheet-desc">${sheet.description}</p>` : ''}${contentHtml}</div>`;
    }).join('');

    const w = window.open('', '_blank');
    if (!w) { setExporting(false); alert("Allow popups to export PDF"); return; }

    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${schema.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200;300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
@page { margin: 0; size: A4; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Inter, -apple-system, sans-serif; font-size: 13px; color: #2d2d2d; line-height: 1.7;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.cover { width: 100%; height: 100vh; background: #1A1A2E; color: #fff;
  display: flex; flex-direction: column; justify-content: space-between;
  page-break-after: always; position: relative; overflow: hidden; }
.cover::before { content: ''; position: absolute; top: -180px; right: -120px;
  width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(42,185,176,0.15) 0%, transparent 70%); }
.cover-top { position: relative; z-index: 1; padding: 56px 72px; }
.cover-logo { width: 180px; height: auto; }
.cover-center { position: relative; z-index: 1; flex: 1;
  display: flex; flex-direction: column; justify-content: center; padding: 0 72px; }
.cover-bar { width: 80px; height: 3px; margin-bottom: 28px;
  background: linear-gradient(90deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30); }
.cover-cat { font-family: Oswald, sans-serif; font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 6px; color: #2AB9B0; margin-bottom: 16px; }
.cover-title { font-family: Oswald, sans-serif; font-size: 48px; font-weight: 700;
  color: #fff; line-height: 1.1; max-width: 520px; margin-bottom: 16px; }
.cover-desc { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.8; max-width: 400px; }
.cover-bottom { position: relative; z-index: 1; padding: 0 72px 44px; }
.cover-gbar { width: 100%; height: 4px; margin-bottom: 24px;
  background: linear-gradient(90deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30); }
.cover-ft { display: flex; justify-content: space-between;
  font-family: Oswald, sans-serif; font-size: 9px; letter-spacing: 3px;
  text-transform: uppercase; color: rgba(255,255,255,0.25); }

.content-page { padding: 56px 64px 48px 64px; position: relative; min-height: 100vh; }
.sidebar { position: absolute; top: 0; left: 0; width: 52px; height: 100%;
  background: #1A1A2E; display: flex; flex-direction: column; align-items: center; padding-top: 56px; }
.sidebar-label { font-family: Oswald, sans-serif; font-size: 7px; font-weight: 500;
  color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 2px;
  writing-mode: vertical-rl; text-orientation: mixed; white-space: nowrap; }
.content-main { margin-left: 52px; padding: 0 0 0 28px; }
.content-head { display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 14px; margin-bottom: 28px; border-bottom: 2px solid #2AB9B0; }
.content-head-label { font-family: Oswald, sans-serif; font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 3px; color: #2AB9B0; }
.content-head-date { font-size: 9px; color: #bbb; }
.page-footer { position: absolute; bottom: 24px; left: 80px; right: 64px;
  display: flex; justify-content: space-between; font-size: 7px; color: #ccc;
  border-top: 1px solid #f0f0f0; padding-top: 10px; }
.page-footer-brand { text-transform: uppercase; letter-spacing: 1.5px; }

.sheet-block { padding-top: 14px; margin-bottom: 28px; }
.sheet-title { font-family: Oswald, sans-serif; font-size: 22px; font-weight: 700;
  color: #1A1A2E; text-transform: uppercase; letter-spacing: 1px;
  padding-bottom: 8px; border-bottom: 2px solid #e0e0e0; margin-bottom: 18px;
  padding-left: 14px; border-left: 4px solid #2AB9B0; break-after: avoid; page-break-after: avoid; }
.sheet-desc { font-size: 12px; color: #777; margin-bottom: 14px; font-style: italic; break-after: avoid; }
.form-section { padding-top: 12px; margin-bottom: 16px; break-inside: avoid; page-break-inside: avoid; }
.form-section-title { font-family: Oswald, sans-serif; font-size: 14px; font-weight: 600;
  color: #2AB9B0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;
  break-after: avoid; page-break-after: avoid; }
.field { padding: 10px 0; border-bottom: 1px solid #f0f0f0; break-inside: avoid; page-break-inside: avoid; }
.field:last-child { border-bottom: none; }
.field-label { font-family: Oswald, sans-serif; font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 1.5px; color: #2AB9B0; margin-bottom: 4px; }
.field-value { font-size: 13px; line-height: 1.75; color: #333; white-space: pre-wrap; }
.empty { color: #ccc; font-style: italic; font-size: 12px; }

.pdf-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 11px;
  page-break-inside: avoid; break-inside: avoid; }
.pdf-table th { background: #1A1A2E; color: #fff; font-family: Oswald, sans-serif;
  font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;
  padding: 12px 14px; text-align: left; }
.pdf-table td { padding: 10px 14px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6; }
.pdf-table tr:nth-child(even) td { background: #fafbfc; }
.pdf-table tr:last-child td { border-bottom: 2px solid #2AB9B0; }

.back-cover { page-break-before: always; height: 100vh; background: #1A1A2E;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  text-align: center; position: relative; }
.back-cover::before { content: ''; position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%); width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle, rgba(42,185,176,0.06) 0%, transparent 70%); }
.bc-logo { width: 160px; height: auto; margin-bottom: 40px; position: relative; z-index: 1; }
.bc-bar { width: 120px; height: 3px; margin-bottom: 32px; position: relative; z-index: 1;
  background: linear-gradient(90deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30); }
.bc-tag { font-family: Oswald, sans-serif; font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 6px; color: rgba(255,255,255,0.5);
  margin-bottom: 8px; position: relative; z-index: 1; }
.bc-mot { font-size: 15px; color: rgba(255,255,255,0.3); font-style: italic;
  position: relative; z-index: 1; }
.bc-url { font-family: Oswald, sans-serif; font-size: 10px; color: #2AB9B0;
  text-transform: uppercase; letter-spacing: 4px; margin-top: 48px; position: relative; z-index: 1; }
.bc-year { font-size: 9px; color: rgba(255,255,255,0.15); margin-top: 20px; position: relative; z-index: 1; }
</style></head><body>
<div class="cover">
  <div class="cover-top"><img src="${logoWhite}" class="cover-logo"/></div>
  <div class="cover-center">
    <div class="cover-bar"></div>
    <p class="cover-cat">${schema.category} Template</p>
    <h1 class="cover-title">${schema.name}</h1>
  </div>
  <div class="cover-bottom">
    <div class="cover-gbar"></div>
    <div class="cover-ft">
      <span>Confidential &mdash; ${yearStr}</span>
      <span>${dateStr}</span>
      <span>advertisingunplugged.com</span>
    </div>
  </div>
</div>
<div class="content-page">
  <div class="sidebar"><span class="sidebar-label">${schema.name}</span></div>
  <div class="content-main">
    <div class="content-head">
      <span class="content-head-label">${schema.name}</span>
      <span class="content-head-date">${dateStr}</span>
    </div>
    ${sheetsHtml}
  </div>
  <div class="page-footer">
    <span class="page-footer-brand">Advertising Unplugged &bull; ${schema.category} Template</span>
    <span>${dateStr}</span>
  </div>
</div>
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
    const imgP = images.map(img => img.complete ? Promise.resolve() : new Promise<void>(r => { img.onload = () => r(); img.onerror = () => r(); }));
    Promise.all([fontsReady, ...imgP])
      .then(() => setTimeout(() => { w.print(); setExporting(false); }, 500))
      .catch(() => setTimeout(() => { w.print(); setExporting(false); }, 5000));
    setTimeout(() => setExporting(false), 10000);
  }, [data, schema, workingSheets]);

  const activeSheet = allTabs.find((s) => s.id === activeTabId);

  const renderSheetContent = (sheet: TemplateSheet) => {
    if (sheet.type === "summary") {
      return <LiveDashboard templateData={data} sheets={schema.sheets} />;
    }

    if (sheet.type === "table" && sheet.columns) {
      return (
        <SpreadsheetTable
          columns={sheet.columns}
          data={(data[sheet.id] ?? []) as Record<string, unknown>[]}
          groupBy={sheet.groupBy}
          computedColumns={sheet.computedColumns}
          onDataChange={(rows) => handleTableDataChange(sheet.id, rows)}
        />
      );
    }

    if (sheet.type === "form" && sheet.fields) {
      const formData =
        ((data[sheet.id] ?? [{}]) as Record<string, unknown>[])[0] ?? {};
      return (
        <StructuredForm
          fields={sheet.fields}
          sections={sheet.sections}
          data={formData}
          onDataChange={(fd) => handleFormDataChange(sheet.id, fd)}
        />
      );
    }

    return (
      <div className="text-center py-16 text-slate-400">
        No content configured for this sheet.
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <div />
        <div className="flex items-center gap-3">
          {/* Save status indicator */}
          <div className="flex items-center gap-1.5 text-sm">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                <span className="text-slate-400">Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Saved</span>
              </>
            )}
            {saveStatus === "error" && (
              <span className="text-red-400">Save failed</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleManualSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors disabled:opacity-40"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {exporting ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center border-b border-slate-700 mb-6 overflow-x-auto">
        {allTabs.map((sheet) => (
          <button
            key={sheet.id}
            type="button"
            onClick={() => setActiveTabId(sheet.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTabId === sheet.id
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
            }`}
          >
            {sheet.type === "summary" && (
              <LayoutDashboard className="w-4 h-4" />
            )}
            {sheet.name}
          </button>
        ))}
      </div>

      {/* Active Sheet Content */}
      {activeSheet && (
        <div>
          {activeSheet.description && (
            <p className="text-sm text-slate-400 mb-4">
              {activeSheet.description}
            </p>
          )}
          {renderSheetContent(activeSheet)}
        </div>
      )}
    </div>
  );
}
