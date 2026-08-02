/**
 * Asset Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/asset test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ASSET_KINDS,
  ASSET_STATUSES,
  createAsset,
  isAsset,
  isAssetKind,
  isAssetStatus,
  resetAssetReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Asset Engine Boundary", () => {
  beforeEach(() => {
    resetAssetReferenceSequence();
  });

  it("creates Asset Boundary context", () => {
    const asset = createAsset({
      tenantReference: "tenant-a",
      assetKind: ASSET_KINDS.Logo,
      nameReference: "name-ikon-logo",
      contextReference: "context-1",
      ownerReference: "owner-1",
    });
    assert.equal(isAsset(asset), true);
    assert.equal(asset.assetReference, "asset-1");
    assert.equal(asset.assetStatus, "draft");
    assert.equal(asset.assetKind, "asset.logo");
    assert.equal(asset.tenantReference, "tenant-a");
    assert.equal(asset.nameReference, "name-ikon-logo");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createAsset({
          tenantReference: "  ",
          assetKind: ASSET_KINDS.Image,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createAsset(
          {
            tenantReference: "tenant-b",
            assetKind: ASSET_KINDS.Document,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createAsset({
          tenantReference: "tenant-a",
          assetKind: ASSET_KINDS.Avatar,
          ownerReference: "  ",
        }),
      /ownerReference must not be empty when provided/,
    );
  });

  it("accepts only known asset kinds", () => {
    assert.equal(isAssetKind("asset.image"), true);
    assert.equal(isAssetKind("asset.document"), true);
    assert.equal(isAssetKind("asset.logo"), true);
    assert.equal(isAssetKind("asset.media"), true);
    assert.equal(isAssetKind("asset.avatar"), true);
    assert.equal(isAssetKind("asset.operational"), true);
    assert.equal(isAssetKind("asset.unknown"), false);

    assert.throws(
      () =>
        createAsset({
          tenantReference: "tenant-a",
          assetKind: "asset.unknown" as never,
        }),
      /Unknown asset kind/,
    );
  });

  it("accepts only known asset statuses", () => {
    assert.equal(isAssetStatus("draft"), true);
    assert.equal(isAssetStatus("active"), true);
    assert.equal(isAssetStatus("processing"), true);
    assert.equal(isAssetStatus("inactive"), true);
    assert.equal(isAssetStatus("archived"), true);
    assert.equal(isAssetStatus("cancelled"), true);
    assert.equal(isAssetStatus("unknown"), false);

    const active = createAsset({
      tenantReference: "tenant-a",
      assetKind: ASSET_KINDS.Media,
      assetStatus: ASSET_STATUSES.Active,
    });
    assert.equal(active.assetStatus, "active");

    const processing = createAsset({
      tenantReference: "tenant-a",
      assetKind: ASSET_KINDS.Operational,
      assetStatus: ASSET_STATUSES.Processing,
    });
    assert.equal(processing.assetStatus, "processing");
  });

  it("stays separated from domain engines / cloud file vendors", () => {
    const pkg = JSON.parse(
      readFileSync(join(packageRoot, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    assert.deepEqual(Object.keys(pkg.dependencies ?? {}).sort(), [
      "@motanos/contracts",
      "@motanos/core",
    ]);
    assert.equal(pkg.devDependencies, undefined);
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/tenant"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/identity"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/experience"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/community"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/commerce"),
      false,
    );

    const asset = createAsset({
      tenantReference: "tenant-a",
      assetKind: ASSET_KINDS.Image,
      assetStatus: ASSET_STATUSES.Inactive,
      descriptionReference: "desc-1",
      parentAssetReference: "asset-parent-1",
    });
    assert.equal(isAsset(asset), true);
    assert.equal(asset.assetStatus, "inactive");
    assert.equal(asset.parentAssetReference, "asset-parent-1");
  });
});
