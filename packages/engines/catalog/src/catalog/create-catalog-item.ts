import type {
  CatalogItem,
  CatalogKind,
  CatalogStatus,
  CreateCatalogItemInput,
} from "./catalog-item";
import {
  CATALOG_INFO_REF_KEY,
  CATALOG_MEDIA_REF_KEY,
  CATALOG_STATUSES,
  CATALOG_STRUCTURE_REF_KEY,
  isCatalogKind,
  isCatalogStatus,
} from "./catalog-item";

let catalogSequence = 0;

export interface CreateCatalogItemOptions {
  /**
   * When set, catalog item may only be created for this tenant
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked CatalogItem (in-memory — element existence only).
 * Does not open vendor sessions or run trade / charge / hold flows.
 */
export function createCatalogItem(
  input: CreateCatalogItemInput,
  options: CreateCatalogItemOptions = {},
): CatalogItem {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const contextReference = input.contextReference?.trim();
  const categoryReference = input.categoryReference?.trim();
  const mediaRaw = input[CATALOG_MEDIA_REF_KEY];
  const mediaReference =
    typeof mediaRaw === "string" ? mediaRaw.trim() : undefined;
  const infoRaw = input[CATALOG_INFO_REF_KEY];
  const infoReference =
    typeof infoRaw === "string" ? infoRaw.trim() : undefined;
  const structureRaw = input[CATALOG_STRUCTURE_REF_KEY];
  const structureReference =
    typeof structureRaw === "string" ? structureRaw.trim() : undefined;
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isCatalogKind(input.catalogKind)) {
    throw new Error(`Unknown catalog kind: ${String(input.catalogKind)}`);
  }

  const catalogStatus: CatalogStatus =
    input.catalogStatus ?? CATALOG_STATUSES.Draft;
  if (!isCatalogStatus(catalogStatus)) {
    throw new Error(
      `Unknown catalog status: ${String(input.catalogStatus)}`,
    );
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
  if (input.categoryReference !== undefined && !categoryReference) {
    throw new Error("categoryReference must not be empty when provided");
  }
  if (mediaRaw !== undefined && !mediaReference) {
    throw new Error(
      `${CATALOG_MEDIA_REF_KEY} must not be empty when provided`,
    );
  }
  if (infoRaw !== undefined && !infoReference) {
    throw new Error(
      `${CATALOG_INFO_REF_KEY} must not be empty when provided`,
    );
  }
  if (structureRaw !== undefined && !structureReference) {
    throw new Error(
      `${CATALOG_STRUCTURE_REF_KEY} must not be empty when provided`,
    );
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("catalog item does not apply to this tenant");
  }

  const providedReference = input.catalogReference?.trim() ?? "";
  if (input.catalogReference !== undefined && !providedReference) {
    throw new Error("catalogReference must not be empty when provided");
  }

  const catalogKind: CatalogKind = input.catalogKind;
  const catalogReference = providedReference || allocateCatalogReference();

  return {
    catalogReference,
    tenantReference,
    catalogKind,
    catalogStatus,
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(descriptionReference !== undefined && descriptionReference.length > 0
      ? { descriptionReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(categoryReference !== undefined && categoryReference.length > 0
      ? { categoryReference }
      : {}),
    ...(mediaReference !== undefined && mediaReference.length > 0
      ? { [CATALOG_MEDIA_REF_KEY]: mediaReference }
      : {}),
    ...(infoReference !== undefined && infoReference.length > 0
      ? { [CATALOG_INFO_REF_KEY]: infoReference }
      : {}),
    ...(structureReference !== undefined && structureReference.length > 0
      ? { [CATALOG_STRUCTURE_REF_KEY]: structureReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateCatalogReference(): string {
  catalogSequence += 1;
  return `catalog-${catalogSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetCatalogReferenceSequence(): void {
  catalogSequence = 0;
}
