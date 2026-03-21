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
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors opacity-50 cursor-not-allowed"
            title="Export (coming soon)"
          >
            <FileDown className="w-4 h-4" />
            Export
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
