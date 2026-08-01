import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../lib/cn";

export type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  elevated?: boolean;
};

export function Surface({
  children,
  elevated = false,
  className,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--motan-radius-lg)] border border-[var(--motan-color-border)] bg-[var(--motan-color-surface)]",
        elevated && "shadow-[var(--motan-shadow-md)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
