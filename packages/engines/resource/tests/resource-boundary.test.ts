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
  RESOURCE_KINDS,
  RESOURCE_STATUSES,
  createResource,
  isResource,
  isResourceKind,
  isResourceStatus,
  resetResourceReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Resource Engine Boundary", () => {
  beforeEach(() => {
    resetResourceReferenceSequence();
  });

  it("creates Resource Boundary context", () => {
    const resource = createResource({
      tenantReference: "tenant-a",
      resourceKind: RESOURCE_KINDS.Course,
      nameReference: "name-1",
      descriptionReference: "desc-1",
      parentResourceReference: "facility-1",
      ownerReference: "owner-1",
    });
    assert.equal(isResource(resource), true);
    assert.equal(resource.resourceReference, "resource-1");
    assert.equal(resource.resourceStatus, "draft");
    assert.equal(resource.resourceKind, "resource.course");
    assert.equal(resource.tenantReference, "tenant-a");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createResource({
          tenantReference: "  ",
          resourceKind: RESOURCE_KINDS.Table,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createResource(
          {
            tenantReference: "tenant-b",
            resourceKind: RESOURCE_KINDS.Court,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createResource({
          tenantReference: "tenant-a",
          resourceKind: RESOURCE_KINDS.Room,
          nameReference: "  ",
        }),
      /nameReference must not be empty when provided/,
    );
  });

  it("accepts only known resource kinds", () => {
    assert.equal(isResourceKind("resource.facility"), true);
    assert.equal(isResourceKind("resource.table"), true);
    assert.equal(isResourceKind("resource.court"), true);
    assert.equal(isResourceKind("resource.course"), true);
    assert.equal(isResourceKind("resource.room"), true);
    assert.equal(isResourceKind("resource.space"), true);
    assert.equal(isResourceKind("resource.equipment"), true);
    assert.equal(isResourceKind("resource.operational"), true);
    assert.equal(isResourceKind("resource.unknown"), false);

    assert.throws(
      () =>
        createResource({
          tenantReference: "tenant-a",
          resourceKind: "resource.unknown" as never,
        }),
      /Unknown resource kind/,
    );
  });

  it("accepts only known resource statuses", () => {
    assert.equal(isResourceStatus("draft"), true);
    assert.equal(isResourceStatus("active"), true);
    assert.equal(isResourceStatus("inactive"), true);
    assert.equal(isResourceStatus("maintenance"), true);
    assert.equal(isResourceStatus("archived"), true);
    assert.equal(isResourceStatus("unknown"), false);

    const active = createResource({
      tenantReference: "tenant-a",
      resourceKind: RESOURCE_KINDS.Facility,
      resourceStatus: RESOURCE_STATUSES.Active,
    });
    assert.equal(active.resourceStatus, "active");

    const maintenance = createResource({
      tenantReference: "tenant-a",
      resourceKind: RESOURCE_KINDS.Space,
      resourceStatus: RESOURCE_STATUSES.Maintenance,
    });
    assert.equal(maintenance.resourceStatus, "maintenance");
  });

  it("stays separated from Booking / Availability / Payment", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/payments"),
      false,
    );

    const resource = createResource({
      tenantReference: "tenant-a",
      resourceKind: RESOURCE_KINDS.Equipment,
      resourceStatus: RESOURCE_STATUSES.Inactive,
    });
    assert.equal(isResource(resource), true);
    assert.equal(resource.resourceStatus, "inactive");
  });
});
