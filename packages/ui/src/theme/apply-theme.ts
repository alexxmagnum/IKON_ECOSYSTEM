import type { MotanTheme } from "./types";

/**
 * Maps a MotanTheme to CSS custom properties for runtime theming.
 */
export function themeToCssVariables(theme: MotanTheme): Record<string, string> {
  return {
    "--motan-color-background": theme.colors.background,
    "--motan-color-foreground": theme.colors.foreground,
    "--motan-color-muted": theme.colors.muted,
    "--motan-color-muted-foreground": theme.colors.mutedForeground,
    "--motan-color-primary": theme.colors.primary,
    "--motan-color-primary-foreground": theme.colors.primaryForeground,
    "--motan-color-secondary": theme.colors.secondary,
    "--motan-color-secondary-foreground": theme.colors.secondaryForeground,
    "--motan-color-accent": theme.colors.accent,
    "--motan-color-accent-foreground": theme.colors.accentForeground,
    "--motan-color-destructive": theme.colors.destructive,
    "--motan-color-destructive-foreground": theme.colors.destructiveForeground,
    "--motan-color-border": theme.colors.border,
    "--motan-color-ring": theme.colors.ring,
    "--motan-color-surface": theme.colors.surface,
    "--motan-font-family": theme.typography.fontFamily,
    "--motan-space-xs": theme.spacing.xs,
    "--motan-space-sm": theme.spacing.sm,
    "--motan-space-md": theme.spacing.md,
    "--motan-space-lg": theme.spacing.lg,
    "--motan-space-xl": theme.spacing.xl,
    "--motan-radius-sm": theme.shape.radius.sm,
    "--motan-radius-md": theme.shape.radius.md,
    "--motan-radius-lg": theme.shape.radius.lg,
    "--motan-radius-full": theme.shape.radius.full,
    "--motan-shadow-sm": theme.shape.shadow.sm,
    "--motan-shadow-md": theme.shape.shadow.md,
    "--motan-motion-fast": theme.motion.duration.fast,
    "--motan-motion-normal": theme.motion.duration.normal,
    "--motan-motion-slow": theme.motion.duration.slow,
    "--motan-easing-standard": theme.motion.easing.standard,
    "--motan-easing-emphasized": theme.motion.easing.emphasized,
  };
}

export function applyThemeToElement(element: HTMLElement, theme: MotanTheme): void {
  const variables = themeToCssVariables(theme);
  for (const [key, value] of Object.entries(variables)) {
    element.style.setProperty(key, value);
  }
}
