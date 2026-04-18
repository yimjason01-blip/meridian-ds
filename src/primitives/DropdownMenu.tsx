import * as React from "react";
import * as DM from "@radix-ui/react-dropdown-menu";
import { cn } from "../lib/cn";

/**
 * DropdownMenu — Meridian primitive. Radix menu, skinned.
 * DESIGN_SYSTEM.md §6 Elevation › level 3 (pop).
 */
export const DropdownMenu = DM.Root;
export const DropdownTrigger = DM.Trigger;

export const DropdownContent = React.forwardRef<
  React.ElementRef<typeof DM.Content>,
  React.ComponentPropsWithoutRef<typeof DM.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <DM.Portal>
    <DM.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "min-w-[180px] rounded-[6px] bg-bg-surface border border-border p-1",
        "shadow-[0_12px_32px_-8px_rgba(0,0,0,0.6)]",
        className
      )}
      {...props}
    />
  </DM.Portal>
));
DropdownContent.displayName = "DropdownContent";

export const DropdownItem = React.forwardRef<
  React.ElementRef<typeof DM.Item>,
  React.ComponentPropsWithoutRef<typeof DM.Item>
>(({ className, ...props }, ref) => (
  <DM.Item
    ref={ref}
    className={cn(
      "relative flex items-center rounded-sm px-2 py-1.5 text-ui text-text-secondary",
      "focus:bg-bg-hover focus:text-text outline-none cursor-default",
      "data-[disabled]:text-text-muted data-[disabled]:pointer-events-none",
      className
    )}
    {...props}
  />
));
DropdownItem.displayName = "DropdownItem";

export const DropdownSeparator = () => (
  <DM.Separator className="my-1 h-px bg-border-subtle" />
);
