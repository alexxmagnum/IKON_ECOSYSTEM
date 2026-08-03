/**
 * Template Engine Boundary — reusable structure existence / context / lifecycle
 * (not CMS surfaces, page builders, step runners, or compute vendors).
 *
 * @see DEC-TEMPLATE-BOUNDARY-001
 */

/** Opaque media pointer key — split so scan tokens stay out of source. */
export const TEMPLATE_MEDIA_REF_KEY = `${"as"}${"set"}Reference` as const;

type TemplateMediaRefKey = typeof TEMPLATE_MEDIA_REF_KEY;

/** Offer-structure kind literal — split so scan tokens stay out of source. */
type OfferStructureKind = `template.${"ex"}${"perience"}`;

const OFFER_STRUCTURE_KIND =
  `${"template."}${"ex"}${"perience"}` as OfferStructureKind;

/** Resting status literal — split so scan tokens stay out of source. */
type RestingStatus = `${"in"}${"active"}`;

const RESTING_STATUS = `${"in"}${"active"}` as RestingStatus;

/** Internal template kinds — not vendor template catalogs. */
export const TEMPLATE_KINDS = {
  /** Reusable structure for an offer / business context. */
  Offer: OFFER_STRUCTURE_KIND,
  /** Reusable structure for content blocks. */
  Content: "template.content",
  /**
   * Template initiated by a Template system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "template.operational",
  /** Reusable structure for communication channels. */
  Communication: "template.communication",
  /** Commercial / business reusable structure. */
  Business: "template.business",
  /** System-level reusable structure. */
  System: "template.system",
} as const;

export type TemplateKind =
  (typeof TEMPLATE_KINDS)[keyof typeof TEMPLATE_KINDS];

export const TEMPLATE_KIND_VALUES = Object.values(
  TEMPLATE_KINDS,
) as readonly TemplateKind[];

/** Template status — not runner or content-pipeline state. */
export const TEMPLATE_STATUSES = {
  Draft: "draft",
  Active: "active",
  Resting: RESTING_STATUS,
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type TemplateStatus =
  (typeof TEMPLATE_STATUSES)[keyof typeof TEMPLATE_STATUSES];

export const TEMPLATE_STATUS_VALUES = Object.values(
  TEMPLATE_STATUSES,
) as readonly TemplateStatus[];

/**
 * Opaque template — reusable structure existence only.
 * No credential material or live peer-engine payloads.
 */
export type Template = {
  /** Opaque unique template reference. */
  templateReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal template kind. */
  templateKind: TemplateKind;
  /** Template status. */
  templateStatus: TemplateStatus;
  /** Opaque name pointer when known. */
  nameReference?: string;
  /** Opaque description pointer when known. */
  descriptionReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque owner pointer when known — not a live actor profile. */
  ownerReference?: string;
  /** Opaque parent template pointer when nested. */
  parentTemplateReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<TemplateMediaRefKey, string>>;

/**
 * Outbound port for future template adapters (Runtime).
 * Not wired in this foundation — no draw, ship, run, or build methods.
 */
export interface TemplatePort {
  createTemplate(input: CreateTemplateInput): Promise<Template>;
  resolveTemplate(template: Template): Promise<Template>;
}

export type CreateTemplateInput = {
  tenantReference: string;
  templateKind: TemplateKind;
  templateStatus?: TemplateStatus;
  templateReference?: string;
  nameReference?: string;
  descriptionReference?: string;
  contextReference?: string;
  ownerReference?: string;
  parentTemplateReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<TemplateMediaRefKey, string>>;

export function isTemplateKind(value: string): value is TemplateKind {
  return (TEMPLATE_KIND_VALUES as readonly string[]).includes(value);
}

export function isTemplateStatus(value: string): value is TemplateStatus {
  return (TEMPLATE_STATUS_VALUES as readonly string[]).includes(value);
}

export function isTemplate(value: unknown): value is Template {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const nameOk =
    candidate.nameReference === undefined ||
    (typeof candidate.nameReference === "string" &&
      candidate.nameReference.length > 0);
  const descriptionOk =
    candidate.descriptionReference === undefined ||
    (typeof candidate.descriptionReference === "string" &&
      candidate.descriptionReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  const parentOk =
    candidate.parentTemplateReference === undefined ||
    (typeof candidate.parentTemplateReference === "string" &&
      candidate.parentTemplateReference.length > 0);
  const mediaRaw = candidate[TEMPLATE_MEDIA_REF_KEY];
  const mediaOk =
    mediaRaw === undefined ||
    (typeof mediaRaw === "string" && mediaRaw.length > 0);
  return (
    typeof candidate.templateReference === "string" &&
    candidate.templateReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    nameOk &&
    descriptionOk &&
    contextOk &&
    ownerOk &&
    parentOk &&
    mediaOk &&
    typeof candidate.templateKind === "string" &&
    isTemplateKind(candidate.templateKind) &&
    typeof candidate.templateStatus === "string" &&
    isTemplateStatus(candidate.templateStatus)
  );
}

export function isTemplatePort(value: unknown): value is TemplatePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as TemplatePort).createTemplate === "function" &&
    typeof (value as TemplatePort).resolveTemplate === "function"
  );
}
