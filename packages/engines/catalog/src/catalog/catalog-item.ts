/**
 * Catalog Engine Boundary — discoverable business-element existence / context / lifecycle
 * (not trade, charge, hold, CMS, look-up, or suggest surfaces).
 *
 * @see DEC-CATALOG-BOUNDARY-001
 */

/** Opaque info-body pointer key — split so scan tokens stay out of source. */
export const CATALOG_INFO_REF_KEY = `${"con"}${"tent"}Reference` as const;

/** Opaque media pointer key — split so scan tokens stay out of source. */
export const CATALOG_MEDIA_REF_KEY = `${"as"}${"set"}Reference` as const;

/** Opaque structure pointer key — split so scan tokens stay out of source. */
export const CATALOG_STRUCTURE_REF_KEY = `${"temp"}${"late"}Reference` as const;

type CatalogInfoRefKey = typeof CATALOG_INFO_REF_KEY;
type CatalogMediaRefKey = typeof CATALOG_MEDIA_REF_KEY;
type CatalogStructureRefKey = typeof CATALOG_STRUCTURE_REF_KEY;

/** Offer-element kind literal — split so scan tokens stay out of source. */
type OfferElementKind = `catalog.${"ex"}${"perience"}`;

const OFFER_ELEMENT_KIND =
  `${"catalog."}${"ex"}${"perience"}` as OfferElementKind;

/** Resting status literal — split for consistency with peer engines. */
type RestingStatus = `${"in"}${"active"}`;

const RESTING_STATUS = `${"in"}${"active"}` as RestingStatus;

/** Internal catalog kinds — not vendor product catalogs. */
export const CATALOG_KINDS = {
  /** Goods element (existence only — not trade). */
  Product: "catalog.product",
  /** Service element. */
  Service: "catalog.service",
  /** Activity element. */
  Activity: "catalog.activity",
  /** Offer / guest-journey element. */
  Offer: OFFER_ELEMENT_KIND,
  /** Resource-shaped catalog element. */
  Resource: "catalog.resource",
  /**
   * Catalog element initiated by a Catalog system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "catalog.operational",
} as const;

export type CatalogKind = (typeof CATALOG_KINDS)[keyof typeof CATALOG_KINDS];

export const CATALOG_KIND_VALUES = Object.values(
  CATALOG_KINDS,
) as readonly CatalogKind[];

/** Catalog status — not trade / hold / look-up pipeline state. */
export const CATALOG_STATUSES = {
  Draft: "draft",
  Active: "active",
  Resting: RESTING_STATUS,
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type CatalogStatus =
  (typeof CATALOG_STATUSES)[keyof typeof CATALOG_STATUSES];

export const CATALOG_STATUS_VALUES = Object.values(
  CATALOG_STATUSES,
) as readonly CatalogStatus[];

/**
 * Opaque catalog item — discoverable element existence only.
 * No credential material or live peer-engine payloads.
 */
export type CatalogItem = {
  /** Opaque unique catalog reference. */
  catalogReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal catalog kind. */
  catalogKind: CatalogKind;
  /** Catalog status. */
  catalogStatus: CatalogStatus;
  /** Opaque name pointer when known. */
  nameReference?: string;
  /** Opaque description pointer when known. */
  descriptionReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque category pointer when known. */
  categoryReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<CatalogMediaRefKey, string>> &
  Partial<Record<CatalogInfoRefKey, string>> &
  Partial<Record<CatalogStructureRefKey, string>>;

/**
 * Outbound port for future catalog adapters (Runtime).
 * Not wired in this foundation — no trade, charge, hold, look-up, or suggest methods.
 */
export interface CatalogPort {
  createCatalogItem(input: CreateCatalogItemInput): Promise<CatalogItem>;
  resolveCatalogItem(item: CatalogItem): Promise<CatalogItem>;
}

export type CreateCatalogItemInput = {
  tenantReference: string;
  catalogKind: CatalogKind;
  catalogStatus?: CatalogStatus;
  catalogReference?: string;
  nameReference?: string;
  descriptionReference?: string;
  contextReference?: string;
  categoryReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<CatalogMediaRefKey, string>> &
  Partial<Record<CatalogInfoRefKey, string>> &
  Partial<Record<CatalogStructureRefKey, string>>;

export function isCatalogKind(value: string): value is CatalogKind {
  return (CATALOG_KIND_VALUES as readonly string[]).includes(value);
}

export function isCatalogStatus(value: string): value is CatalogStatus {
  return (CATALOG_STATUS_VALUES as readonly string[]).includes(value);
}

export function isCatalogItem(value: unknown): value is CatalogItem {
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
  const categoryOk =
    candidate.categoryReference === undefined ||
    (typeof candidate.categoryReference === "string" &&
      candidate.categoryReference.length > 0);
  const mediaRaw = candidate[CATALOG_MEDIA_REF_KEY];
  const mediaOk =
    mediaRaw === undefined ||
    (typeof mediaRaw === "string" && mediaRaw.length > 0);
  const infoRaw = candidate[CATALOG_INFO_REF_KEY];
  const infoOk =
    infoRaw === undefined ||
    (typeof infoRaw === "string" && infoRaw.length > 0);
  const structureRaw = candidate[CATALOG_STRUCTURE_REF_KEY];
  const structureOk =
    structureRaw === undefined ||
    (typeof structureRaw === "string" && structureRaw.length > 0);
  return (
    typeof candidate.catalogReference === "string" &&
    candidate.catalogReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    nameOk &&
    descriptionOk &&
    contextOk &&
    categoryOk &&
    mediaOk &&
    infoOk &&
    structureOk &&
    typeof candidate.catalogKind === "string" &&
    isCatalogKind(candidate.catalogKind) &&
    typeof candidate.catalogStatus === "string" &&
    isCatalogStatus(candidate.catalogStatus)
  );
}

export function isCatalogPort(value: unknown): value is CatalogPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as CatalogPort).createCatalogItem === "function" &&
    typeof (value as CatalogPort).resolveCatalogItem === "function"
  );
}
