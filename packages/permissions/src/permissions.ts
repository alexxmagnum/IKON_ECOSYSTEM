/**
 * Permission key foundation.
 * Concrete matrix keys will expand with docs/27_PERMISSIONS.md.
 */
export type PermissionKey = string;

export type Permission = {
  key: PermissionKey;
  description?: string;
};

/** Placeholder platform-level permission keys (non-exhaustive). */
export const PLATFORM_PERMISSION_KEYS = [
  "platform.admin.access",
  "club.admin.access",
  "staff.operate",
  "member.access",
] as const;

export type PlatformPermissionKey = (typeof PLATFORM_PERMISSION_KEYS)[number];
