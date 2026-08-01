import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../lib/cn";

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
} as const;

export function Container({
  children,
  size = "md",
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-[var(--motan-space-md)]", sizeClass[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
