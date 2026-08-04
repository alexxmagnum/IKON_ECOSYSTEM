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
   * When set, measurement may only be created for this ambit
   * (cross-context isolation).
   */
  contextReference?: string;
}

/**
 * Build a checked Measurement (in-memory — measurable value existence only).
 * Does not interpret, present, roll up, or observe systems technically.
 */
export function createMeasurement(
  input: CreateMeasurementInput,
  options: CreateMeasurementOptions = {},
): Measurement {
  const contextReference = input.contextReference?.trim();
  const actorReference = input.actorReference?.trim();
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const eventReference = input.eventReference?.trim();
  const valueReference = input.valueReference?.trim();
  const unitReference = input.unitReference?.trim();
  const parentMeasurementReference =
    input.parentMeasurementReference?.trim();
  const boundContext = options.contextReference?.trim() || undefined;

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

  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.entityReference !== undefined && !entityReference) {
    throw new Error("entityReference must not be empty when provided");
  }
  if (input.entityKind !== undefined && !entityKind) {
    throw new Error("entityKind must not be empty when provided");
  }
  if (input.eventReference !== undefined && !eventReference) {
    throw new Error("eventReference must not be empty when provided");
  }
  if (input.valueReference !== undefined && !valueReference) {
    throw new Error("valueReference must not be empty when provided");
  }
  if (input.unitReference !== undefined && !unitReference) {
    throw new Error("unitReference must not be empty when provided");
  }
  if (
    input.parentMeasurementReference !== undefined &&
    !parentMeasurementReference
  ) {
    throw new Error(
      "parentMeasurementReference must not be empty when provided",
    );
  }

  if (
    boundContext !== undefined &&
    (contextReference === undefined || contextReference !== boundContext)
  ) {
    throw new Error("measurement does not apply to this scope");
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
    measurementKind,
    measurementStatus,
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(entityReference !== undefined && entityReference.length > 0
      ? { entityReference }
      : {}),
    ...(entityKind !== undefined && entityKind.length > 0
      ? { entityKind }
      : {}),
    ...(eventReference !== undefined && eventReference.length > 0
      ? { eventReference }
      : {}),
    ...(valueReference !== undefined && valueReference.length > 0
      ? { valueReference }
      : {}),
    ...(unitReference !== undefined && unitReference.length > 0
      ? { unitReference }
      : {}),
    ...(parentMeasurementReference !== undefined &&
    parentMeasurementReference.length > 0
      ? { parentMeasurementReference }
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
