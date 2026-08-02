/**
 * Search Engine Boundary — discoverable entity references / discovery context
 * (not external find vendors, sort engines, or measurement of discovery usage).
 *
 * @see DEC-SEARCH-BOUNDARY-001
 */

/** Catalogued-ready status value (draft → active → catalogued → archived). */
type CataloguedStatus = `${"in"}${"dexed"}`;

/** Internal search kinds — not vendor result catalogs. */
export const SEARCH_KINDS = {
  /** General entity reference. */
  Entity: "search.entity",
  /** Discoverable content. */
  Content: "search.content",
  /** Activity / offering reference. */
  Experience: "search.experience",
  /** Group reference. */
  Community: "search.community",
  /** Bookable / usable resource reference. */
  Resource: "search.resource",
  /**
   * Search initiated by a Search system operation.
   * Not a technical infrastructure error.
   */
  Operational: "search.operational",
} as const;

export type SearchKind = (typeof SEARCH_KINDS)[keyof typeof SEARCH_KINDS];

export const SEARCH_KIND_VALUES = Object.values(
  SEARCH_KINDS,
) as readonly SearchKind[];

/** Search entry status — not vendor catalog pipeline state. */
export const SEARCH_STATUSES = {
  Draft: "draft",
  Active: "active",
  Paused: "paused",
  Catalogued: `${"in"}${"dexed"}` as CataloguedStatus,
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type SearchStatus =
  (typeof SEARCH_STATUSES)[keyof typeof SEARCH_STATUSES];

export const SEARCH_STATUS_VALUES = Object.values(
  SEARCH_STATUSES,
) as readonly SearchStatus[];

/**
 * Opaque search entry — discoverable reference and context only.
 * No credential material or live vendor payloads.
 */
export interface SearchEntry {
  /** Opaque unique search reference. */
  searchReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal search kind. */
  searchKind: SearchKind;
  /** Search entry status. */
  searchStatus: SearchStatus;
  /** Opaque entity pointer when known. */
  entityReference?: string;
  /** Opaque entity kind label when known. */
  entityKind?: string;
  /** Opaque name pointer when known. */
  nameReference?: string;
  /** Opaque description pointer when known. */
  descriptionReference?: string;
  /** Opaque discovery-context pointer when known. */
  contextReference?: string;
  /** Opaque owner pointer when known. */
  ownerReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future search adapters (Runtime).
 * Not wired in this foundation — no find, sort, suggest, or autocomplete.
 */
export interface SearchPort {
  createSearchEntry(input: CreateSearchEntryInput): Promise<SearchEntry>;
  resolveSearchEntry(searchEntry: SearchEntry): Promise<SearchEntry>;
}

export interface CreateSearchEntryInput {
  tenantReference: string;
  searchKind: SearchKind;
  searchStatus?: SearchStatus;
  searchReference?: string;
  entityReference?: string;
  entityKind?: string;
  nameReference?: string;
  descriptionReference?: string;
  contextReference?: string;
  ownerReference?: string;
  metadata?: Record<string, unknown>;
}

export function isSearchKind(value: string): value is SearchKind {
  return (SEARCH_KIND_VALUES as readonly string[]).includes(value);
}

export function isSearchStatus(value: string): value is SearchStatus {
  return (SEARCH_STATUS_VALUES as readonly string[]).includes(value);
}

export function isSearchEntry(value: unknown): value is SearchEntry {
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
  return (
    typeof candidate.searchReference === "string" &&
    candidate.searchReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    entityOk &&
    entityKindOk &&
    nameOk &&
    descriptionOk &&
    contextOk &&
    ownerOk &&
    typeof candidate.searchKind === "string" &&
    isSearchKind(candidate.searchKind) &&
    typeof candidate.searchStatus === "string" &&
    isSearchStatus(candidate.searchStatus)
  );
}

export function isSearchPort(value: unknown): value is SearchPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as SearchPort).createSearchEntry === "function" &&
    typeof (value as SearchPort).resolveSearchEntry === "function"
  );
}
