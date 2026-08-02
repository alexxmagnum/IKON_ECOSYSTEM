/**
 * Asset Engine Boundary — conceptual digital resources / business context / lifecycle
 * (not cloud file vendors, media transforms, access control, or file transfer).
 *
 * @see DEC-ASSET-BOUNDARY-001
 */

/** Internal asset kinds — not vendor media catalogs. */
export const ASSET_KINDS = {
  /** Photographic / still image resource. */
  Image: "asset.image",
  /** Document resource (e.g. PDF). */
  Document: "asset.document",
  /** Visual identity mark. */
  Logo: "asset.logo",
  /** Multimedia content resource. */
  Media: "asset.media",
  /** Representative portrait / profile image. */
  Avatar: "asset.avatar",
  /**
   * Asset initiated by an Asset system operation.
   * Not a technical infrastructure error.
   */
  Operational: "asset.operational",
} as const;

export type AssetKind = (typeof ASSET_KINDS)[keyof typeof ASSET_KINDS];

export const ASSET_KIND_VALUES = Object.values(
  ASSET_KINDS,
) as readonly AssetKind[];

/** Asset lifecycle status — not vendor transfer or transform pipeline state. */
export const ASSET_STATUSES = {
  Draft: "draft",
  Active: "active",
  Processing: "processing",
  Inactive: "inactive",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type AssetStatus = (typeof ASSET_STATUSES)[keyof typeof ASSET_STATUSES];

export const ASSET_STATUS_VALUES = Object.values(
  ASSET_STATUSES,
) as readonly AssetStatus[];

/**
 * Opaque asset definition — conceptual digital resource only.
 * No credential material, live file paths, or public addresses.
 */
export interface Asset {
  /** Opaque unique asset reference. */
  assetReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal asset kind. */
  assetKind: AssetKind;
  /** Asset lifecycle status. */
  assetStatus: AssetStatus;
  /** Opaque name pointer when known. */
  nameReference?: string;
  /** Opaque description pointer when known. */
  descriptionReference?: string;
  /** Opaque business-context pointer when known. */
  contextReference?: string;
  /** Opaque owner pointer when known — not a live identity profile. */
  ownerReference?: string;
  /** Opaque parent asset pointer when nested. */
  parentAssetReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future asset adapters (Runtime).
 * Not wired in this foundation — no file transfer, thumbnails, or vendor writes.
 */
export interface AssetPort {
  createAsset(input: CreateAssetInput): Promise<Asset>;
  resolveAsset(asset: Asset): Promise<Asset>;
}

export interface CreateAssetInput {
  tenantReference: string;
  assetKind: AssetKind;
  assetStatus?: AssetStatus;
  assetReference?: string;
  nameReference?: string;
  descriptionReference?: string;
  contextReference?: string;
  ownerReference?: string;
  parentAssetReference?: string;
  metadata?: Record<string, unknown>;
}

export function isAssetKind(value: string): value is AssetKind {
  return (ASSET_KIND_VALUES as readonly string[]).includes(value);
}

export function isAssetStatus(value: string): value is AssetStatus {
  return (ASSET_STATUS_VALUES as readonly string[]).includes(value);
}

export function isAsset(value: unknown): value is Asset {
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
    candidate.parentAssetReference === undefined ||
    (typeof candidate.parentAssetReference === "string" &&
      candidate.parentAssetReference.length > 0);
  return (
    typeof candidate.assetReference === "string" &&
    candidate.assetReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    nameOk &&
    descriptionOk &&
    contextOk &&
    ownerOk &&
    parentOk &&
    typeof candidate.assetKind === "string" &&
    isAssetKind(candidate.assetKind) &&
    typeof candidate.assetStatus === "string" &&
    isAssetStatus(candidate.assetStatus)
  );
}

export function isAssetPort(value: unknown): value is AssetPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as AssetPort).createAsset === "function" &&
    typeof (value as AssetPort).resolveAsset === "function"
  );
}
