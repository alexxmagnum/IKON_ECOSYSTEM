/**
 * @motanos/search — Search Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/search
 *
 * Search = conceptual discovery capacity and discoverable entity references.
 * Domain engines own what exists; Search Providers own how discovery runs.
 *
 * Must not depend on booking, experience, community, commerce, asset,
 * persistence vendors, or measurement packages.
 *
 * @see DEC-SEARCH-BOUNDARY-001
 */

export const SEARCH_ENGINE = "@motanos/search" as const;

export type {
  CreateSearchEntryInput,
  CreateSearchEntryOptions,
  SearchEntry,
  SearchKind,
  SearchPort,
  SearchStatus,
} from "./search";
export {
  SEARCH_KINDS,
  SEARCH_KIND_VALUES,
  SEARCH_STATUSES,
  SEARCH_STATUS_VALUES,
  createSearchEntry,
  isSearchEntry,
  isSearchKind,
  isSearchPort,
  isSearchStatus,
  resetSearchReferenceSequence,
} from "./search";
