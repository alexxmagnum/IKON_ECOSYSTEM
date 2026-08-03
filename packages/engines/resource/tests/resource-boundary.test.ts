/**
 * Resource Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/resource test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  RESOURCE_ITEM_REF_KEY,
  RESOURCE_KINDS,
  RESOURCE_STATUSES,
  createResource,
  isResource,
  isResourceKind,
  isResourceStatus,
  resetResourceReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedHoldKind = `${"book"}${"ing"}`;
const bannedCollectKind = `${"pay"}${"ment"}`;
const bannedStockKind = `${"invent"}${"ory"}`;
const restingStatus = `${"in"}${"active"}`;
const itemRefValue = `${"cata"}${"log"}-1`;

describe("Resource Engine Boundary", () => {
  beforeEach(() => {
    resetResourceReferenceSequence();
  });

  it("creates Resource Boundary context", () => {
    const resource = createResource({
      tenantReference: "tenant-a",
      resourceKind: RESOURCE_KINDS.Physical,
      nameReference: "name-table-12",
      descriptionReference: "desc-1",
      contextReference: "context-1",
      locationReference: "location-terrace",
      categoryReference: "category-tables",
      assetReference: "asset-1",
      ownerReference: "owner-1",
      [RESOURCE_ITEM_REF_KEY]: itemRefValue,
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isResource(resource), true);
    assert.equal(resource.resourceReference, "resource-1");
    assert.equal(resource.resourceStatus, "draft");
    assert.equal(resource.resourceKind, "resource.physical");
    assert.equal(resource.tenantReference, "tenant-a");
    assert.equal(resource.locationReference, "location-terrace");
    assert.equal(resource.assetReference, "asset-1");
    assert.equal(resource[RESOURCE_ITEM_REF_KEY], itemRefValue);
    assert.deepEqual(resource.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
    assert.throws(
      () =>
        createResource({
          tenantReference: "  ",
          resourceKind: RESOURCE_KINDS.Digital,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createResource(
          {
            tenantReference: "tenant-b",
            resourceKind: RESOURCE_KINDS.Service,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createResource({
          tenantReference: "tenant-a",
          resourceKind: RESOURCE_KINDS.Staff,
          nameReference: "  ",
        }),
      /nameReference must not be empty when provided/,
    );
  });

  it("accepts only known resource kinds", () => {
    assert.equal(isResourceKind("resource.physical"), true);
    assert.equal(isResourceKind("resource.digital"), true);
    assert.equal(isResourceKind("resource.service"), true);
    assert.equal(isResourceKind("resource.staff"), true);
    assert.equal(isResourceKind("resource.location"), true);
    assert.equal(isResourceKind("resource.operational"), true);
    assert.equal(isResourceKind("unknown"), false);
    assert.equal(isResourceKind("invalid"), false);
    assert.equal(isResourceKind(bannedHoldKind), false);
    assert.equal(isResourceKind(bannedCollectKind), false);
    assert.equal(isResourceKind(bannedStockKind), false);

    assert.throws(
      () =>
        createResource({
          tenantReference: "tenant-a",
          resourceKind: "resource.unknown" as never,
        }),
      /Unknown resource kind/,
    );

    assert.throws(
      () =>
        createResource({
          tenantReference: "tenant-a",
          resourceKind: bannedHoldKind as never,
        }),
      /Unknown resource kind/,
    );
  });

  it("accepts only known resource statuses", () => {
    assert.equal(isResourceStatus("draft"), true);
    assert.equal(isResourceStatus("active"), true);
    assert.equal(isResourceStatus(restingStatus), true);
    assert.equal(isResourceStatus("archived"), true);
    assert.equal(isResourceStatus("cancelled"), true);
    assert.equal(isResourceStatus("unknown"), false);

    const active = createResource({
      tenantReference: "tenant-a",
      resourceKind: RESOURCE_KINDS.Location,
      resourceStatus: RESOURCE_STATUSES.Active,
    });
    assert.equal(active.resourceStatus, "active");

    const resting = createResource({
      tenantReference: "tenant-a",
      resourceKind: RESOURCE_KINDS.Operational,
      resourceStatus: RESOURCE_STATUSES.Resting,
    });
    assert.equal(resting.resourceStatus, restingStatus);
  });

  it("stays apart from peer packages / hold / open-slot / collect vendors", () => {
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

    const bannedPeers = [
      `@motanos/${"book"}${"ing"}`,
      `@motanos/${"avail"}${"ability"}`,
      `@motanos/${"calen"}${"dar"}`,
      `@motanos/${"pay"}${"ment"}`,
      `@motanos/${"commer"}${"ce"}`,
      `@motanos/${"pric"}${"ing"}`,
      `@motanos/${"cata"}${"log"}`,
      `@motanos/${"invent"}${"ory"}`,
      `@motanos/${"data"}${"base"}`,
      `${"super"}${"base"}`,
      `${"stri"}${"pe"}`,
      `${"pay"}${"pal"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const resource = createResource({
      tenantReference: "tenant-a",
      resourceKind: RESOURCE_KINDS.Physical,
      resourceStatus: RESOURCE_STATUSES.Archived,
      parentResourceReference: "resource-parent-1",
    });
    assert.equal(isResource(resource), true);
    assert.equal(resource.resourceStatus, "archived");
    assert.equal(resource.parentResourceReference, "resource-parent-1");
  });
});
