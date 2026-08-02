/**
 * Measurement Engine Boundary — conceptual measurable values / measure context
 * (not signal packages, presentation layers, or exploit / forecast vendors).
 *
 * @see DEC-MEASUREMENT-BOUNDARY-001
 */

/** Internal measurement kinds — not vendor metric catalogs. */
export const MEASUREMENT_KINDS = {
  /**
   * Measurement initiated by a Measurement system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "measurement.operational",
  /** Performance-oriented measurable value. */
  Performance: "measurement.performance",
  /** Capacity-oriented measurable value. */
  Capacity: "measurement.capacity",
  /** Financial measurable value. */
  Financial: "measurement.financial",
  /** Usage-oriented measurable value. */
  Usage: "measurement.usage",
  /** Quality-oriented measurable value. */
  Quality: "measurement.quality",
} as const;

export type MeasurementKind =
  (typeof MEASUREMENT_KINDS)[keyof typeof MEASUREMENT_KINDS];

export const MEASUREMENT_KIND_VALUES = Object.values(
  MEASUREMENT_KINDS,
) as readonly MeasurementKind[];

/** Measurement status — not signal or presentation pipeline state. */
export const MEASUREMENT_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type MeasurementStatus =
  (typeof MEASUREMENT_STATUSES)[keyof typeof MEASUREMENT_STATUSES];

export const MEASUREMENT_STATUS_VALUES = Object.values(
  MEASUREMENT_STATUSES,
) as readonly MeasurementStatus[];

/**
 * Opaque measurement — measurable value reference only.
 * No credential material or live vendor payloads.
 */
export interface Measurement {
  /** Opaque unique measurement reference. */
  measurementReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal measurement kind. */
  measurementKind: MeasurementKind;
  /** Measurement status. */
  measurementStatus: MeasurementStatus;
  /** Opaque entity pointer when known. */
  entityReference?: string;
  /** Opaque entity kind label when known. */
  entityKind?: string;
  /** Opaque measure-context pointer when known. */
  contextReference?: string;
  /** Opaque value pointer when known — not a live number store. */
  valueReference?: string;
  /** Opaque unit pointer when known. */
  unitReference?: string;
  /** Opaque source pointer when known. */
  sourceReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future measurement adapters (Runtime).
 * Not wired in this foundation — no compute, rollup, or present methods.
 */
export interface MeasurementPort {
  createMeasurement(input: CreateMeasurementInput): Promise<Measurement>;
  resolveMeasurement(measurement: Measurement): Promise<Measurement>;
}

export interface CreateMeasurementInput {
  tenantReference: string;
  measurementKind: MeasurementKind;
  measurementStatus?: MeasurementStatus;
  measurementReference?: string;
  entityReference?: string;
  entityKind?: string;
  contextReference?: string;
  valueReference?: string;
  unitReference?: string;
  sourceReference?: string;
  metadata?: Record<string, unknown>;
}

export function isMeasurementKind(value: string): value is MeasurementKind {
  return (MEASUREMENT_KIND_VALUES as readonly string[]).includes(value);
}

export function isMeasurementStatus(
  value: string,
): value is MeasurementStatus {
  return (MEASUREMENT_STATUS_VALUES as readonly string[]).includes(value);
}

export function isMeasurement(value: unknown): value is Measurement {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const entityOk =
    candidate.entityReference === undefined ||
    (typeof candidate.entityReference === "string" &&
      candidate.entityReference.length > 0);
  const entityKindOk =
    candidate.entityKind === undefined ||
    (typeof candidate.entityKind === "string" &&
      candidate.entityKind.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const valueOk =
    candidate.valueReference === undefined ||
    (typeof candidate.valueReference === "string" &&
      candidate.valueReference.length > 0);
  const unitOk =
    candidate.unitReference === undefined ||
    (typeof candidate.unitReference === "string" &&
      candidate.unitReference.length > 0);
  const sourceOk =
    candidate.sourceReference === undefined ||
    (typeof candidate.sourceReference === "string" &&
      candidate.sourceReference.length > 0);
  return (
    typeof candidate.measurementReference === "string" &&
    candidate.measurementReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    entityOk &&
    entityKindOk &&
    contextOk &&
    valueOk &&
    unitOk &&
    sourceOk &&
    typeof candidate.measurementKind === "string" &&
    isMeasurementKind(candidate.measurementKind) &&
    typeof candidate.measurementStatus === "string" &&
    isMeasurementStatus(candidate.measurementStatus)
  );
}

export function isMeasurementPort(value: unknown): value is MeasurementPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as MeasurementPort).createMeasurement === "function" &&
    typeof (value as MeasurementPort).resolveMeasurement === "function"
  );
}
