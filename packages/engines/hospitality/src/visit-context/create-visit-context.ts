import type {
  CreateVisitContextInput,
  HospitalityVisitContext,
  VisitContextKind,
  VisitContextStatus,
} from "./visit-context";
import {
  VISIT_CONTEXT_STATUSES,
  isVisitContextKind,
  isVisitContextStatus,
} from "./visit-context";

let visitContextSequence = 0;

export interface CreateVisitContextOptions {
  /**
   * When set, context may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityVisitContext (in-memory — ambient setting only).
 * Does not bind rooms, open tickets, open tills, or hold areas.
 */
export function createVisitContext(
  input: CreateVisitContextInput,
  options: CreateVisitContextOptions = {},
): HospitalityVisitContext {
  const hospitalityReference = input.hospitalityReference?.trim();
  const visitReference = input.visitReference?.trim();
  const locationReference = input.locationReference?.trim();
  const areaReference = input.areaReference?.trim();
  const zoneReference = input.zoneReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const parentContextReference = input.parentContextReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isVisitContextKind(input.contextKind)) {
    throw new Error(
      `Unknown visit-context kind: ${String(input.contextKind)}`,
    );
  }

  const contextStatus: VisitContextStatus =
    input.contextStatus ?? VISIT_CONTEXT_STATUSES.Draft;
  if (!isVisitContextStatus(contextStatus)) {
    throw new Error(
      `Unknown visit-context status: ${String(input.contextStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.visitReference !== undefined && !visitReference) {
    throw new Error("visitReference must not be empty when provided");
  }
  if (input.locationReference !== undefined && !locationReference) {
    throw new Error("locationReference must not be empty when provided");
  }
  if (input.areaReference !== undefined && !areaReference) {
    throw new Error("areaReference must not be empty when provided");
  }
  if (input.zoneReference !== undefined && !zoneReference) {
    throw new Error("zoneReference must not be empty when provided");
  }
  if (input.experienceReference !== undefined && !experienceReference) {
    throw new Error(
      "experienceReference must not be empty when provided",
    );
  }
  if (
    input.parentContextReference !== undefined &&
    !parentContextReference
  ) {
    throw new Error(
      "parentContextReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "visit context does not apply to this hospitality business",
    );
  }

  const providedReference = input.contextReference?.trim() ?? "";
  if (input.contextReference !== undefined && !providedReference) {
    throw new Error(
      "contextReference must not be empty when provided",
    );
  }

  const contextKind: VisitContextKind = input.contextKind;
  const contextReference =
    providedReference || allocateVisitContextReference();

  return {
    contextReference,
    contextKind,
    contextStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(visitReference !== undefined && visitReference.length > 0
      ? { visitReference }
      : {}),
    ...(locationReference !== undefined && locationReference.length > 0
      ? { locationReference }
      : {}),
    ...(areaReference !== undefined && areaReference.length > 0
      ? { areaReference }
      : {}),
    ...(zoneReference !== undefined && zoneReference.length > 0
      ? { zoneReference }
      : {}),
    ...(experienceReference !== undefined && experienceReference.length > 0
      ? { experienceReference }
      : {}),
    ...(parentContextReference !== undefined &&
    parentContextReference.length > 0
      ? { parentContextReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateVisitContextReference(): string {
  visitContextSequence += 1;
  return `visit-context-${visitContextSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetVisitContextReferenceSequence(): void {
  visitContextSequence = 0;
}
