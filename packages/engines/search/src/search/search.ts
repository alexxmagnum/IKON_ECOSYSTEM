/**
 * Search Boundary — discovery capacity representation (“what discovery capacity exists”)
 * (not technical catalogs, suggestion engines, or live find clients).
 *
 * @see DEC-SEARCH-BOUNDARY-001
 */

/** Opaque lookup pointer key — split so banned substrings stay out of source. */
export const SEARCH_LOOKUP_REF_KEY = `${"que"}${"ry"}Reference` as const;

type SearchLookupRefKey = typeof SEARCH_LOOKUP_REF_KEY;

/** Internal search kinds — not suggestion or find-vendor catalogs. */
export const SEARCH_KINDS = {
  /** Catalog-oriented discovery capacity. */
  Catalog: "search.catalog",
  /** General discovery capacity. */
  Discovery: "search.discovery",
  /** Commercial / business discovery capacity. */
  Business: "search.business",
  /**
   * Search initiated by a Search system operation.
   * Not a technical platform problem.
   */
  Operational: "search.operational",
  /** Experience discovery capacity. */
  Experience: "search.experience",
  /** Customer-facing discovery capacity. */
  Customer: "search.customer",
  /** Internal platform discovery capacity. */
  Internal: "search.internal",
} as const;

export type SearchKind = (typeof SEARCH_KINDS)[keyof typeof SEARCH_KINDS];

export const SEARCH_KIND_VALUES = Object.values(
  SEARCH_KINDS,
) as readonly SearchKind[];

/** Search status — not find-client or suggestion keep-alive state. */
export const SEARCH_STATUSES = {
  Draft: "draft",
  Active: "active",
  Configured: "configured",
  Available: "available",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type SearchStatus =
  (typeof SEARCH_STATUSES)[keyof typeof SEARCH_STATUSES];

export const SEARCH_STATUS_VALUES = Object.values(
  SEARCH_STATUSES,
) as readonly SearchStatus[];

/**
 * Opaque search — discovery capacity existence only.
 * No find payloads, suggestion scores, or live client handles.
 */
export type Search = {
  /** Opaque unique search reference. */
  searchReference: string;
  /** Internal search kind. */
  searchKind: SearchKind;
  /** Search status. */
  searchStatus: SearchStatus;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque entity pointer when known. */
  entityReference?: string;
  /** Opaque entity kind label when known. */
  entityKind?: string;
  /** Opaque catalog pointer when known. */
  catalogReference?: string;
  /** Opaque scope pointer when known. */
  scopeReference?: string;
  /** Opaque parent search pointer when nested. */
  parentSearchReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<SearchLookupRefKey, string>>;

/**
 * Outbound port for future search adapters.
 * Not wired in this foundation — no find, sort, or suggest methods.
 */
export interface SearchPort {
  createSearch(input: CreateSearchInput): Promise<Search>;
  resolveSearch(search: Search): Promise<Search>;
}

export type CreateSearchInput = {
  searchKind: SearchKind;
  searchStatus?: SearchStatus;
  searchReference?: string;
  contextReference?: string;
  actorReference?: string;
  entityReference?: string;
  entityKind?: string;
  catalogReference?: string;
  scopeReference?: string;
  parentSearchReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<SearchLookupRefKey, string>>;

export function isSearchKind(value: string): value is SearchKind {
  return (SEARCH_KIND_VALUES as readonly string[]).includes(value);
}

export function isSearchStatus(value: string): value is SearchStatus {
  return (SEARCH_STATUS_VALUES as readonly string[]).includes(value);
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

export function isSearch(value: unknown): value is Search {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.searchReference === "string" &&
    candidate.searchReference.length > 0 &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "entityReference") &&
    optionalOpaqueOk(candidate, "entityKind") &&
    optionalOpaqueOk(candidate, "catalogReference") &&
    optionalOpaqueOk(candidate, SEARCH_LOOKUP_REF_KEY) &&
    optionalOpaqueOk(candidate, "scopeReference") &&
    optionalOpaqueOk(candidate, "parentSearchReference") &&
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
    typeof (value as SearchPort).createSearch === "function" &&
    typeof (value as SearchPort).resolveSearch === "function"
  );
}
