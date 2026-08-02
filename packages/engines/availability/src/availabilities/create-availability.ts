import type {
  Availability,
  AvailabilityKind,
  AvailabilityStatus,
  CreateAvailabilityInput,
} from "./availability";
import {
  AVAILABILITY_STATUSES,
  isAvailabilityKind,
  isAvailabilityStatus,
} from "./availability";

let availabilitySequence = 0;

export interface CreateAvailabilityOptions {
  /**
   * When set, availability may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated Availability (in-memory — rule definition only).
 * Does not look up free time, generate intervals, or block assets.
 */
export function createAvailability(
  input: CreateAvailabilityInput,
  options: CreateAvailabilityOptions = {},
): Availability {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const resourceReference = input.resourceReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const scheduleReference = input.scheduleReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isAvailabilityKind(input.availabilityKind)) {
    throw new Error(
      `Unknown availability kind: ${String(input.availabilityKind)}`,
    );
  }

  const availabilityStatus: AvailabilityStatus =
    input.availabilityStatus ?? AVAILABILITY_STATUSES.Draft;
  if (!isAvailabilityStatus(availabilityStatus)) {
    throw new Error(
      `Unknown availability status: ${String(input.availabilityStatus)}`,
    );
  }

  if (input.resourceReference !== undefined && !resourceReference) {
    throw new Error("resourceReference must not be empty when provided");
  }
  if (input.experienceReference !== undefined && !experienceReference) {
    throw new Error("experienceReference must not be empty when provided");
  }
  if (input.scheduleReference !== undefined && !scheduleReference) {
    throw new Error("scheduleReference must not be empty when provided");
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("availability does not apply to this tenant");
  }

  const providedReference = input.availabilityReference?.trim() ?? "";
  if (input.availabilityReference !== undefined && !providedReference) {
    throw new Error("availabilityReference must not be empty when provided");
  }

  const availabilityKind: AvailabilityKind = input.availabilityKind;
  const availabilityReference =
    providedReference || allocateAvailabilityReference();

  return {
    availabilityReference,
    tenantReference,
    availabilityKind,
    availabilityStatus,
    ...(resourceReference !== undefined && resourceReference.length > 0
      ? { resourceReference }
      : {}),
    ...(experienceReference !== undefined && experienceReference.length > 0
      ? { experienceReference }
      : {}),
    ...(scheduleReference !== undefined && scheduleReference.length > 0
      ? { scheduleReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateAvailabilityReference(): string {
  availabilitySequence += 1;
  return `availability-${availabilitySequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetAvailabilityReferenceSequence(): void {
  availabilitySequence = 0;
}
