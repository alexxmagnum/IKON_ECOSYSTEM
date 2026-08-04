import type {
  CreateSearchInput,
  Search,
  SearchKind,
  SearchStatus,
} from "./search";
import {
  SEARCH_LOOKUP_REF_KEY,
  SEARCH_STATUSES,
  isSearchKind,
  isSearchStatus,
} from "./search";

let searchSequence = 0;

export interface CreateSearchOptions {
  /**
   * When set, search may only be created for this ambit
   * (cross-context isolation).
   */
  contextReference?: string;
}

/**
 * Build a checked Search (in-memory — discovery capacity existence only).
 * Does not find items, sort results, or open live discovery clients.
 */
export function createSearch(
  input: CreateSearchInput,
  options: CreateSearchOptions = {},
): Search {
  const contextReference = input.contextReference?.trim();
  const actorReference = input.actorReference?.trim();
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const catalogReference = input.catalogReference?.trim();
  const lookupRaw = input[SEARCH_LOOKUP_REF_KEY];
  const lookupReference =
    typeof lookupRaw === "string" ? lookupRaw.trim() : undefined;
  const scopeReference = input.scopeReference?.trim();
  const parentSearchReference = input.parentSearchReference?.trim();
  const boundContext = options.contextReference?.trim() || undefined;

  if (!isSearchKind(input.searchKind)) {
    throw new Error(`Unknown search kind: ${String(input.searchKind)}`);
  }

  const searchStatus: SearchStatus =
    input.searchStatus ?? SEARCH_STATUSES.Draft;
  if (!isSearchStatus(searchStatus)) {
    throw new Error(`Unknown search status: ${String(input.searchStatus)}`);
  }

  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.entityReference !== undefined && !entityReference) {
    throw new Error("entityReference must not be empty when provided");
  }
  if (input.entityKind !== undefined && !entityKind) {
    throw new Error("entityKind must not be empty when provided");
  }
  if (input.catalogReference !== undefined && !catalogReference) {
    throw new Error("catalogReference must not be empty when provided");
  }
  if (lookupRaw !== undefined && !lookupReference) {
    throw new Error(
      `${SEARCH_LOOKUP_REF_KEY} must not be empty when provided`,
    );
  }
  if (input.scopeReference !== undefined && !scopeReference) {
    throw new Error("scopeReference must not be empty when provided");
  }
  if (input.parentSearchReference !== undefined && !parentSearchReference) {
    throw new Error("parentSearchReference must not be empty when provided");
  }

  if (
    boundContext !== undefined &&
    (contextReference === undefined || contextReference !== boundContext)
  ) {
    throw new Error("search does not apply to this scope");
  }

  const providedReference = input.searchReference?.trim() ?? "";
  if (input.searchReference !== undefined && !providedReference) {
    throw new Error("searchReference must not be empty when provided");
  }

  const searchKind: SearchKind = input.searchKind;
  const searchReference = providedReference || allocateSearchReference();

  return {
    searchReference,
    searchKind,
    searchStatus,
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(entityReference !== undefined && entityReference.length > 0
      ? { entityReference }
      : {}),
    ...(entityKind !== undefined && entityKind.length > 0
      ? { entityKind }
      : {}),
    ...(catalogReference !== undefined && catalogReference.length > 0
      ? { catalogReference }
      : {}),
    ...(lookupReference !== undefined && lookupReference.length > 0
      ? { [SEARCH_LOOKUP_REF_KEY]: lookupReference }
      : {}),
    ...(scopeReference !== undefined && scopeReference.length > 0
      ? { scopeReference }
      : {}),
    ...(parentSearchReference !== undefined &&
    parentSearchReference.length > 0
      ? { parentSearchReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateSearchReference(): string {
  searchSequence += 1;
  return `search-${searchSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetSearchReferenceSequence(): void {
  searchSequence = 0;
}
