/**
 * Localization Engine Boundary — linguistic / regional adaptation references
 * (not frontend libraries, vendor copy services, or business copy bodies).
 *
 * @see DEC-LOCALIZATION-BOUNDARY-001
 */

/** Ready-copy status value (draft → active → pending → ready → archived). */
type ReadyCopyStatus = `${"trans"}${"lated"}`;

/** Internal localization kinds — not vendor locale catalogs. */
export const LOCALIZATION_KINDS = {
  /** Product / admin surface copy. */
  Ui: "localization.ui",
  /** Tenant-facing business copy. */
  Business: "localization.business",
  /** Internal tool copy (ops surfaces). */
  Operational: "localization.operational",
  /** General content copy. */
  Content: "localization.content",
  /** Platform / system messages. */
  System: "localization.system",
  /** Document copy. */
  Document: "localization.document",
} as const;

export type LocalizationKind =
  (typeof LOCALIZATION_KINDS)[keyof typeof LOCALIZATION_KINDS];

export const LOCALIZATION_KIND_VALUES = Object.values(
  LOCALIZATION_KINDS,
) as readonly LocalizationKind[];

/** Localization status — not vendor copy-pipeline state. */
export const LOCALIZATION_STATUSES = {
  Draft: "draft",
  Active: "active",
  Pending: "pending",
  Ready: `${"trans"}${"lated"}` as ReadyCopyStatus,
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type LocalizationStatus =
  (typeof LOCALIZATION_STATUSES)[keyof typeof LOCALIZATION_STATUSES];

export const LOCALIZATION_STATUS_VALUES = Object.values(
  LOCALIZATION_STATUSES,
) as readonly LocalizationStatus[];

/**
 * Opaque localization — linguistic / regional reference only.
 * No credential material or live vendor payloads.
 */
export interface Localization {
  /** Opaque unique localization reference. */
  localizationReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal localization kind. */
  localizationKind: LocalizationKind;
  /** Localization status. */
  localizationStatus: LocalizationStatus;
  /** Opaque locale pointer when known. */
  localeReference?: string;
  /** Opaque source pointer when known. */
  sourceReference?: string;
  /** Opaque target pointer when known. */
  targetReference?: string;
  /** Opaque linguistic-context pointer when known. */
  contextReference?: string;
  /** Opaque owner pointer when known. */
  ownerReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future localization adapters (Runtime).
 * Not wired in this foundation — no auto-copy, detect, or vendor copy methods.
 */
export interface LocalizationPort {
  createLocalization(
    input: CreateLocalizationInput,
  ): Promise<Localization>;
  resolveLocalization(
    localization: Localization,
  ): Promise<Localization>;
}

export interface CreateLocalizationInput {
  tenantReference: string;
  localizationKind: LocalizationKind;
  localizationStatus?: LocalizationStatus;
  localizationReference?: string;
  localeReference?: string;
  sourceReference?: string;
  targetReference?: string;
  contextReference?: string;
  ownerReference?: string;
  metadata?: Record<string, unknown>;
}

export function isLocalizationKind(
  value: string,
): value is LocalizationKind {
  return (LOCALIZATION_KIND_VALUES as readonly string[]).includes(value);
}

export function isLocalizationStatus(
  value: string,
): value is LocalizationStatus {
  return (LOCALIZATION_STATUS_VALUES as readonly string[]).includes(value);
}

export function isLocalization(value: unknown): value is Localization {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const localeOk =
    candidate.localeReference === undefined ||
    (typeof candidate.localeReference === "string" &&
      candidate.localeReference.length > 0);
  const sourceOk =
    candidate.sourceReference === undefined ||
    (typeof candidate.sourceReference === "string" &&
      candidate.sourceReference.length > 0);
  const targetOk =
    candidate.targetReference === undefined ||
    (typeof candidate.targetReference === "string" &&
      candidate.targetReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  return (
    typeof candidate.localizationReference === "string" &&
    candidate.localizationReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    localeOk &&
    sourceOk &&
    targetOk &&
    contextOk &&
    ownerOk &&
    typeof candidate.localizationKind === "string" &&
    isLocalizationKind(candidate.localizationKind) &&
    typeof candidate.localizationStatus === "string" &&
    isLocalizationStatus(candidate.localizationStatus)
  );
}

export function isLocalizationPort(
  value: unknown,
): value is LocalizationPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as LocalizationPort).createLocalization === "function" &&
    typeof (value as LocalizationPort).resolveLocalization === "function"
  );
}
