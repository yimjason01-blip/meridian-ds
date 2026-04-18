import * as React from "react";
import { cn } from "../lib/cn";

/**
 * ReorderableCard + ReorderableList — Meridian primitive.
 *
 * Spec: src/primitives/ReorderableCard.md
 *
 * Pointer-based drag (not HTML5 DnD). The whole card follows the cursor;
 * siblings shift their position to make room. No drop indicator line — the
 * insertion point is communicated by the siblings' physical movement.
 * No accent color used in drag interaction (neutral: shadow + transform only).
 *
 * Keyboard reorder: Tab to grip → Space to lift → ↑/↓ → Space to drop · Esc cancels.
 * Accordion expand: click title or caret. Click on grip does nothing (grip is drag-only).
 */

export interface ReorderableItem {
  id: string;
  title: string;
  meta?: string[];
  disabled?: boolean;
  /** Optional action node rendered to the right of meta (e.g. an Ask chip). */
  rowAction?: React.ReactNode;
  body: React.ReactNode;
}

interface ReorderableListProps {
  items: ReorderableItem[];
  onReorder: (from: number, to: number) => void;
  expandMode?: "accordion" | "multi";
  ariaLabel: string;
  className?: string;
}

const GAP_PX = 6; // matches gap-1.5 on the list container

export function ReorderableList({
  items,
  onReorder,
  expandMode = "accordion",
  ariaLabel,
  className,
}: ReorderableListProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [liftedIndex, setLiftedIndex] = React.useState<number | null>(null);
  const [drag, setDrag] = React.useState<null | {
    index: number;
    dy: number;
    targetIndex: number;
    step: number; // card height + gap (per-slot shift amount)
  }>(null);

  const liveRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Map<string, HTMLElement>>(new Map());

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

  // ─── Pointer-based drag ────────────────────────────────────────────────

  const startY = React.useRef<number>(0);

  const handlePointerDown = (i: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (items[i].disabled) return;
    if (e.button !== 0) return; // primary button only
    e.preventDefault();

    const el = itemRefs.current.get(items[i].id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const step = rect.height + GAP_PX;

    startY.current = e.clientY;
    setDrag({ index: i, dy: 0, targetIndex: i, step });

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const dy = e.clientY - startY.current;
    const targetIndex = Math.max(
      0,
      Math.min(items.length - 1, drag.index + Math.round(dy / drag.step))
    );
    setDrag({ ...drag, dy, targetIndex });
  };

  const endDrag = () => {
    if (!drag) return;
    if (drag.targetIndex !== drag.index) {
      onReorder(drag.index, drag.targetIndex);
      announce(
        `Moved ${items[drag.index].title} to position ${drag.targetIndex + 1} of ${items.length}`
      );
    }
    setDrag(null);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    endDrag();
  };

  const handlePointerCancel = () => endDrag();

  // ─── Keyboard reorder ─────────────────────────────────────────────────

  const handleGripKey = (i: number) => (e: React.KeyboardEvent) => {
    if (items[i].disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (liftedIndex === null) {
        setLiftedIndex(i);
        announce(
          `Lifted ${items[i].title}. Use arrow keys to move, Space to drop, Escape to cancel.`
        );
      } else {
        announce(`Dropped ${items[liftedIndex].title} at position ${liftedIndex + 1}`);
        setLiftedIndex(null);
      }
    } else if (e.key === "Escape" && liftedIndex !== null) {
      e.preventDefault();
      announce("Cancelled.");
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

  // ─── Transform computation per item ───────────────────────────────────

  const itemTransform = (i: number): { transform: string; transition: string; z: number } => {
    if (!drag) return { transform: "", transition: "transform 180ms ease-out", z: 0 };

    if (i === drag.index) {
      // The dragged card follows the pointer 1:1, no transition, on top.
      return { transform: `translateY(${drag.dy}px)`, transition: "none", z: 2 };
    }

    const { index: src, targetIndex: dst, step } = drag;
    if (dst > src && i > src && i <= dst) {
      return { transform: `translateY(-${step}px)`, transition: "transform 180ms ease-out", z: 0 };
    }
    if (dst < src && i >= dst && i < src) {
      return { transform: `translateY(${step}px)`, transition: "transform 180ms ease-out", z: 0 };
    }
    return { transform: "", transition: "transform 180ms ease-out", z: 0 };
  };

  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={cn("flex flex-col gap-1.5 relative", className)}
    >
      <div ref={liveRef} aria-live="polite" aria-atomic="true" className="sr-only" />
      {items.map((item, i) => {
        const isExpanded = expanded.has(item.id);
        const isDragging = drag?.index === i;
        const isLifted = liftedIndex === i;
        const { transform, transition, z } = itemTransform(i);

        return (
          <article
            key={item.id}
            role="listitem"
            ref={(el) => {
              if (el) itemRefs.current.set(item.id, el);
              else itemRefs.current.delete(item.id);
            }}
            data-rc-item
            data-dragging={isDragging || undefined}
            data-lifted={isLifted || undefined}
            data-disabled={item.disabled || undefined}
            style={{
              transform,
              transition,
              zIndex: z,
              willChange: drag ? "transform" : undefined,
            }}
            className={cn(
              "bg-white/[.02] border border-border rounded-card overflow-hidden",
              // Neutral lift feel — shadow only, no opacity, no accent
              isDragging && "shadow-[0_8px_24px_rgba(0,0,0,0.4)]",
              isLifted && "ring-1 ring-[var(--border-strong)]",
              item.disabled && "opacity-55"
            )}
          >
            <div
              className={cn(
                "flex items-center h-[60px] px-2 gap-3",
                !isDragging && "hover:bg-[var(--bg-hover)] transition-colors"
              )}
            >
              {/* Grip — only drag surface */}
              <button
                type="button"
                onPointerDown={handlePointerDown(i)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onKeyDown={handleGripKey(i)}
                aria-label={`Drag to reorder ${item.title}`}
                aria-grabbed={isLifted || isDragging}
                disabled={item.disabled}
                className={cn(
                  "flex items-center justify-center w-6 h-10 text-text-muted hover:text-text-secondary",
                  "cursor-grab active:cursor-grabbing",
                  "focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-strong)] rounded",
                  "disabled:cursor-not-allowed touch-none select-none"
                )}
              >
                <GripIcon />
              </button>

              {/* Priority number — always = index + 1 */}
              <span className="t-mono text-[15px] text-text w-6 tabular-nums text-right">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Title — click to expand */}
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

              {/* Row action (e.g. Ask chip). Click does not expand. */}
              {item.rowAction && (
                <div
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {item.rowAction}
                </div>
              )}

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

            {/* Accordion body */}
            {isExpanded && !isDragging && (
              <div className="border-t border-border-subtle">{item.body}</div>
            )}
          </article>
        );
      })}
    </div>
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
