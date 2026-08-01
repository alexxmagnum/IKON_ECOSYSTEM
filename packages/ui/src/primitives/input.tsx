import type { InputHTMLAttributes } from "react";

import { cn } from "../lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "w-full rounded-[var(--motan-radius-md)] border border-[var(--motan-color-border)]",
        "bg-[var(--motan-color-muted)] px-3 py-2 text-[var(--motan-color-foreground)]",
        "placeholder:text-[var(--motan-color-muted-foreground)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--motan-color-ring)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
