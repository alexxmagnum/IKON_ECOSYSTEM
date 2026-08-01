/**
 * Official MotanOS roles (DEC-002).
 * Do not invent parallel role names.
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

/**
 * Operational role set emphasized in Phase 2 Core Foundation.
 * Full DEC-002 catalog remains canonical above.
 */
export const PHASE2_FOCUS_ROLES = [
  "Platform Admin",
  "Club Admin",
  "Staff",
  "Member",
] as const satisfies readonly OfficialRole[];

export type Phase2FocusRole = (typeof PHASE2_FOCUS_ROLES)[number];

export function isOfficialRole(value: string): value is OfficialRole {
  return (OFFICIAL_ROLES as readonly string[]).includes(value);
}
