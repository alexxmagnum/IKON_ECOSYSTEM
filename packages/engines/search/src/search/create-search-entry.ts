import type {
  CreateSearchEntryInput,
  SearchEntry,
  SearchKind,
  SearchStatus,
} from "./search-entry";
import {
  SEARCH_STATUSES,
  isSearchKind,
  isSearchStatus,
} from "./search-entry";

let searchSequence = 0;

export interface CreateSearchEntryOptions {
  /**
   * When set, search entry may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated SearchEntry (in-memory — discoverable reference only).
 * Does not open vendor sessions, sort results, or run discovery clients.
 */
export function createSearchEntry(
  input: CreateSearchEntryInput,
  options: CreateSearchEntryOptions = {},
): SearchEntry {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const contextReference = input.contextReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isSearchKind(input.searchKind)) {
    throw new Error(`Unknown search kind: ${String(input.searchKind)}`);
  }

  const searchStatus: SearchStatus =
    input.searchStatus ?? SEARCH_STATUSES.Draft;
  if (!isSearchStatus(searchStatus)) {
    throw new Error(`Unknown search status: ${String(input.searchStatus)}`);
  }

  if (input.entityReference !== undefined && !entityReference) {
    throw new Error("entityReference must not be empty when provided");
  }
  if (input.entityKind !== undefined && !entityKind) {
    throw new Error("entityKind must not be empty when provided");
  }
  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.descriptionReference !== undefined && !descriptionReference) {
    throw new Error("descriptionReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("search entry does not apply to this tenant");
  }

  const providedReference = input.searchReference?.trim() ?? "";
  if (input.searchReference !== undefined && !providedReference) {
    throw new Error("searchReference must not be empty when provided");
  }

  const searchKind: SearchKind = input.searchKind;
  const searchReference = providedReference || allocateSearchReference();

  return {
    searchReference,
    tenantReference,
    searchKind,
    searchStatus,
    ...(entityReference !== undefined && entityReference.length > 0
      ? { entityReference }
      : {}),
    ...(entityKind !== undefined && entityKind.length > 0
      ? { entityKind }
      : {}),
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(descriptionReference !== undefined && descriptionReference.length > 0
      ? { descriptionReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
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
