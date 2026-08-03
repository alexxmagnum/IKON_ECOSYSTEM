import type {
  CreatePermissionInput,
  Permission,
  PermissionKind,
  PermissionStatus,
} from "./permission";
import {
  PERMISSION_SEAT_REF_KEY,
  PERMISSION_STATUSES,
  isPermissionKind,
  isPermissionStatus,
} from "./permission";

let permissionSequence = 0;

export interface CreatePermissionOptions {
  /**
   * When set, permission may only be created for this tenant
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked Permission (in-memory — action-capacity existence only).
 * Does not open person profiles, assign seats, or run process flows.
 */
export function createPermission(
  input: CreatePermissionInput,
  options: CreatePermissionOptions = {},
): Permission {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const identityReference = input.identityReference?.trim();
  const membershipReference = input.membershipReference?.trim();
  const resourceReference = input.resourceReference?.trim();
  const actionReference = input.actionReference?.trim();
  const contextReference = input.contextReference?.trim();
  const parentPermissionReference = input.parentPermissionReference?.trim();
  const seatRaw = input[PERMISSION_SEAT_REF_KEY];
  const seatReference =
    typeof seatRaw === "string" ? seatRaw.trim() : undefined;
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isPermissionKind(input.permissionKind)) {
    throw new Error(
      `Unknown permission kind: ${String(input.permissionKind)}`,
    );
  }

  const permissionStatus: PermissionStatus =
    input.permissionStatus ?? PERMISSION_STATUSES.Draft;
  if (!isPermissionStatus(permissionStatus)) {
    throw new Error(
      `Unknown permission status: ${String(input.permissionStatus)}`,
    );
  }

  if (input.identityReference !== undefined && !identityReference) {
    throw new Error("identityReference must not be empty when provided");
  }
  if (input.membershipReference !== undefined && !membershipReference) {
    throw new Error("membershipReference must not be empty when provided");
  }
  if (input.resourceReference !== undefined && !resourceReference) {
    throw new Error("resourceReference must not be empty when provided");
  }
  if (input.actionReference !== undefined && !actionReference) {
    throw new Error("actionReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (
    input.parentPermissionReference !== undefined &&
    !parentPermissionReference
  ) {
    throw new Error(
      "parentPermissionReference must not be empty when provided",
    );
  }
  if (seatRaw !== undefined && !seatReference) {
    throw new Error(
      `${PERMISSION_SEAT_REF_KEY} must not be empty when provided`,
    );
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("permission does not apply to this tenant");
  }

  const providedReference = input.permissionReference?.trim() ?? "";
  if (input.permissionReference !== undefined && !providedReference) {
    throw new Error("permissionReference must not be empty when provided");
  }

  const permissionKind: PermissionKind = input.permissionKind;
  const permissionReference =
    providedReference || allocatePermissionReference();

  return {
    permissionReference,
    tenantReference,
    permissionKind,
    permissionStatus,
    ...(identityReference !== undefined && identityReference.length > 0
      ? { identityReference }
      : {}),
    ...(membershipReference !== undefined && membershipReference.length > 0
      ? { membershipReference }
      : {}),
    ...(resourceReference !== undefined && resourceReference.length > 0
      ? { resourceReference }
      : {}),
    ...(actionReference !== undefined && actionReference.length > 0
      ? { actionReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(parentPermissionReference !== undefined &&
    parentPermissionReference.length > 0
      ? { parentPermissionReference }
      : {}),
    ...(seatReference !== undefined && seatReference.length > 0
      ? { [PERMISSION_SEAT_REF_KEY]: seatReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocatePermissionReference(): string {
  permissionSequence += 1;
  return `permission-${permissionSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetPermissionReferenceSequence(): void {
  permissionSequence = 0;
}
