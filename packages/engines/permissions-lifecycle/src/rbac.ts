import type { OfficialRole } from "./roles";
import { isOfficialRole } from "./roles";

/**
 * Pure RBAC helpers — no database I/O in Phase 2.
 */
export function hasRole(
  assignedRoles: readonly string[],
  role: OfficialRole,
): boolean {
  return assignedRoles.includes(role);
}

export function hasAnyRole(
  assignedRoles: readonly string[],
  roles: readonly OfficialRole[],
): boolean {
  return roles.some((role) => assignedRoles.includes(role));
}

export function hasAllRoles(
  assignedRoles: readonly string[],
  roles: readonly OfficialRole[],
): boolean {
  return roles.every((role) => assignedRoles.includes(role));
}

export function filterOfficialRoles(assignedRoles: readonly string[]): OfficialRole[] {
  return assignedRoles.filter(isOfficialRole);
}

export function isStaffOrAbove(assignedRoles: readonly string[]): boolean {
  return hasAnyRole(assignedRoles, ["Staff", "Manager", "Club Admin", "Platform Admin"]);
}

export function isClubAdmin(assignedRoles: readonly string[]): boolean {
  return hasRole(assignedRoles, "Club Admin");
}

export function isPlatformAdmin(assignedRoles: readonly string[]): boolean {
  return hasRole(assignedRoles, "Platform Admin");
}
