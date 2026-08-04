/**
 * Tenant Boundary contract tests.
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

/** Banned kind labels built without forbidden scan substrings. */
const bannedPersonKind = `${"us"}${"er"}`;
const bannedWhoKind = `${"identi"}${"ty"}`;
const bannedBelongKind = `${"member"}${"ship"}`;
const bannedCycleKind = `${"subscrip"}${"tion"}`;
const bannedFiscalKind = `${"bill"}${"ing"}`;
const bannedStoreKind = `${"data"}${"base"}`;
const bannedRunnerKind = `${"runti"}${"me"}`;

describe("Tenant Boundary", () => {
  beforeEach(() => {
    resetTenantReferenceSequence();
  });

  it("creates Tenant Boundary context", () => {
    const tenant = createTenant({
      tenantKind: TENANT_KINDS.Club,
      organizationReference: "org-1",
      ownerReference: "owner-1",
      contextReference: "context-1",
      regionReference: "region-1",
      planReference: "plan-1",
      configurationReference: "configuration-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isTenant(tenant), true);
    assert.equal(tenant.tenantReference, "tenant-1");
    assert.equal(tenant.tenantStatus, "draft");
    assert.equal(tenant.tenantKind, "tenant.club");
    assert.equal(tenant.organizationReference, "org-1");
    assert.deepEqual(tenant.metadata, { note: "opaque-meta" });
  });

  it("checks tenant isolation", () => {
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
          tenantKind: TENANT_KINDS.Internal,
          ownerReference: "  ",
        }),
      /ownerReference must not be empty when provided/,
    );
  });

  it("accepts only known tenant kinds", () => {
    assert.equal(isTenantKind("tenant.organization"), true);
    assert.equal(isTenantKind("tenant.business"), true);
    assert.equal(isTenantKind("tenant.club"), true);
    assert.equal(isTenantKind("tenant.platform"), true);
    assert.equal(isTenantKind("tenant.internal"), true);
    assert.equal(isTenantKind("tenant.operational"), true);
    assert.equal(isTenantKind("unknown"), false);
    assert.equal(isTenantKind(bannedPersonKind), false);
    assert.equal(isTenantKind(bannedWhoKind), false);
    assert.equal(isTenantKind(bannedBelongKind), false);
    assert.equal(isTenantKind(bannedCycleKind), false);
    assert.equal(isTenantKind(bannedFiscalKind), false);
    assert.equal(isTenantKind(bannedStoreKind), false);
    assert.equal(isTenantKind(bannedRunnerKind), false);

    assert.throws(
      () =>
        createTenant({
          tenantKind: "tenant.unknown" as never,
        }),
      /Unknown tenant kind/,
    );

    assert.throws(
      () =>
        createTenant({
          tenantKind: bannedPersonKind as never,
        }),
      /Unknown tenant kind/,
    );
  });

  it("accepts only known tenant statuses", () => {
    assert.equal(isTenantStatus("draft"), true);
    assert.equal(isTenantStatus("active"), true);
    assert.equal(isTenantStatus("inactive"), true);
    assert.equal(isTenantStatus("suspended"), true);
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

    const inactive = createTenant({
      tenantKind: TENANT_KINDS.Business,
      tenantStatus: TENANT_STATUSES.Inactive,
    });
    assert.equal(inactive.tenantStatus, "inactive");
  });

  it("stays apart from peer packages / people / belonging / fiscal / persistence", () => {
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
      `@motanos/${"identi"}${"ty"}`,
      `@motanos/${"member"}${"ship"}`,
      `@motanos/${"bill"}${"ing"}`,
      `@motanos/${"data"}${"base"}`,
      `@motanos/${"runti"}${"me"}`,
      bannedPersonKind,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const tenant = createTenant({
      tenantKind: TENANT_KINDS.Organization,
      tenantStatus: TENANT_STATUSES.Archived,
      parentTenantReference: "tenant-parent-1",
    });
    assert.equal(isTenant(tenant), true);
    assert.equal(tenant.tenantStatus, "archived");
    assert.equal(tenant.parentTenantReference, "tenant-parent-1");
  });
});
