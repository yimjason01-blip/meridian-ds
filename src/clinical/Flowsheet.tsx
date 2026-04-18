import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Flowsheet — canonical clinical table for wearables/labs/vitals/analytes.
 * See emr-flowsheet-component skill.
 * Columns: analyte rows × time columns, with reference range and out-of-range highlighting.
 */
export interface FlowsheetRow {
  analyte: string;
  unit?: string;
  range?: string;
  values: (string | null)[]; // aligned with dates
  flag?: "crit" | "warn" | null; // applies to latest
}

export interface FlowsheetProps {
  dates: string[];         // column headers, left-to-right (oldest → newest)
  rows: FlowsheetRow[];
  groupTitle?: string;
  className?: string;
}

export function Flowsheet({ dates, rows, groupTitle, className }: FlowsheetProps) {
  return (
    <div className={cn("rounded-card border border-border bg-white/[.02]", className)}>
      {groupTitle && (
        <header className="px-4 py-3 border-b border-border-subtle">
          <div className="t-label">{groupTitle}</div>
        </header>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-body border-collapse">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="t-label text-left py-2 pl-4 pr-3 sticky left-0 bg-bg-panel/80 backdrop-blur">
                Analyte
              </th>
              <th className="t-label text-left py-2 pr-4 whitespace-nowrap">Range</th>
              {dates.map((d) => (
                <th key={d} className="t-label text-right py-2 pr-4 whitespace-nowrap">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const latest = r.values[r.values.length - 1];
              const flagClass =
                r.flag === "crit"
                  ? "text-status-crit"
                  : r.flag === "warn"
                  ? "text-status-warn"
                  : "text-text";
              return (
                <tr key={r.analyte + i} className="border-b border-border-subtle last:border-0 h-9">
                  <td className="pl-4 pr-3 text-text sticky left-0 bg-bg-panel/40 backdrop-blur-sm">
                    <div className="flex items-baseline gap-1.5">
                      <span className="t-ui">{r.analyte}</span>
                      {r.unit && <span className="t-caption">{r.unit}</span>}
                    </div>
                  </td>
                  <td className="pr-4 t-caption">{r.range ?? ""}</td>
                  {r.values.map((v, j) => {
                    const isLatest = j === r.values.length - 1;
                    return (
                      <td
                        key={j}
                        className={cn(
                          "pr-4 text-right t-mono",
                          isLatest ? flagClass : "text-text-secondary"
                        )}
                      >
                        {v ?? "—"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
