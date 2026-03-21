"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronRight, Star } from "lucide-react";
import type { FormField, FormSection } from "./types";

interface StructuredFormProps {
  fields: FormField[];
  sections?: FormSection[];
  data: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
}

function ScoreStars({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="transition-colors"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(n)}
        >
          <Star
            className={`w-6 h-6 ${
              (hover ?? value ?? 0) >= n
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-600"
            }`}
          />
        </button>
      ))}
      {value && (
        <span className="text-sm text-slate-400 ml-2">{value}/5</span>
      )}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const baseInput =
    "w-full bg-slate-800/50 text-slate-200 text-sm px-3 py-2.5 rounded-lg border border-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none transition-colors placeholder-slate-500";

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          className={`${baseInput} resize-y`}
          rows={3}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
      return (
        <input
          type="number"
          className={baseInput}
          value={value != null && value !== "" ? String(value) : ""}
          placeholder={field.placeholder}
          onChange={(e) => {
            const num = parseFloat(e.target.value);
            onChange(isNaN(num) ? "" : num);
          }}
        />
      );
    case "dropdown":
      return (
        <select
          className={baseInput}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" className="bg-slate-800">
            Select...
          </option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt} className="bg-slate-800">
              {opt}
            </option>
          ))}
        </select>
      );
    case "date":
      return (
        <input
          type="date"
          className={baseInput}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "url":
      return (
        <input
          type="url"
          className={baseInput}
          value={String(value ?? "")}
          placeholder={field.placeholder ?? "https://"}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "score":
      return (
        <ScoreStars value={value as number | undefined} onChange={onChange} />
      );
    default:
      return (
        <input
          type="text"
          className={baseInput}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

function SectionBlock({
  section,
  fields,
  data,
  onFieldChange,
}: {
  section: FormSection;
  fields: FormField[];
  data: Record<string, unknown>;
  onFieldChange: (fieldId: string, value: unknown) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const sectionFields = fields.filter((f) =>
    section.fieldIds.includes(f.id)
  );
  const filledCount = sectionFields.filter(
    (f) => data[f.id] != null && data[f.id] !== ""
  ).length;

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-3.5 bg-[#1A1A2E]/80 hover:bg-[#1A1A2E] transition-colors"
        onClick={() =>
          section.collapsible !== false && setCollapsed(!collapsed)
        }
      >
        <div className="flex items-center gap-3">
          {section.collapsible !== false &&
            (collapsed ? (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ))}
          <h3 className="font-[family-name:var(--font-oswald)] text-white text-base font-semibold">
            {section.title}
          </h3>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            filledCount === sectionFields.length && sectionFields.length > 0
              ? "bg-teal-500/20 text-teal-400"
              : "bg-slate-700 text-slate-400"
          }`}
        >
          {filledCount}/{sectionFields.length}
        </span>
      </button>

      {!collapsed && (
        <div className="px-5 py-4 space-y-5">
          {sectionFields.map((field) => (
            <div key={field.id} className="grid grid-cols-[200px_1fr] gap-4 items-start">
              <label className="text-sm text-slate-300 pt-2.5 font-medium">
                {field.label}
                {field.required && (
                  <span className="text-red-400 ml-0.5">*</span>
                )}
              </label>
              <div>
                <FieldInput
                  field={field}
                  value={data[field.id]}
                  onChange={(v) => onFieldChange(field.id, v)}
                />
                {field.hint && (
                  <p className="text-xs text-slate-500 mt-1.5">{field.hint}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StructuredForm({
  fields,
  sections,
  data,
  onDataChange,
}: StructuredFormProps) {
  const handleFieldChange = useCallback(
    (fieldId: string, value: unknown) => {
      onDataChange({ ...data, [fieldId]: value });
    },
    [data, onDataChange]
  );

  if (sections && sections.length > 0) {
    return (
      <div className="space-y-4">
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            fields={fields}
            data={data}
            onFieldChange={handleFieldChange}
          />
        ))}
      </div>
    );
  }

  // No sections - render all fields as a flat form
  return (
    <div className="border border-slate-700 rounded-lg px-5 py-4 space-y-5">
      {fields.map((field) => (
        <div key={field.id} className="grid grid-cols-[200px_1fr] gap-4 items-start">
          <label className="text-sm text-slate-300 pt-2.5 font-medium">
            {field.label}
            {field.required && (
              <span className="text-red-400 ml-0.5">*</span>
            )}
          </label>
          <div>
            <FieldInput
              field={field}
              value={data[field.id]}
              onChange={(v) => handleFieldChange(field.id, v)}
            />
            {field.hint && (
              <p className="text-xs text-slate-500 mt-1.5">{field.hint}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
