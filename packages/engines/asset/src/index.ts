/**
 * @motanos/asset — Asset Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/asset
 *
 * Asset = conceptual digital resource linked to a business context.
 * Cloud file vendors own where bytes live; media transforms own how
 * content is reshaped; access control owns who may reach it.
 *
 * Must not depend on tenant, identity, experience, community, commerce,
 * access-control packages, cloud file vendors, or persistence vendors.
 *
 * @see DEC-ASSET-BOUNDARY-001
 */

export const ASSET_ENGINE = "@motanos/asset" as const;

export type {
  Asset,
  AssetKind,
  AssetPort,
  AssetStatus,
  CreateAssetInput,
  CreateAssetOptions,
} from "./assets";
export {
  ASSET_KINDS,
  ASSET_KIND_VALUES,
  ASSET_STATUSES,
  ASSET_STATUS_VALUES,
  createAsset,
  isAsset,
  isAssetKind,
  isAssetPort,
  isAssetStatus,
  resetAssetReferenceSequence,
} from "./assets";
