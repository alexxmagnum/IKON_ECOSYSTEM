import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../lib/cn";
import type { SpacingTokenKey } from "../tokens";

export type StackProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  gap?: SpacingTokenKey;
  direction?: "row" | "column";
};

const gapClass: Record<SpacingTokenKey, string> = {
  xs: "gap-[var(--motan-space-xs)]",
  sm: "gap-[var(--motan-space-sm)]",
  md: "gap-[var(--motan-space-md)]",
  lg: "gap-[var(--motan-space-lg)]",
  xl: "gap-[var(--motan-space-xl)]",
};

export function Stack({
  children,
  gap = "md",
  direction = "column",
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "column" ? "flex-col" : "flex-row items-center",
        gapClass[gap],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
