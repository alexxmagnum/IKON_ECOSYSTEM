/**
 * Tenant Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/tenant test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  TENANT_KINDS,
  TENANT_STATUSES,
  createTenant,
  isTenant,
  isTenantKind,
  isTenantStatus,
  resetTenantReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Tenant Engine Boundary", () => {
  beforeEach(() => {
    resetTenantReferenceSequence();
  });

  it("creates Tenant Boundary context", () => {
    const tenant = createTenant({
      tenantKind: TENANT_KINDS.Club,
      nameReference: "name-ikon-sant-jordi",
      ownerReference: "owner-1",
    });
    assert.equal(isTenant(tenant), true);
    assert.equal(tenant.tenantReference, "tenant-1");
    assert.equal(tenant.tenantStatus, "draft");
    assert.equal(tenant.tenantKind, "tenant.club");
    assert.equal(tenant.nameReference, "name-ikon-sant-jordi");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createTenant({
          tenantKind: TENANT_KINDS.Organization,
          tenantReference: "  ",
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createTenant(
          {
            tenantKind: TENANT_KINDS.Business,
            tenantReference: "tenant-b",
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this context/,
    );

    assert.throws(
      () =>
        createTenant({
          tenantKind: TENANT_KINDS.Restaurant,
          ownerReference: "  ",
        }),
      /ownerReference must not be empty when provided/,
    );
  });

  it("accepts only known tenant kinds", () => {
    assert.equal(isTenantKind("tenant.organization"), true);
    assert.equal(isTenantKind("tenant.business"), true);
    assert.equal(isTenantKind("tenant.club"), true);
    assert.equal(isTenantKind("tenant.restaurant"), true);
    assert.equal(isTenantKind("tenant.platform"), true);
    assert.equal(isTenantKind("tenant.operational"), true);
    assert.equal(isTenantKind("tenant.unknown"), false);

    assert.throws(
      () =>
        createTenant({
          tenantKind: "tenant.unknown" as never,
        }),
      /Unknown tenant kind/,
    );
  });

  it("accepts only known tenant statuses", () => {
    assert.equal(isTenantStatus("draft"), true);
    assert.equal(isTenantStatus("active"), true);
    assert.equal(isTenantStatus("suspended"), true);
    assert.equal(isTenantStatus("inactive"), true);
    assert.equal(isTenantStatus("archived"), true);
    assert.equal(isTenantStatus("cancelled"), true);
    assert.equal(isTenantStatus("unknown"), false);

    const active = createTenant({
      tenantKind: TENANT_KINDS.Platform,
      tenantStatus: TENANT_STATUSES.Active,
    });
    assert.equal(active.tenantStatus, "active");

    const suspended = createTenant({
      tenantKind: TENANT_KINDS.Operational,
      tenantStatus: TENANT_STATUSES.Suspended,
    });
    assert.equal(suspended.tenantStatus, "suspended");
  });

  it("stays separated from identity / membership / commerce packages", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/identity"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/membership"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/commerce"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/payment"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/configuration"),
      false,
    );

    const tenant = createTenant({
      tenantKind: TENANT_KINDS.Organization,
      tenantStatus: TENANT_STATUSES.Inactive,
      descriptionReference: "desc-1",
      parentTenantReference: "tenant-parent-1",
    });
    assert.equal(isTenant(tenant), true);
    assert.equal(tenant.tenantStatus, "inactive");
    assert.equal(tenant.parentTenantReference, "tenant-parent-1");
  });
});
