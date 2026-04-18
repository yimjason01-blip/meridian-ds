import * as React from "react";
import { cn } from "../lib/cn";

/**
 * ReorderableCard + ReorderableList — Meridian primitive.
 *
 * Spec: src/primitives/ReorderableCard.md
 * Banned patterns enforced:
 *   - whole-card-drag   : drag originates from grip only
 *   - stale-priority-number : numbers re-render from list index
 *   - confirm-reorder   : save-on-drop, no confirm
 *
 * HTML5 DnD, accordion expand, keyboard-first reorder (Space to lift, ↑/↓, Space to drop, Esc cancel).
 * Designed to wrap DecisionCard (or any clinical card) in its expanded body.
 */

export interface ReorderableItem {
  id: string;
  title: string;
  meta?: string[];
  disabled?: boolean;
  body: React.ReactNode;
}

interface ReorderableListProps {
  items: ReorderableItem[];
  onReorder: (from: number, to: number) => void;
  expandMode?: "accordion" | "multi";
  ariaLabel: string;
  className?: string;
}

export function ReorderableList({
  items,
  onReorder,
  expandMode = "accordion",
  ariaLabel,
  className,
}: ReorderableListProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);
  const [liftedIndex, setLiftedIndex] = React.useState<number | null>(null);
  const liveRef = React.useRef<HTMLDivElement>(null);

  const announce = (msg: string) => {
    if (liveRef.current) liveRef.current.textContent = msg;
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(expandMode === "accordion" ? [] : prev);
      if (!prev.has(id)) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleDragStart = (i: number) => (e: React.DragEvent) => {
    if (items[i].disabled) return;
    setDragIndex(i);
    e.dataTransfer.effectAllowed = "move";
    // Fallback for Firefox
    e.dataTransfer.setData("text/plain", items[i].id);
  };

  const handleDragOver = (i: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex !== null && i !== overIndex) setOverIndex(i);
  };

  const handleDrop = (i: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== i) {
      onReorder(dragIndex, i);
      announce(`Moved ${items[dragIndex].title} to position ${i + 1} of ${items.length}`);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleGripKey = (i: number) => (e: React.KeyboardEvent) => {
    if (items[i].disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (liftedIndex === null) {
        setLiftedIndex(i);
        announce(`Lifted ${items[i].title}. Use arrow keys to move, Space to drop, Escape to cancel.`);
      } else {
        announce(`Dropped ${items[liftedIndex].title} at position ${liftedIndex + 1}`);
        setLiftedIndex(null);
      }
    } else if (e.key === "Escape" && liftedIndex !== null) {
      e.preventDefault();
      announce(`Cancelled.`);
      setLiftedIndex(null);
    } else if ((e.key === "ArrowUp" || e.key === "ArrowDown") && liftedIndex !== null) {
      e.preventDefault();
      const dir = e.key === "ArrowUp" ? -1 : 1;
      const target = liftedIndex + dir;
      if (target < 0 || target >= items.length) return;
      onReorder(liftedIndex, target);
      setLiftedIndex(target);
      announce(`Moved to position ${target + 1}`);
    }
  };

  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={cn("flex flex-col gap-1.5", className)}
    >
      <div ref={liveRef} aria-live="polite" aria-atomic="true" className="sr-only" />
      {items.map((item, i) => {
        const isExpanded = expanded.has(item.id);
        const isDragging = dragIndex === i;
        const isLifted = liftedIndex === i;
        const showDropAbove = overIndex === i && dragIndex !== null && dragIndex > i;
        const showDropBelow = overIndex === i && dragIndex !== null && dragIndex < i;

        return (
          <React.Fragment key={item.id}>
            {showDropAbove && <DropIndicator />}
            <article
              role="listitem"
              data-dragging={isDragging || undefined}
              data-lifted={isLifted || undefined}
              data-disabled={item.disabled || undefined}
              onDragOver={handleDragOver(i)}
              onDrop={handleDrop(i)}
              className={cn(
                "group bg-white/[.02] border border-border rounded-card overflow-hidden transition-colors",
                "data-[dragging]:opacity-[0.92] data-[dragging]:shadow-[0_8px_24px_rgba(0,0,0,0.4)] data-[dragging]:-translate-y-0.5",
                "data-[lifted]:ring-2 data-[lifted]:ring-accent-hover",
                "data-[disabled]:opacity-55",
                "transition-all duration-150"
              )}
            >
              {/* Collapsed row — always visible */}
              <div
                className={cn(
                  "flex items-center h-[60px] px-2 gap-3 cursor-default",
                  "hover:bg-[var(--bg-hover)] transition-colors"
                )}
              >
                {/* Grip */}
                <button
                  type="button"
                  draggable={!item.disabled}
                  onDragStart={handleDragStart(i)}
                  onDragEnd={handleDragEnd}
                  onKeyDown={handleGripKey(i)}
                  aria-label={`Drag to reorder ${item.title}`}
                  aria-grabbed={isLifted}
                  disabled={item.disabled}
                  className={cn(
                    "flex items-center justify-center w-6 h-10 text-text-muted hover:text-text-secondary",
                    "cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-accent-hover rounded",
                    "disabled:cursor-not-allowed"
                  )}
                >
                  <GripIcon />
                </button>

                {/* Priority number — always = index + 1 (source of truth is list order) */}
                <span className="t-mono text-[15px] text-text w-6 tabular-nums text-right">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Title (click to expand) */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className="flex-1 min-w-0 flex items-center justify-between gap-3 text-left focus:outline-none"
                >
                  <span className="truncate text-[15px] font-[510] text-text">{item.title}</span>
                  {item.meta && item.meta.length > 0 && (
                    <span className="t-meta flex-shrink-0 hidden sm:inline">
                      {item.meta.join(" · ")}
                    </span>
                  )}
                </button>

                {/* Caret */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                  aria-expanded={isExpanded}
                  className={cn(
                    "flex items-center justify-center w-6 h-6 text-text-muted hover:text-text-secondary",
                    "transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                >
                  <CaretIcon />
                </button>
              </div>

              {/* Expanded body — accordion */}
              {isExpanded && (
                <div className="border-t border-border-subtle animate-[accordion_180ms_ease-out]">
                  {item.body}
                </div>
              )}
            </article>
            {showDropBelow && <DropIndicator />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function DropIndicator() {
  return (
    <div
      aria-hidden
      className="h-0.5 bg-accent-hover rounded-full -my-px"
    />
  );
}

function GripIcon() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden>
      <circle cx="2" cy="3" r="1.2" />
      <circle cx="8" cy="3" r="1.2" />
      <circle cx="2" cy="8" r="1.2" />
      <circle cx="8" cy="8" r="1.2" />
      <circle cx="2" cy="13" r="1.2" />
      <circle cx="8" cy="13" r="1.2" />
    </svg>
  );
}

function CaretIcon() {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M1 1.5 L6 6.5 L11 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
