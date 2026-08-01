import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../lib/cn";

export type TextTone = "default" | "muted" | "accent";
export type TextSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  as?: "p" | "span" | "h1" | "h2" | "h3";
  tone?: TextTone;
  size?: TextSize;
  children: ReactNode;
};

const toneClass: Record<TextTone, string> = {
  default: "text-[var(--motan-color-foreground)]",
  muted: "text-[var(--motan-color-muted-foreground)]",
  accent: "text-[var(--motan-color-accent)]",
};

const sizeClass: Record<TextSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl tracking-tight",
};

export function Text({
  as: Component = "p",
  tone = "default",
  size = "md",
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Component className={cn(toneClass[tone], sizeClass[size], className)} {...props}>
      {children}
    </Component>
  );
}
