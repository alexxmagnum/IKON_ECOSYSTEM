/**
 * @motanos/search — Search Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/search
 *
 * Search = what discovery capacity exists.
 * Must not depend on catalog packages, suggestion packages,
 * interpretation packages, or live technical find engines.
 *
 * @see DEC-SEARCH-BOUNDARY-001
 */

export const SEARCH_BOUNDARY = "@motanos/search" as const;

export type {
  CreateSearchInput,
  CreateSearchOptions,
  Search,
  SearchKind,
  SearchPort,
  SearchStatus,
} from "./search/mod";
export {
  SEARCH_KINDS,
  SEARCH_KIND_VALUES,
  SEARCH_LOOKUP_REF_KEY,
  SEARCH_STATUSES,
  SEARCH_STATUS_VALUES,
  createSearch,
  isSearch,
  isSearchKind,
  isSearchPort,
  isSearchStatus,
  resetSearchReferenceSequence,
} from "./search/mod";
