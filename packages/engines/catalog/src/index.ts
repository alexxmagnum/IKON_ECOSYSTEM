/**
 * @motanos/catalog — Catalog Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/catalog
 *
 * Catalog = discoverable business-element existence for a context.
 * Must not depend on trade packages, charge packages, hold packages,
 * info packages, media packages, structure packages, offer packages,
 * look-up packages, suggest packages, compute vendors, or persistence vendors.
 *
 * @see DEC-CATALOG-BOUNDARY-001
 */

export const CATALOG_ENGINE = "@motanos/catalog" as const;

export type {
  CatalogItem,
  CatalogKind,
  CatalogPort,
  CatalogStatus,
  CreateCatalogItemInput,
  CreateCatalogItemOptions,
} from "./catalog";
export {
  CATALOG_INFO_REF_KEY,
  CATALOG_KINDS,
  CATALOG_KIND_VALUES,
  CATALOG_MEDIA_REF_KEY,
  CATALOG_STATUSES,
  CATALOG_STATUS_VALUES,
  CATALOG_STRUCTURE_REF_KEY,
  createCatalogItem,
  isCatalogItem,
  isCatalogKind,
  isCatalogPort,
  isCatalogStatus,
  resetCatalogReferenceSequence,
} from "./catalog";
