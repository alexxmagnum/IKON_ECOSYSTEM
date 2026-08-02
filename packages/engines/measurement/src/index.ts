/**
 * @motanos/measurement — Measurement Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/measurement
 *
 * Measurement = conceptual measurable values and measure context.
 * Signal packages own what signals occur; presentation layers own how
 * values get shown; exploit vendors own how values get used.
 *
 * Must not depend on signal packages, presentation packages,
 * experience, commerce, resource, or persistence vendors.
 *
 * @see DEC-MEASUREMENT-BOUNDARY-001
 */

export const MEASUREMENT_ENGINE = "@motanos/measurement" as const;

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
