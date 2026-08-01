import type { ReactNode } from "react";

/**
 * @motanos/ui — MotanOS shared design-system package (scaffold).
 * No business logic.
 */
export type UiShellProps = {
  children?: ReactNode;
};

export const UI_PACKAGE = "@motanos/ui" as const;
