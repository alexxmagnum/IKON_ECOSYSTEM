/**
 * Tiny className merger — avoids pulling a UI utility library.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
