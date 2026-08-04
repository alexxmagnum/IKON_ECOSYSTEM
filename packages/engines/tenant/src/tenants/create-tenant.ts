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
   * (cross-context isolation for root tenant scope).
   */
  tenantReference?: string;
}

/**
 * Build a checked Tenant (in-memory — tenant existence only).
 * Does not create people, open sign-in sessions, or activate economic records.
 */
export function createTenant(
  input: CreateTenantInput,
  options: CreateTenantOptions = {},
): Tenant {
  const organizationReference = input.organizationReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const parentTenantReference = input.parentTenantReference?.trim();
  const contextReference = input.contextReference?.trim();
  const regionReference = input.regionReference?.trim();
  const planReference = input.planReference?.trim();
  const configurationReference = input.configurationReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!isTenantKind(input.tenantKind)) {
    throw new Error(`Unknown tenant kind: ${String(input.tenantKind)}`);
  }

  const tenantStatus: TenantStatus =
    input.tenantStatus ?? TENANT_STATUSES.Draft;
  if (!isTenantStatus(tenantStatus)) {
    throw new Error(`Unknown tenant status: ${String(input.tenantStatus)}`);
  }

  if (input.organizationReference !== undefined && !organizationReference) {
    throw new Error("organizationReference must not be empty when provided");
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }
  if (input.parentTenantReference !== undefined && !parentTenantReference) {
    throw new Error("parentTenantReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.regionReference !== undefined && !regionReference) {
    throw new Error("regionReference must not be empty when provided");
  }
  if (input.planReference !== undefined && !planReference) {
    throw new Error("planReference must not be empty when provided");
  }
  if (input.configurationReference !== undefined && !configurationReference) {
    throw new Error(
      "configurationReference must not be empty when provided",
    );
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
    ...(organizationReference !== undefined && organizationReference.length > 0
      ? { organizationReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
      : {}),
    ...(parentTenantReference !== undefined &&
    parentTenantReference.length > 0
      ? { parentTenantReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(regionReference !== undefined && regionReference.length > 0
      ? { regionReference }
      : {}),
    ...(planReference !== undefined && planReference.length > 0
      ? { planReference }
      : {}),
    ...(configurationReference !== undefined &&
    configurationReference.length > 0
      ? { configurationReference }
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
