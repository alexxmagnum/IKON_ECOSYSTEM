import type {
  Availability,
  AvailabilityKind,
  AvailabilityStatus,
  CreateAvailabilityInput,
} from "./availability";
import {
  AVAILABILITY_ITEM_REF_KEY,
  AVAILABILITY_STATUSES,
  AVAILABILITY_UNIT_REF_KEY,
  isAvailabilityKind,
  isAvailabilityStatus,
} from "./availability";

let availabilitySequence = 0;

export interface CreateAvailabilityOptions {
  /**
   * When set, availability may only be created for this tenant
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked Availability (in-memory — open-slot existence only).
 * Does not open vendor sessions or run hold / claim / timeline sync flows.
 */
export function createAvailability(
  input: CreateAvailabilityInput,
  options: CreateAvailabilityOptions = {},
): Availability {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const contextReference = input.contextReference?.trim();
  const scheduleReference = input.scheduleReference?.trim();
  const dateReference = input.dateReference?.trim();
  const timeReference = input.timeReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const parentAvailabilityReference =
    input.parentAvailabilityReference?.trim();
  const itemRaw = input[AVAILABILITY_ITEM_REF_KEY];
  const itemReference =
    typeof itemRaw === "string" ? itemRaw.trim() : undefined;
  const unitRaw = input[AVAILABILITY_UNIT_REF_KEY];
  const unitReference =
    typeof unitRaw === "string" ? unitRaw.trim() : undefined;
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

  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.scheduleReference !== undefined && !scheduleReference) {
    throw new Error("scheduleReference must not be empty when provided");
  }
  if (input.dateReference !== undefined && !dateReference) {
    throw new Error("dateReference must not be empty when provided");
  }
  if (input.timeReference !== undefined && !timeReference) {
    throw new Error("timeReference must not be empty when provided");
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }
  if (
    input.parentAvailabilityReference !== undefined &&
    !parentAvailabilityReference
  ) {
    throw new Error(
      "parentAvailabilityReference must not be empty when provided",
    );
  }
  if (itemRaw !== undefined && !itemReference) {
    throw new Error(
      `${AVAILABILITY_ITEM_REF_KEY} must not be empty when provided`,
    );
  }
  if (unitRaw !== undefined && !unitReference) {
    throw new Error(
      `${AVAILABILITY_UNIT_REF_KEY} must not be empty when provided`,
    );
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
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(scheduleReference !== undefined && scheduleReference.length > 0
      ? { scheduleReference }
      : {}),
    ...(dateReference !== undefined && dateReference.length > 0
      ? { dateReference }
      : {}),
    ...(timeReference !== undefined && timeReference.length > 0
      ? { timeReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
      : {}),
    ...(parentAvailabilityReference !== undefined &&
    parentAvailabilityReference.length > 0
      ? { parentAvailabilityReference }
      : {}),
    ...(itemReference !== undefined && itemReference.length > 0
      ? { [AVAILABILITY_ITEM_REF_KEY]: itemReference }
      : {}),
    ...(unitReference !== undefined && unitReference.length > 0
      ? { [AVAILABILITY_UNIT_REF_KEY]: unitReference }
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
