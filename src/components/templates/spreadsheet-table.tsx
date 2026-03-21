"use client";

import { useState, useCallback, useMemo, useRef, useEffect, Fragment } from "react";
import { ChevronUp, ChevronDown, Plus, X } from "lucide-react";
import type { TableColumn, ComputedColumn } from "./types";

interface SpreadsheetTableProps {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  groupBy?: string;
  computedColumns?: ComputedColumn[];
  onDataChange: (data: Record<string, unknown>[]) => void;
}

function computeFormula(
  formula: string,
  row: Record<string, unknown>
): string | number {
  try {
    const fn = new Function("row", `return ${formula};`);
    return fn(row);
  } catch {
    return "";
  }
}

function ScoreSelector({
  value,
  min = 1,
  max = 5,
  colorScale,
  onChange,
}: {
  value: number | undefined;
  min?: number;
  max?: number;
  colorScale?: TableColumn["colorScale"];
  onChange: (v: number) => void;
}) {
  const range = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  function getColor(n: number): string {
    if (colorScale) {
      for (const r of colorScale.ranges) {
        if (n >= r.min && n <= r.max) return r.color;
      }
    }
    if (n <= 2) return "#ef4444";
    if (n === 3) return "#eab308";
    return "#22c55e";
  }

  return (
    <div className="flex gap-1">
      {range.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="w-7 h-7 rounded text-xs font-bold transition-all"
          style={{
            backgroundColor: value === n ? getColor(n) : "transparent",
            color: value === n ? "#fff" : "#94a3b8",
            border:
              value === n
                ? `2px solid ${getColor(n)}`
                : "2px solid #334155",
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function EditableCell({
  column,
  value,
  onChange,
}: {
  column: TableColumn;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const commitEdit = useCallback(() => {
    setEditing(false);
    if (column.type === "number" || column.type === "currency" || column.type === "percentage") {
      const num = parseFloat(draft);
      onChange(isNaN(num) ? "" : num);
    } else {
      onChange(draft);
    }
  }, [draft, column.type, onChange]);

  if (column.editable === false || column.formula) {
    return (
      <span className="text-slate-300 text-sm px-2 py-1 block truncate">
        {column.type === "currency" && value != null && value !== ""
          ? `\u20AC${Number(value).toLocaleString()}`
          : column.type === "percentage" && value != null && value !== ""
          ? `${value}%`
          : String(value ?? "")}
      </span>
    );
  }

  if (column.type === "score") {
    return (
      <ScoreSelector
        value={value as number | undefined}
        min={column.min}
        max={column.max}
        colorScale={column.colorScale}
        onChange={onChange}
      />
    );
  }

  if (column.type === "dropdown" || column.type === "status") {
    return (
      <select
        className="bg-transparent text-slate-200 text-sm w-full px-1 py-1 rounded border border-transparent hover:border-slate-600 focus:border-teal-500 focus:outline-none"
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" className="bg-slate-800">
          —
        </option>
        {(column.options ?? []).map((opt) => (
          <option key={opt} value={opt} className="bg-slate-800">
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (column.type === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-teal-500"
      />
    );
  }

  if (column.type === "textarea") {
    if (editing) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          className="bg-slate-800 text-slate-200 text-sm w-full px-2 py-1 rounded border border-teal-500 focus:outline-none resize-none"
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setEditing(false);
              setDraft(String(value ?? ""));
            }
          }}
        />
      );
    }
    return (
      <div
        className="text-slate-300 text-sm px-2 py-1 cursor-text min-h-[28px] truncate hover:bg-slate-700/50 rounded"
        onClick={() => {
          setDraft(String(value ?? ""));
          setEditing(true);
        }}
      >
        {String(value ?? "") || (
          <span className="text-slate-500">{column.placeholder ?? "Click to edit"}</span>
        )}
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex items-center">
        {column.type === "currency" && (
          <span className="text-slate-400 text-sm mr-1">&euro;</span>
        )}
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={
            column.type === "number" ||
            column.type === "currency" ||
            column.type === "percentage"
              ? "number"
              : column.type === "date"
              ? "date"
              : column.type === "url"
              ? "url"
              : "text"
          }
          className="bg-slate-800 text-slate-200 text-sm w-full px-2 py-1 rounded border border-teal-500 focus:outline-none"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") {
              setEditing(false);
              setDraft(String(value ?? ""));
            }
          }}
        />
        {column.type === "percentage" && (
          <span className="text-slate-400 text-sm ml-1">%</span>
        )}
      </div>
    );
  }

  const displayValue =
    column.type === "currency" && value != null && value !== ""
      ? `\u20AC${Number(value).toLocaleString()}`
      : column.type === "percentage" && value != null && value !== ""
      ? `${value}%`
      : String(value ?? "");

  return (
    <div
      className="text-slate-300 text-sm px-2 py-1 cursor-text min-h-[28px] truncate hover:bg-slate-700/50 rounded"
      onClick={() => {
        setDraft(String(value ?? ""));
        setEditing(true);
      }}
    >
      {displayValue || (
        <span className="text-slate-500">{column.placeholder ?? "Click to edit"}</span>
      )}
    </div>
  );
}

export default function SpreadsheetTable({
  columns,
  data,
  groupBy,
  computedColumns,
  onDataChange,
}: SpreadsheetTableProps) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const processedData = useMemo(() => {
    return data.map((row) => {
      const processed = { ...row };
      const formulaCols = columns.filter((c) => c.formula);
      for (const col of formulaCols) {
        processed[col.id] = computeFormula(col.formula!, processed);
      }
      if (computedColumns) {
        for (const cc of computedColumns) {
          processed[cc.columnId] = computeFormula(cc.formula, processed);
        }
      }
      return processed;
    });
  }, [data, columns, computedColumns]);

  const sortedData = useMemo(() => {
    if (!sortCol) return processedData;
    return [...processedData].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const sa = String(av);
      const sb = String(bv);
      return sortDir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
  }, [processedData, sortCol, sortDir]);

  const groupedData = useMemo(() => {
    if (!groupBy) return null;
    const groups: Record<string, { index: number; row: Record<string, unknown> }[]> = {};
    sortedData.forEach((row, index) => {
      const key = String(row[groupBy] ?? "Other");
      if (!groups[key]) groups[key] = [];
      groups[key].push({ index, row });
    });
    return groups;
  }, [sortedData, groupBy]);

  const handleCellChange = useCallback(
    (rowIndex: number, colId: string, value: unknown) => {
      const newData = [...data];
      const originalIndex = processedData.indexOf(sortedData[rowIndex]);
      const idx = originalIndex >= 0 ? originalIndex : rowIndex;
      newData[idx] = { ...newData[idx], [colId]: value };
      onDataChange(newData);
    },
    [data, processedData, sortedData, onDataChange]
  );

  const handleAddRow = useCallback(() => {
    const newRow: Record<string, unknown> = {};
    for (const col of columns) {
      newRow[col.id] = col.defaultValue ?? "";
    }
    onDataChange([...data, newRow]);
  }, [data, columns, onDataChange]);

  const handleDeleteRow = useCallback(
    (rowIndex: number) => {
      const newData = data.filter((_, i) => i !== rowIndex);
      onDataChange(newData);
    },
    [data, onDataChange]
  );

  const handleSort = useCallback(
    (colId: string) => {
      if (sortCol === colId) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortCol(colId);
        setSortDir("asc");
      }
    },
    [sortCol]
  );

  const renderHeaderRow = () => (
    <tr>
      {columns.map((col) => (
        <th
          key={col.id}
          className="sticky top-0 z-10 bg-[#1A1A2E] text-left text-xs font-semibold text-slate-300 uppercase tracking-wider px-3 py-3 border-b border-slate-600 cursor-pointer select-none whitespace-nowrap hover:text-teal-400 transition-colors"
          style={{ width: col.width, minWidth: col.width }}
          onClick={() => handleSort(col.id)}
        >
          <span className="flex items-center gap-1">
            {col.header}
            {sortCol === col.id ? (
              sortDir === "asc" ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )
            ) : (
              <span className="w-3 h-3" />
            )}
          </span>
        </th>
      ))}
      <th className="sticky top-0 z-10 bg-[#1A1A2E] w-8 border-b border-slate-600" />
    </tr>
  );

  const renderRow = (
    row: Record<string, unknown>,
    displayIndex: number,
    dataIndex: number
  ) => (
    <tr
      key={dataIndex}
      className={`${
        displayIndex % 2 === 0 ? "bg-slate-800/30" : "bg-slate-800/60"
      } hover:bg-slate-700/50 transition-colors group`}
      onMouseEnter={() => setHoveredRow(dataIndex)}
      onMouseLeave={() => setHoveredRow(null)}
    >
      {columns.map((col) => (
        <td
          key={col.id}
          className="px-3 py-2 border-b border-slate-700/50"
          style={{ width: col.width, minWidth: col.width }}
        >
          <EditableCell
            column={col}
            value={row[col.id]}
            onChange={(v) => handleCellChange(dataIndex, col.id, v)}
          />
        </td>
      ))}
      <td className="px-1 py-2 border-b border-slate-700/50 w-8">
        <button
          type="button"
          className={`text-red-400 hover:text-red-300 transition-opacity ${
            hoveredRow === dataIndex ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => handleDeleteRow(dataIndex)}
          title="Delete row"
        >
          <X className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full border-collapse">
          <thead>{renderHeaderRow()}</thead>
          <tbody>
            {groupedData
              ? Object.entries(groupedData).map(([groupName, rows]) => (
                  <Fragment key={groupName}>
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="bg-[#1A1A2E]/80 px-3 py-2 border-b border-slate-600"
                      >
                        <span className="font-[family-name:var(--font-oswald)] text-teal-400 text-sm font-semibold uppercase tracking-wide">
                          {groupName}
                        </span>
                        <span className="text-slate-500 text-xs ml-2">
                          ({rows.length} items)
                        </span>
                      </td>
                    </tr>
                    {rows.map((entry, i) =>
                      renderRow(entry.row, i, entry.index)
                    )}
                  </Fragment>
                ))
              : sortedData.map((row, i) => renderRow(row, i, i))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 px-1">
        <button
          type="button"
          onClick={handleAddRow}
          className="flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>
        <span className="text-xs text-slate-500">
          {data.length} {data.length === 1 ? "row" : "rows"}
        </span>
      </div>
    </div>
  );
}

