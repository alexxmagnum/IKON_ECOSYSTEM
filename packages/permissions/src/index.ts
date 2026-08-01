/**
 * @motanos/permissions — RBAC types aligned to DEC-002.
 * No authorization engine yet (bootstrap only).
 */
export const OFFICIAL_ROLES = [
  "Guest",
  "Member",
  "Socio",
  "Organizer",
  "Staff",
  "Manager",
  "Club Admin",
  "Platform Admin",
] as const;

export type OfficialRole = (typeof OFFICIAL_ROLES)[number];
