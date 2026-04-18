import * as React from "react";
import * as RDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../lib/cn";

/**
 * Dialog — Meridian primitive. Radix under the hood.
 * DESIGN_SYSTEM.md §6 Elevation › level 4 (modal).
 */
export const Dialog = RDialog.Root;
export const DialogTrigger = RDialog.Trigger;
export const DialogClose = RDialog.Close;

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof RDialog.Content>,
  React.ComponentPropsWithoutRef<typeof RDialog.Content>
>(({ className, children, ...props }, ref) => (
  <RDialog.Portal>
    <RDialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <RDialog.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        "w-[min(92vw,520px)] rounded-card",
        "bg-bg-surface border border-border-strong",
        "shadow-[0_20px_48px_-12px_rgba(0,0,0,0.7)] p-5",
        "focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
      <RDialog.Close className="absolute right-3 top-3 text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hover rounded-sm">
        <X size={16} />
      </RDialog.Close>
    </RDialog.Content>
  </RDialog.Portal>
));
DialogContent.displayName = "DialogContent";

export const DialogTitle = ({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <RDialog.Title className={cn("t-h3 mb-1", className)} {...p} />
);
export const DialogDescription = ({ className, ...p }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <RDialog.Description className={cn("t-body mt-1", className)} {...p} />
);
