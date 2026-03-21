"use client";

import { useMemo } from "react";
import type { TemplateData, TemplateSheet } from "./types";

interface LiveDashboardProps {
  templateData: TemplateData;
  sheets: TemplateSheet[];
}

interface MetricCard {
  label: string;
  value: string;
  subtext?: string;
  color: "green" | "yellow" | "red" | "blue" | "teal";
}

function getColorClasses(color: MetricCard["color"]) {
  switch (color) {
    case "green":
      return { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400" };
    case "yellow":
      return { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400" };
    case "red":
      return { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" };
    case "blue":
      return { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" };
    case "teal":
      return { bg: "bg-teal-500/10", border: "border-teal-500/30", text: "text-teal-400" };
  }
}

function scoreToColor(score: number, max: number = 5): MetricCard["color"] {
  const ratio = score / max;
  if (ratio >= 0.8) return "green";
  if (ratio >= 0.6) return "yellow";
  return "red";
}

export default function LiveDashboard({
  templateData,
  sheets,
}: LiveDashboardProps) {
  const metrics = useMemo(() => {
    const cards: MetricCard[] = [];
    const completionBars: { label: string; filled: number; total: number }[] = [];
    const summaryRows: {
      group: string;
      avg: number;
      count: number;
      min: number;
      max: number;
    }[] = [];

    // Gather data across all sheets
    for (const sheet of sheets) {
      if (sheet.type === "summary") continue;
      const sheetData = templateData[sheet.id] ?? [];

      if (sheet.type === "table" && sheet.columns) {
        const scoreColumns = sheet.columns.filter((c) => c.type === "score");
        const rows = sheetData as Record<string, unknown>[];

        // Overall score card
        if (scoreColumns.length > 0) {
          let totalScore = 0;
          let scoreCount = 0;
          for (const row of rows) {
            for (const sc of scoreColumns) {
              const val = Number(row[sc.id]);
              if (!isNaN(val) && val > 0) {
                totalScore += val;
                scoreCount++;
              }
            }
          }
          if (scoreCount > 0) {
            const avg = totalScore / scoreCount;
            const maxScore = scoreColumns[0]?.max ?? 5;
            cards.push({
              label: "Overall Score",
              value: `${avg.toFixed(1)}/${maxScore}`,
              subtext: `${scoreCount} items scored`,
              color: scoreToColor(avg, maxScore),
            });
          }
        }

        // Items completed
        const completedRows = rows.filter((row) => {
          const statusCol = sheet.columns!.find(
            (c) => c.type === "dropdown" && c.options?.includes("Done")
          );
          if (statusCol) return row[statusCol.id] === "Done";
          // Fall back to: has at least one non-empty score
          return scoreColumns.some((sc) => {
            const val = Number(row[sc.id]);
            return !isNaN(val) && val > 0;
          });
        });
        if (rows.length > 0) {
          cards.push({
            label: "Completion",
            value: `${Math.round((completedRows.length / rows.length) * 100)}%`,
            subtext: `${completedRows.length} of ${rows.length} items`,
            color:
              completedRows.length === rows.length
                ? "green"
                : completedRows.length > rows.length * 0.5
                ? "yellow"
                : "red",
          });
        }

        // Items scored
        if (scoreColumns.length > 0) {
          const scoredCount = rows.filter((row) =>
            scoreColumns.some((sc) => {
              const val = Number(row[sc.id]);
              return !isNaN(val) && val > 0;
            })
          ).length;
          cards.push({
            label: "Items Scored",
            value: `${scoredCount}/${rows.length}`,
            subtext: `${Math.round((scoredCount / Math.max(rows.length, 1)) * 100)}% scored`,
            color: scoredCount === rows.length ? "green" : "teal",
          });
        }

        // GroupBy summary
        if (sheet.groupBy && scoreColumns.length > 0) {
          const groups: Record<string, number[]> = {};
          for (const row of rows) {
            const groupKey = String(row[sheet.groupBy] ?? "Other");
            if (!groups[groupKey]) groups[groupKey] = [];
            for (const sc of scoreColumns) {
              const val = Number(row[sc.id]);
              if (!isNaN(val) && val > 0) {
                groups[groupKey].push(val);
              }
            }
          }
          for (const [group, scores] of Object.entries(groups)) {
            if (scores.length === 0) {
              summaryRows.push({ group, avg: 0, count: 0, min: 0, max: 0 });
            } else {
              summaryRows.push({
                group,
                avg: scores.reduce((a, b) => a + b, 0) / scores.length,
                count: scores.length,
                min: Math.min(...scores),
                max: Math.max(...scores),
              });
            }
          }
        }

        // Completion bar for this sheet
        if (scoreColumns.length > 0) {
          const scoredCount = rows.filter((row) =>
            scoreColumns.some((sc) => {
              const val = Number(row[sc.id]);
              return !isNaN(val) && val > 0;
            })
          ).length;
          completionBars.push({
            label: sheet.name,
            filled: scoredCount,
            total: rows.length,
          });
        }
      }

      if (sheet.type === "form" && sheet.fields) {
        const formData = sheetData[0] ?? {};
        const filledCount = sheet.fields.filter(
          (f) => formData[f.id] != null && formData[f.id] !== ""
        ).length;
        completionBars.push({
          label: sheet.name,
          filled: filledCount,
          total: sheet.fields.length,
        });

        cards.push({
          label: `${sheet.name} Progress`,
          value: `${Math.round((filledCount / Math.max(sheet.fields.length, 1)) * 100)}%`,
          subtext: `${filledCount} of ${sheet.fields.length} fields`,
          color:
            filledCount === sheet.fields.length
              ? "green"
              : filledCount > 0
              ? "yellow"
              : "red",
        });
      }
    }

    return { cards, completionBars, summaryRows };
  }, [templateData, sheets]);

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      {metrics.cards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.cards.map((card, i) => {
            const colors = getColorClasses(card.color);
            return (
              <div
                key={i}
                className={`${colors.bg} border ${colors.border} rounded-xl p-5`}
              >
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {card.label}
                </p>
                <p
                  className={`font-[family-name:var(--font-oswald)] text-3xl font-bold ${colors.text}`}
                >
                  {card.value}
                </p>
                {card.subtext && (
                  <p className="text-xs text-slate-500 mt-1">{card.subtext}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Bars */}
      {metrics.completionBars.length > 0 && (
        <div>
          <h3 className="font-[family-name:var(--font-oswald)] text-white text-lg font-semibold mb-4">
            Section Progress
          </h3>
          <div className="space-y-3">
            {metrics.completionBars.map((bar) => {
              const pct =
                bar.total > 0
                  ? Math.round((bar.filled / bar.total) * 100)
                  : 0;
              return (
                <div key={bar.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300">{bar.label}</span>
                    <span className="text-xs text-slate-400">
                      {bar.filled}/{bar.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct === 100
                          ? "bg-green-500"
                          : pct >= 50
                          ? "bg-teal-500"
                          : pct > 0
                          ? "bg-yellow-500"
                          : "bg-slate-600"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Table */}
      {metrics.summaryRows.length > 0 && (
        <div>
          <h3 className="font-[family-name:var(--font-oswald)] text-white text-lg font-semibold mb-4">
            Category Breakdown
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-[#1A1A2E] text-left text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3 border-b border-slate-600">
                    Category
                  </th>
                  <th className="bg-[#1A1A2E] text-center text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3 border-b border-slate-600">
                    Avg Score
                  </th>
                  <th className="bg-[#1A1A2E] text-center text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3 border-b border-slate-600">
                    Items
                  </th>
                  <th className="bg-[#1A1A2E] text-center text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3 border-b border-slate-600">
                    Min
                  </th>
                  <th className="bg-[#1A1A2E] text-center text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3 border-b border-slate-600">
                    Max
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.summaryRows.map((row, i) => {
                  const color = scoreToColor(row.avg);
                  const colorClasses = getColorClasses(color);
                  return (
                    <tr
                      key={row.group}
                      className={
                        i % 2 === 0 ? "bg-slate-800/30" : "bg-slate-800/60"
                      }
                    >
                      <td className="px-4 py-2.5 text-sm text-slate-200 border-b border-slate-700/50">
                        {row.group}
                      </td>
                      <td className="px-4 py-2.5 text-center border-b border-slate-700/50">
                        <span
                          className={`text-sm font-semibold ${colorClasses.text}`}
                        >
                          {row.avg.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm text-slate-400 border-b border-slate-700/50">
                        {row.count}
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm text-slate-400 border-b border-slate-700/50">
                        {row.min || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm text-slate-400 border-b border-slate-700/50">
                        {row.max || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {metrics.cards.length === 0 &&
        metrics.completionBars.length === 0 &&
        metrics.summaryRows.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">
              Start filling in the other sheets to see your dashboard come alive.
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Metrics, scores, and progress will update automatically.
            </p>
          </div>
        )}
    </div>
  );
}
