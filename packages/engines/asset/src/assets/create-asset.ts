import type {
  Asset,
  AssetKind,
  AssetStatus,
  CreateAssetInput,
} from "./asset";
import {
  ASSET_STATUSES,
  isAssetKind,
  isAssetStatus,
} from "./asset";

let assetSequence = 0;

export interface CreateAssetOptions {
  /**
   * When set, asset may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated Asset (in-memory — conceptual resource / context only).
 * Does not transfer files, open vendor sessions, or transform media.
 */
export function createAsset(
  input: CreateAssetInput,
  options: CreateAssetOptions = {},
): Asset {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const contextReference = input.contextReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const parentAssetReference = input.parentAssetReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isAssetKind(input.assetKind)) {
    throw new Error(`Unknown asset kind: ${String(input.assetKind)}`);
  }

  const assetStatus: AssetStatus =
    input.assetStatus ?? ASSET_STATUSES.Draft;
  if (!isAssetStatus(assetStatus)) {
    throw new Error(`Unknown asset status: ${String(input.assetStatus)}`);
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
  if (input.parentAssetReference !== undefined && !parentAssetReference) {
    throw new Error("parentAssetReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("asset does not apply to this tenant");
  }

  const providedReference = input.assetReference?.trim() ?? "";
  if (input.assetReference !== undefined && !providedReference) {
    throw new Error("assetReference must not be empty when provided");
  }

  const assetKind: AssetKind = input.assetKind;
  const assetReference = providedReference || allocateAssetReference();

  return {
    assetReference,
    tenantReference,
    assetKind,
    assetStatus,
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
    ...(parentAssetReference !== undefined && parentAssetReference.length > 0
      ? { parentAssetReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateAssetReference(): string {
  assetSequence += 1;
  return `asset-${assetSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetAssetReferenceSequence(): void {
  assetSequence = 0;
}
