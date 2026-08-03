import type {
  BookingResource,
  BookingResourceKind,
  CreateBookingResourceInput,
} from "./booking-resource";
import { isBookingResourceKind } from "./booking-resource";

let resourceSequence = 0;

/**
 * Build a validated BookingResource (in-memory — no inventory / ERP I/O).
 */
export function createBookingResource(
  input: CreateBookingResourceInput,
): BookingResource {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const resourceName = input.resourceName?.trim();

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isBookingResourceKind(input.resourceKind)) {
    throw new Error(
      `Unknown booking resource kind: ${String(input.resourceKind)}`,
    );
  }
  if (input.resourceName !== undefined && !resourceName) {
    throw new Error("resourceName must not be empty when provided");
  }

  const resourceKind: BookingResourceKind = input.resourceKind;
  const resourceReference =
    input.resourceReference?.trim() || allocateResourceReference();

  if (!resourceReference) {
    throw new Error("resourceReference is required");
  }

  return {
    resourceReference,
    tenantReference,
    resourceKind,
    ...(resourceName !== undefined && resourceName.length > 0
      ? { resourceName }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

/**
 * Tenant isolation helper for resources (DEC-BOOKING-TENANT-001).
 */
export function resourceBelongsToTenant(
  resource: BookingResource,
  tenantReference: string,
): boolean {
  const expected = tenantReference.trim();
  if (!expected) {
    return false;
  }
  return resource.tenantReference === expected;
}

function allocateResourceReference(): string {
  resourceSequence += 1;
  return `resource-${resourceSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingResourceReferenceSequence(): void {
  resourceSequence = 0;
}
