import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Table — Meridian primitive for EMR row patterns.
 * DESIGN_SYSTEM.md §7 Components › Data rows.
 * Rule: 36px row min-height, mono for numerics, tabular-nums, right-align numeric columns.
 */
export const Table = ({ className, ...p }: React.HTMLAttributes<HTMLTableElement>) => (
  <table className={cn("w-full text-body border-collapse", className)} {...p} />
);

export const THead = ({ className, ...p }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn("border-b border-border-subtle", className)} {...p} />
);

export const TR = ({ className, ...p }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("border-b border-border-subtle last:border-0 h-9", className)} {...p} />
);

export const TH = ({ className, ...p }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      "text-left t-label py-2 pr-4 font-ui",
      className
    )}
    {...p}
  />
);

export const TD = ({ className, numeric, ...p }: React.TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) => (
  <td
    className={cn(
      "py-2 pr-4 text-text",
      numeric && "t-mono text-right",
      className
    )}
    {...p}
  />
);
