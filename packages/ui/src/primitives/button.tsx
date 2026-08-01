import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--motan-color-primary)] text-[var(--motan-color-primary-foreground)] hover:opacity-90",
  secondary:
    "bg-[var(--motan-color-secondary)] text-[var(--motan-color-secondary-foreground)] hover:opacity-90",
  ghost:
    "bg-transparent text-[var(--motan-color-foreground)] border border-[var(--motan-color-border)] hover:bg-[var(--motan-color-muted)]",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-3 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--motan-radius-md)] font-medium transition-opacity",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--motan-color-ring)]",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
