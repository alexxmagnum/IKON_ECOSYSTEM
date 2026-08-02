import type {
  CreateTenantInput,
  Tenant,
  TenantKind,
  TenantStatus,
} from "./tenant";
import {
  TENANT_STATUSES,
  isTenantKind,
  isTenantStatus,
} from "./tenant";

let tenantSequence = 0;

export interface CreateTenantOptions {
  /**
   * When set, tenant may only be created with this exact reference
   * (cross-context isolation for root tenant identity).
   */
  tenantReference?: string;
}

/**
 * Build a validated Tenant (in-memory — organization / lifecycle only).
 * Does not create people, open sign-in sessions, or activate invoicing.
 */
export function createTenant(
  input: CreateTenantInput,
  options: CreateTenantOptions = {},
): Tenant {
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const parentTenantReference = input.parentTenantReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!isTenantKind(input.tenantKind)) {
    throw new Error(`Unknown tenant kind: ${String(input.tenantKind)}`);
  }

  const tenantStatus: TenantStatus =
    input.tenantStatus ?? TENANT_STATUSES.Draft;
  if (!isTenantStatus(tenantStatus)) {
    throw new Error(`Unknown tenant status: ${String(input.tenantStatus)}`);
  }

  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.descriptionReference !== undefined && !descriptionReference) {
    throw new Error("descriptionReference must not be empty when provided");
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }
  if (input.parentTenantReference !== undefined && !parentTenantReference) {
    throw new Error("parentTenantReference must not be empty when provided");
  }

  const providedReference = input.tenantReference?.trim() ?? "";
  if (input.tenantReference !== undefined && !providedReference) {
    throw new Error("tenantReference is required");
  }

  const tenantKind: TenantKind = input.tenantKind;
  const tenantReference =
    providedReference || allocateTenantReference();

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("tenant does not apply to this context");
  }

  return {
    tenantReference,
    tenantKind,
    tenantStatus,
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(descriptionReference !== undefined && descriptionReference.length > 0
      ? { descriptionReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
      : {}),
    ...(parentTenantReference !== undefined &&
    parentTenantReference.length > 0
      ? { parentTenantReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateTenantReference(): string {
  tenantSequence += 1;
  return `tenant-${tenantSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetTenantReferenceSequence(): void {
  tenantSequence = 0;
}
