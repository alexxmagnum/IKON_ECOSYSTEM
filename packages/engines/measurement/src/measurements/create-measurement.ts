import type {
  CreateMeasurementInput,
  Measurement,
  MeasurementKind,
  MeasurementStatus,
} from "./measurement";
import {
  MEASUREMENT_STATUSES,
  isMeasurementKind,
  isMeasurementStatus,
} from "./measurement";

let measurementSequence = 0;

export interface CreateMeasurementOptions {
  /**
   * When set, measurement may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a checked Measurement (in-memory — measurable value / context only).
 * Does not open vendor sessions or run rollups / forecasts.
 */
export function createMeasurement(
  input: CreateMeasurementInput,
  options: CreateMeasurementOptions = {},
): Measurement {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const contextReference = input.contextReference?.trim();
  const valueReference = input.valueReference?.trim();
  const unitReference = input.unitReference?.trim();
  const sourceReference = input.sourceReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isMeasurementKind(input.measurementKind)) {
    throw new Error(
      `Unknown measurement kind: ${String(input.measurementKind)}`,
    );
  }

  const measurementStatus: MeasurementStatus =
    input.measurementStatus ?? MEASUREMENT_STATUSES.Draft;
  if (!isMeasurementStatus(measurementStatus)) {
    throw new Error(
      `Unknown measurement status: ${String(input.measurementStatus)}`,
    );
  }

  if (input.entityReference !== undefined && !entityReference) {
    throw new Error("entityReference must not be empty when provided");
  }
  if (input.entityKind !== undefined && !entityKind) {
    throw new Error("entityKind must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.valueReference !== undefined && !valueReference) {
    throw new Error("valueReference must not be empty when provided");
  }
  if (input.unitReference !== undefined && !unitReference) {
    throw new Error("unitReference must not be empty when provided");
  }
  if (input.sourceReference !== undefined && !sourceReference) {
    throw new Error("sourceReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("measurement does not apply to this tenant");
  }

  const providedReference = input.measurementReference?.trim() ?? "";
  if (input.measurementReference !== undefined && !providedReference) {
    throw new Error(
      "measurementReference must not be empty when provided",
    );
  }

  const measurementKind: MeasurementKind = input.measurementKind;
  const measurementReference =
    providedReference || allocateMeasurementReference();

  return {
    measurementReference,
    tenantReference,
    measurementKind,
    measurementStatus,
    ...(entityReference !== undefined && entityReference.length > 0
      ? { entityReference }
      : {}),
    ...(entityKind !== undefined && entityKind.length > 0
      ? { entityKind }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(valueReference !== undefined && valueReference.length > 0
      ? { valueReference }
      : {}),
    ...(unitReference !== undefined && unitReference.length > 0
      ? { unitReference }
      : {}),
    ...(sourceReference !== undefined && sourceReference.length > 0
      ? { sourceReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateMeasurementReference(): string {
  measurementSequence += 1;
  return `measurement-${measurementSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetMeasurementReferenceSequence(): void {
  measurementSequence = 0;
}
