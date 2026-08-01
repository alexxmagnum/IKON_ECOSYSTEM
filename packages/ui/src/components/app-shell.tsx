import type { ReactNode } from "react";

import { cn } from "../lib/cn";
import { Container } from "../primitives/container";

export type AppShellProps = {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Universal application shell layout.
 * No domain navigation — slots only.
 */
export function AppShell({ header, footer, children, className }: AppShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-[var(--motan-color-background)] text-[var(--motan-color-foreground)]",
        className,
      )}
    >
      {header ? (
        <header className="border-b border-[var(--motan-color-border)]">
          <Container className="py-[var(--motan-space-md)]">{header}</Container>
        </header>
      ) : null}
      <main id="main-content" className="flex-1">
        <Container className="py-[var(--motan-space-xl)]">{children}</Container>
      </main>
      {footer ? (
        <footer className="border-t border-[var(--motan-color-border)]">
          <Container className="py-[var(--motan-space-md)]">{footer}</Container>
        </footer>
      ) : null}
    </div>
  );
}
