import type {
  CreateResourceInput,
  Resource,
  ResourceKind,
  ResourceStatus,
} from "./resource";
import {
  RESOURCE_STATUSES,
  isResourceKind,
  isResourceStatus,
} from "./resource";

let resourceSequence = 0;

export interface CreateResourceOptions {
  /**
   * When set, resource may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated Resource (in-memory — definition only).
 * Does not check availability, create bookings, or persist.
 */
export function createResource(
  input: CreateResourceInput,
  options: CreateResourceOptions = {},
): Resource {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const parentResourceReference = input.parentResourceReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isResourceKind(input.resourceKind)) {
    throw new Error(`Unknown resource kind: ${String(input.resourceKind)}`);
  }

  const resourceStatus: ResourceStatus =
    input.resourceStatus ?? RESOURCE_STATUSES.Draft;
  if (!isResourceStatus(resourceStatus)) {
    throw new Error(
      `Unknown resource status: ${String(input.resourceStatus)}`,
    );
  }

  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.descriptionReference !== undefined && !descriptionReference) {
    throw new Error("descriptionReference must not be empty when provided");
  }
  if (
    input.parentResourceReference !== undefined &&
    !parentResourceReference
  ) {
    throw new Error(
      "parentResourceReference must not be empty when provided",
    );
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("resource does not apply to this tenant");
  }

  const providedReference = input.resourceReference?.trim() ?? "";
  if (input.resourceReference !== undefined && !providedReference) {
    throw new Error("resourceReference must not be empty when provided");
  }

  const resourceKind: ResourceKind = input.resourceKind;
  const resourceReference = providedReference || allocateResourceReference();

  return {
    resourceReference,
    tenantReference,
    resourceKind,
    resourceStatus,
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(descriptionReference !== undefined && descriptionReference.length > 0
      ? { descriptionReference }
      : {}),
    ...(parentResourceReference !== undefined &&
    parentResourceReference.length > 0
      ? { parentResourceReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateResourceReference(): string {
  resourceSequence += 1;
  return `resource-${resourceSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetResourceReferenceSequence(): void {
  resourceSequence = 0;
}
