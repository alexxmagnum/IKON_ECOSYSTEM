/**
 * Measurement Boundary — measurable value representation (“what measurable value exists”)
 * (not interpretation layers, presentation layers, or technical observation engines).
 *
 * @see DEC-MEASUREMENT-BOUNDARY-001
 */

/** Internal measurement kinds — not interpretation or presentation catalogs. */
export const MEASUREMENT_KINDS = {
  /** Generic measurable value. */
  Value: "measurement.value",
  /** Performance-oriented measurable value. */
  Performance: "measurement.performance",
  /** Commercial / business measurable value. */
  Business: "measurement.business",
  /**
   * Measurement initiated by a Measurement system operation.
   * Not a technical platform problem.
   */
  Operational: "measurement.operational",
  /** Experience measurable value. */
  Experience: "measurement.experience",
  /** Internal MotanOS system measurable value. */
  System: "measurement.system",
  /** Domain measurable value. */
  Domain: "measurement.domain",
} as const;

export type MeasurementKind =
  (typeof MEASUREMENT_KINDS)[keyof typeof MEASUREMENT_KINDS];

export const MEASUREMENT_KIND_VALUES = Object.values(
  MEASUREMENT_KINDS,
) as readonly MeasurementKind[];

/** Measurement status — not interpretation or presentation pipeline state. */
export const MEASUREMENT_STATUSES = {
  Draft: "draft",
  Active: "active",
  Recorded: "recorded",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type MeasurementStatus =
  (typeof MEASUREMENT_STATUSES)[keyof typeof MEASUREMENT_STATUSES];

export const MEASUREMENT_STATUS_VALUES = Object.values(
  MEASUREMENT_STATUSES,
) as readonly MeasurementStatus[];

/**
 * Opaque measurement — measurable value existence only.
 * No interpretation payloads or presentation fields.
 */
export type Measurement = {
  /** Opaque unique measurement reference. */
  measurementReference: string;
  /** Internal measurement kind. */
  measurementKind: MeasurementKind;
  /** Measurement status. */
  measurementStatus: MeasurementStatus;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque entity pointer when known. */
  entityReference?: string;
  /** Opaque entity kind label when known. */
  entityKind?: string;
  /** Opaque occurrence pointer when known. */
  eventReference?: string;
  /** Opaque value pointer when known — not a live number store. */
  valueReference?: string;
  /** Opaque unit pointer when known. */
  unitReference?: string;
  /** Opaque parent measurement pointer when nested. */
  parentMeasurementReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future measurement adapters.
 * Not wired in this foundation — no compute, rollup, or present methods.
 */
export interface MeasurementPort {
  createMeasurement(input: CreateMeasurementInput): Promise<Measurement>;
  resolveMeasurement(measurement: Measurement): Promise<Measurement>;
}

export type CreateMeasurementInput = {
  measurementKind: MeasurementKind;
  measurementStatus?: MeasurementStatus;
  measurementReference?: string;
  contextReference?: string;
  actorReference?: string;
  entityReference?: string;
  entityKind?: string;
  eventReference?: string;
  valueReference?: string;
  unitReference?: string;
  parentMeasurementReference?: string;
  metadata?: Record<string, unknown>;
};

export function isMeasurementKind(value: string): value is MeasurementKind {
  return (MEASUREMENT_KIND_VALUES as readonly string[]).includes(value);
}

export function isMeasurementStatus(
  value: string,
): value is MeasurementStatus {
  return (MEASUREMENT_STATUS_VALUES as readonly string[]).includes(value);
}

function optionalOpaqueOk(
  candidate: Record<string, unknown>,
  key: string,
): boolean {
  const raw = candidate[key];
  return (
    raw === undefined || (typeof raw === "string" && raw.length > 0)
  );
}

export function isMeasurement(value: unknown): value is Measurement {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.measurementReference === "string" &&
    candidate.measurementReference.length > 0 &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "entityReference") &&
    optionalOpaqueOk(candidate, "entityKind") &&
    optionalOpaqueOk(candidate, "eventReference") &&
    optionalOpaqueOk(candidate, "valueReference") &&
    optionalOpaqueOk(candidate, "unitReference") &&
    optionalOpaqueOk(candidate, "parentMeasurementReference") &&
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
