/**
 * @motanos/permissions — MotanOS RBAC foundation (DEC-002).
 */
export {
  PLATFORM_PERMISSION_KEYS,
  type Permission,
  type PermissionKey,
  type PlatformPermissionKey,
} from "./permissions";
export {
  filterOfficialRoles,
  hasAllRoles,
  hasAnyRole,
  hasRole,
  isClubAdmin,
  isPlatformAdmin,
  isStaffOrAbove,
} from "./rbac";
export {
  OFFICIAL_ROLES,
  PHASE2_FOCUS_ROLES,
  isOfficialRole,
  type OfficialRole,
  type Phase2FocusRole,
} from "./roles";
