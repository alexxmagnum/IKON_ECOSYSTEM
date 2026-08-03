import type {
  CreateResourceInput,
  Resource,
  ResourceKind,
  ResourceStatus,
} from "./resource";
import {
  RESOURCE_ITEM_REF_KEY,
  RESOURCE_STATUSES,
  isResourceKind,
  isResourceStatus,
} from "./resource";

let resourceSequence = 0;

export interface CreateResourceOptions {
  /**
   * When set, resource may only be created for this tenant
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked Resource (in-memory — operational unit existence only).
 * Does not open vendor sessions or run claim / hold / stock sync flows.
 */
export function createResource(
  input: CreateResourceInput,
  options: CreateResourceOptions = {},
): Resource {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const contextReference = input.contextReference?.trim();
  const parentResourceReference = input.parentResourceReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const locationReference = input.locationReference?.trim();
  const categoryReference = input.categoryReference?.trim();
  const assetReference = input.assetReference?.trim();
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const itemRaw = input[RESOURCE_ITEM_REF_KEY];
  const itemReference =
    typeof itemRaw === "string" ? itemRaw.trim() : undefined;
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

  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
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
  if (input.locationReference !== undefined && !locationReference) {
    throw new Error("locationReference must not be empty when provided");
  }
  if (input.categoryReference !== undefined && !categoryReference) {
    throw new Error("categoryReference must not be empty when provided");
  }
  if (input.assetReference !== undefined && !assetReference) {
    throw new Error("assetReference must not be empty when provided");
  }
  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.descriptionReference !== undefined && !descriptionReference) {
    throw new Error("descriptionReference must not be empty when provided");
  }
  if (itemRaw !== undefined && !itemReference) {
    throw new Error(
      `${RESOURCE_ITEM_REF_KEY} must not be empty when provided`,
    );
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
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(parentResourceReference !== undefined &&
    parentResourceReference.length > 0
      ? { parentResourceReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
      : {}),
    ...(locationReference !== undefined && locationReference.length > 0
      ? { locationReference }
      : {}),
    ...(categoryReference !== undefined && categoryReference.length > 0
      ? { categoryReference }
      : {}),
    ...(assetReference !== undefined && assetReference.length > 0
      ? { assetReference }
      : {}),
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(descriptionReference !== undefined && descriptionReference.length > 0
      ? { descriptionReference }
      : {}),
    ...(itemReference !== undefined && itemReference.length > 0
      ? { [RESOURCE_ITEM_REF_KEY]: itemReference }
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
