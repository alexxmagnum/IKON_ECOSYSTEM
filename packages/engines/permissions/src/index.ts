/**
 * @motanos/permissions — Permissions Engine Boundary foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/permissions
 *
 * Permissions = action-capacity existence for an actor in a context.
 * Must not depend on identity packages, belonging packages, sign-in packages,
 * process packages, or rule-engine packages.
 *
 * Historical capacity-check / RBAC motor lives in the
 * permissions-lifecycle package.
 *
 * @see DEC-PERMISSIONS-BOUNDARY-001
 */

export const PERMISSIONS_ENGINE = "@motanos/permissions" as const;

export type {
  CreatePermissionInput,
  CreatePermissionOptions,
  Permission,
  PermissionKind,
  PermissionPort,
  PermissionStatus,
} from "./permissions";
export {
  PERMISSION_KINDS,
  PERMISSION_KIND_VALUES,
  PERMISSION_SEAT_REF_KEY,
  PERMISSION_STATUSES,
  PERMISSION_STATUS_VALUES,
  createPermission,
  isPermission,
  isPermissionKind,
  isPermissionPort,
  isPermissionStatus,
  resetPermissionReferenceSequence,
} from "./permissions";
