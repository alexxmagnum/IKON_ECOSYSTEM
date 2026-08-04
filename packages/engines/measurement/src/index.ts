/**
 * @motanos/measurement — Measurement Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/measurement
 *
 * Measurement = what measurable value exists.
 * Must not depend on interpretation packages, presentation packages,
 * recorded-fact packages, or technical observation engines.
 *
 * @see DEC-MEASUREMENT-BOUNDARY-001
 */

export const MEASUREMENT_BOUNDARY = "@motanos/measurement" as const;

export type {
  CreateMeasurementInput,
  CreateMeasurementOptions,
  Measurement,
  MeasurementKind,
  MeasurementPort,
  MeasurementStatus,
} from "./measurements";
export {
  MEASUREMENT_KINDS,
  MEASUREMENT_KIND_VALUES,
  MEASUREMENT_STATUSES,
  MEASUREMENT_STATUS_VALUES,
  createMeasurement,
  isMeasurement,
  isMeasurementKind,
  isMeasurementPort,
  isMeasurementStatus,
  resetMeasurementReferenceSequence,
} from "./measurements";
