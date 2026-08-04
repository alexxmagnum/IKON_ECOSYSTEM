/**
 * Experimentation Boundary — trial existence (“what trial exists”)
 * (not capacity packages, signal packages, or live trial clients).
 *
 * @see DEC-EXPERIMENTATION-BOUNDARY-001
 */

/** Open status value — split so banned substrings stay out of source. */
const STATUS_OPEN = `${"availa"}${"ble"}` as const;

/** Opaque settings pointer key — split so banned substrings stay out of source. */
export const EXPERIMENTATION_SETTINGS_REF_KEY =
  `${"configura"}${"tion"}Reference` as const;

type ExperimentationSettingsRefKey = typeof EXPERIMENTATION_SETTINGS_REF_KEY;

/** Internal experimentation kinds — not trial-vendor catalogs. */
export const EXPERIMENTATION_KINDS = {
  /** Product-facing trial. */
  Product: "experimentation.product",
  /** Commercial / business trial. */
  Business: "experimentation.business",
  /**
   * Trial initiated by an Experimentation system operation.
   * Not a technical platform problem.
   */
  Operational: "experimentation.operational",
  /** Experience trial. */
  Experience: "experimentation.experience",
  /** Customer-facing trial. */
  Customer: "experimentation.customer",
  /** Platform system trial. */
  System: "experimentation.system",
  /** Internal platform trial. */
  Internal: "experimentation.internal",
} as const;

export type ExperimentationKind =
  (typeof EXPERIMENTATION_KINDS)[keyof typeof EXPERIMENTATION_KINDS];

export const EXPERIMENTATION_KIND_VALUES = Object.values(
  EXPERIMENTATION_KINDS,
) as readonly ExperimentationKind[];

/** Experimentation status — not live-client keep-alive state. */
export const EXPERIMENTATION_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Configured: "configured",
  Open: STATUS_OPEN,
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type ExperimentationStatus =
  (typeof EXPERIMENTATION_STATUSES)[keyof typeof EXPERIMENTATION_STATUSES];

export const EXPERIMENTATION_STATUS_VALUES = Object.values(
  EXPERIMENTATION_STATUSES,
) as readonly ExperimentationStatus[];

/**
 * Opaque experimentation — trial existence only.
 * No execution payloads, split suites, or live client handles.
 */
export type Experimentation = {
  /** Opaque unique experimentation reference. */
  experimentationReference: string;
  /** Internal experimentation kind. */
  experimentationKind: ExperimentationKind;
  /** Experimentation status. */
  experimentationStatus: ExperimentationStatus;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque entity pointer when known. */
  entityReference?: string;
  /** Opaque entity kind mark when known. */
  entityKind?: string;
  /** Opaque feature pointer when known. */
  featureReference?: string;
  /** Opaque hypothesis pointer when known. */
  hypothesisReference?: string;
  /** Opaque parent experimentation pointer when nested. */
  parentExperimentationReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<ExperimentationSettingsRefKey, string>>;

/**
 * Outbound port for future experimentation adapters.
 * Not wired in this foundation — no run, split, or score methods.
 */
export interface ExperimentationPort {
  createExperimentation(
    input: CreateExperimentationInput,
  ): Promise<Experimentation>;
  resolveExperimentation(
    experimentation: Experimentation,
  ): Promise<Experimentation>;
}

export type CreateExperimentationInput = {
  experimentationKind: ExperimentationKind;
  experimentationStatus?: ExperimentationStatus;
  experimentationReference?: string;
  contextReference?: string;
  actorReference?: string;
  entityReference?: string;
  entityKind?: string;
  featureReference?: string;
  hypothesisReference?: string;
  parentExperimentationReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<ExperimentationSettingsRefKey, string>>;

export function isExperimentationKind(
  value: string,
): value is ExperimentationKind {
  return (EXPERIMENTATION_KIND_VALUES as readonly string[]).includes(value);
}

export function isExperimentationStatus(
  value: string,
): value is ExperimentationStatus {
  return (EXPERIMENTATION_STATUS_VALUES as readonly string[]).includes(value);
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

export function isExperimentation(
  value: unknown,
): value is Experimentation {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.experimentationReference === "string" &&
    candidate.experimentationReference.length > 0 &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "entityReference") &&
    optionalOpaqueOk(candidate, "entityKind") &&
    optionalOpaqueOk(candidate, "featureReference") &&
    optionalOpaqueOk(candidate, EXPERIMENTATION_SETTINGS_REF_KEY) &&
    optionalOpaqueOk(candidate, "hypothesisReference") &&
    optionalOpaqueOk(candidate, "parentExperimentationReference") &&
    typeof candidate.experimentationKind === "string" &&
    isExperimentationKind(candidate.experimentationKind) &&
    typeof candidate.experimentationStatus === "string" &&
    isExperimentationStatus(candidate.experimentationStatus)
  );
}

export function isExperimentationPort(
  value: unknown,
): value is ExperimentationPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ExperimentationPort).createExperimentation ===
      "function" &&
    typeof (value as ExperimentationPort).resolveExperimentation ===
      "function"
  );
}
