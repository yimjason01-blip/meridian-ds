import * as React from "react";
import * as RT from "@radix-ui/react-tabs";
import { cn } from "../lib/cn";

/**
 * Tabs — Meridian primitive (underline style, not pill).
 * DESIGN_SYSTEM.md §7 Components › Tabs.
 * RULE: Tabs for 4+ peer categories (banned_patterns › cards-for-peer-nav).
 */
export const Tabs = RT.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof RT.List>,
  React.ComponentPropsWithoutRef<typeof RT.List>
>(({ className, ...props }, ref) => (
  <RT.List
    ref={ref}
    className={cn("flex gap-6 border-b border-border-subtle", className)}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof RT.Trigger>,
  React.ComponentPropsWithoutRef<typeof RT.Trigger>
>(({ className, ...props }, ref) => (
  <RT.Trigger
    ref={ref}
    className={cn(
      "relative py-2.5 -mb-px text-ui text-text-muted transition-colors",
      "hover:text-text-secondary",
      "data-[state=active]:text-text",
      "data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-accent-hover",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hover focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof RT.Content>,
  React.ComponentPropsWithoutRef<typeof RT.Content>
>(({ className, ...props }, ref) => (
  <RT.Content ref={ref} className={cn("pt-4 focus-visible:outline-none", className)} {...props} />
));
TabsContent.displayName = "TabsContent";
