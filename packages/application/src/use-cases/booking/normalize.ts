/**
 * Opaque reference normalization — trim before authorize / engine calls.
 * Keep normalization in Application; API mappers may trim early as defense in depth.
 */

export function normalizeReference(value: string): string {
  return value.trim();
}

/** Trim optional reference; blank → undefined (omit from query). */
export function normalizeOptionalReference(
  value: string | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeOptionalTimestamp(
  value: string | undefined,
): string | undefined {
  return normalizeOptionalReference(value);
}
