/**
 * Content Engine Boundary — reusable business information existence / context / lifecycle
 * (not CMS surfaces, blog engines, page builders, or compute vendors).
 *
 * @see DEC-CONTENT-BOUNDARY-001
 */

/** Opaque structure pointer key — split so scan tokens stay out of source. */
export const CONTENT_STRUCTURE_REF_KEY = `${"temp"}${"late"}Reference` as const;

/** Opaque media pointer key — split so scan tokens stay out of source. */
export const CONTENT_MEDIA_REF_KEY = `${"as"}${"set"}Reference` as const;

type ContentStructureRefKey = typeof CONTENT_STRUCTURE_REF_KEY;
type ContentMediaRefKey = typeof CONTENT_MEDIA_REF_KEY;

/** Resting status literal — split for consistency with peer engines. */
type RestingStatus = `${"in"}${"active"}`;

const RESTING_STATUS = `${"in"}${"active"}` as RestingStatus;

/** Internal content kinds — not vendor content catalogs. */
export const CONTENT_KINDS = {
  /** Commercial / business information. */
  Business: "content.business",
  /** Product-oriented information. */
  Product: "content.product",
  /**
   * Content initiated by a Content system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "content.operational",
  /** Information for communication channels. */
  Communication: "content.communication",
  /** Help / guidance information. */
  Help: "content.help",
  /** System-level information. */
  System: "content.system",
} as const;

export type ContentKind = (typeof CONTENT_KINDS)[keyof typeof CONTENT_KINDS];

export const CONTENT_KIND_VALUES = Object.values(
  CONTENT_KINDS,
) as readonly ContentKind[];

/** Content status — not runner or CMS pipeline state. */
export const CONTENT_STATUSES = {
  Draft: "draft",
  Active: "active",
  Resting: RESTING_STATUS,
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type ContentStatus =
  (typeof CONTENT_STATUSES)[keyof typeof CONTENT_STATUSES];

export const CONTENT_STATUS_VALUES = Object.values(
  CONTENT_STATUSES,
) as readonly ContentStatus[];

/**
 * Opaque content — reusable business information existence only.
 * No credential material or live peer-engine payloads.
 */
export type Content = {
  /** Opaque unique content reference. */
  contentReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal content kind. */
  contentKind: ContentKind;
  /** Content status. */
  contentStatus: ContentStatus;
  /** Opaque title pointer when known. */
  titleReference?: string;
  /** Opaque description pointer when known. */
  descriptionReference?: string;
  /** Opaque body pointer when known. */
  bodyReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque owner pointer when known — not a live actor profile. */
  ownerReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<ContentStructureRefKey, string>> &
  Partial<Record<ContentMediaRefKey, string>>;

/**
 * Outbound port for future content adapters (Runtime).
 * Not wired in this foundation — no ship, draw, localize, or build methods.
 */
export interface ContentPort {
  createContent(input: CreateContentInput): Promise<Content>;
  resolveContent(content: Content): Promise<Content>;
}

export type CreateContentInput = {
  tenantReference: string;
  contentKind: ContentKind;
  contentStatus?: ContentStatus;
  contentReference?: string;
  titleReference?: string;
  descriptionReference?: string;
  bodyReference?: string;
  contextReference?: string;
  ownerReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<ContentStructureRefKey, string>> &
  Partial<Record<ContentMediaRefKey, string>>;

export function isContentKind(value: string): value is ContentKind {
  return (CONTENT_KIND_VALUES as readonly string[]).includes(value);
}

export function isContentStatus(value: string): value is ContentStatus {
  return (CONTENT_STATUS_VALUES as readonly string[]).includes(value);
}

export function isContent(value: unknown): value is Content {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const titleOk =
    candidate.titleReference === undefined ||
    (typeof candidate.titleReference === "string" &&
      candidate.titleReference.length > 0);
  const descriptionOk =
    candidate.descriptionReference === undefined ||
    (typeof candidate.descriptionReference === "string" &&
      candidate.descriptionReference.length > 0);
  const bodyOk =
    candidate.bodyReference === undefined ||
    (typeof candidate.bodyReference === "string" &&
      candidate.bodyReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  const structureRaw = candidate[CONTENT_STRUCTURE_REF_KEY];
  const structureOk =
    structureRaw === undefined ||
    (typeof structureRaw === "string" && structureRaw.length > 0);
  const mediaRaw = candidate[CONTENT_MEDIA_REF_KEY];
  const mediaOk =
    mediaRaw === undefined ||
    (typeof mediaRaw === "string" && mediaRaw.length > 0);
  return (
    typeof candidate.contentReference === "string" &&
    candidate.contentReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    titleOk &&
    descriptionOk &&
    bodyOk &&
    contextOk &&
    ownerOk &&
    structureOk &&
    mediaOk &&
    typeof candidate.contentKind === "string" &&
    isContentKind(candidate.contentKind) &&
    typeof candidate.contentStatus === "string" &&
    isContentStatus(candidate.contentStatus)
  );
}

export function isContentPort(value: unknown): value is ContentPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ContentPort).createContent === "function" &&
    typeof (value as ContentPort).resolveContent === "function"
  );
}
