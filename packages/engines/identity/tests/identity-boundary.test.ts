/**
 * Identity Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/identity test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  IDENTITY_KINDS,
  IDENTITY_STATUSES,
  createIdentity,
  isIdentity,
  isIdentityKind,
  isIdentityStatus,
  resetIdentityReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Identity Engine Boundary", () => {
  beforeEach(() => {
    resetIdentityReferenceSequence();
  });

  it("creates Identity Boundary context", () => {
    const identity = createIdentity({
      tenantReference: "tenant-a",
      identityKind: IDENTITY_KINDS.Person,
      externalReference: "ext-1",
      ownerReference: "owner-1",
    });
    assert.equal(isIdentity(identity), true);
    assert.equal(identity.identityReference, "identity-1");
    assert.equal(identity.identityStatus, "draft");
    assert.equal(identity.identityKind, "identity.person");
    assert.equal(identity.tenantReference, "tenant-a");
    assert.equal(identity.externalReference, "ext-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createIdentity({
          tenantReference: "  ",
          identityKind: IDENTITY_KINDS.Organization,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createIdentity(
          {
            tenantReference: "tenant-b",
            identityKind: IDENTITY_KINDS.Service,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createIdentity({
          tenantReference: "tenant-a",
          identityKind: IDENTITY_KINDS.System,
          externalReference: "  ",
        }),
      /externalReference must not be empty when provided/,
    );
  });

  it("accepts only known identity kinds", () => {
    assert.equal(isIdentityKind("identity.person"), true);
    assert.equal(isIdentityKind("identity.organization"), true);
    assert.equal(isIdentityKind("identity.service"), true);
    assert.equal(isIdentityKind("identity.system"), true);
    assert.equal(isIdentityKind("identity.operational"), true);
    assert.equal(isIdentityKind("identity.unknown"), false);

    assert.throws(
      () =>
        createIdentity({
          tenantReference: "tenant-a",
          identityKind: "identity.unknown" as never,
        }),
      /Unknown identity kind/,
    );
  });

  it("accepts only known identity statuses", () => {
    assert.equal(isIdentityStatus("draft"), true);
    assert.equal(isIdentityStatus("active"), true);
    assert.equal(isIdentityStatus("suspended"), true);
    assert.equal(isIdentityStatus("archived"), true);
    assert.equal(isIdentityStatus("cancelled"), true);
    assert.equal(isIdentityStatus("unknown"), false);

    const active = createIdentity({
      tenantReference: "tenant-a",
      identityKind: IDENTITY_KINDS.Person,
      identityStatus: IDENTITY_STATUSES.Active,
    });
    assert.equal(active.identityStatus, "active");

    const suspended = createIdentity({
      tenantReference: "tenant-a",
      identityKind: IDENTITY_KINDS.Operational,
      identityStatus: IDENTITY_STATUSES.Suspended,
    });
    assert.equal(suspended.identityStatus, "suspended");
  });

  it("stays separated from Auth / Profile / Payment / Booking packages", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/auth"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/community"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/payments"),
      false,
    );

    const identity = createIdentity({
      tenantReference: "tenant-a",
      identityKind: IDENTITY_KINDS.Organization,
      identityStatus: IDENTITY_STATUSES.Archived,
    });
    assert.equal(isIdentity(identity), true);
    assert.equal(identity.identityStatus, "archived");
  });
});
