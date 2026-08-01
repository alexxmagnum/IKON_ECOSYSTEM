import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../lib/cn";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: "neutral" | "accent";
};

export function Badge({
  children,
  tone = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--motan-radius-full)] px-2.5 py-1 text-xs font-medium tracking-wide",
        tone === "accent"
          ? "bg-[var(--motan-color-accent)] text-[var(--motan-color-accent-foreground)]"
          : "bg-[var(--motan-color-muted)] text-[var(--motan-color-muted-foreground)]",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
