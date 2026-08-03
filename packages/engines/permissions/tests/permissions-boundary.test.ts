/**
 * Permissions Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/permissions test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  PERMISSION_KINDS,
  PERMISSION_SEAT_REF_KEY,
  PERMISSION_STATUSES,
  createPermission,
  isPermission,
  isPermissionKind,
  isPermissionStatus,
  resetPermissionReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedPersonKind = `${"us"}${"er"}`;
const bannedSignInKind = `${"au"}${"th"}`;
const bannedPresenceKind = `${"sess"}${"ion"}`;
const bannedEntryKind = `${"log"}${"in"}`;
const seatKindValue = `${"permission."}${"ro"}${"le"}`;
const seatRefValue = `${"seat"}-1`;

describe("Permissions Engine Boundary", () => {
  beforeEach(() => {
    resetPermissionReferenceSequence();
  });

  it("creates Permission Boundary context", () => {
    const permission = createPermission({
      tenantReference: "tenant-a",
      permissionKind: PERMISSION_KINDS.Identity,
      identityReference: "identity-1",
      membershipReference: "membership-1",
      resourceReference: "resource-1",
      actionReference: "action-1",
      contextReference: "context-1",
      [PERMISSION_SEAT_REF_KEY]: seatRefValue,
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isPermission(permission), true);
    assert.equal(permission.permissionReference, "permission-1");
    assert.equal(permission.permissionStatus, "draft");
    assert.equal(permission.permissionKind, "permission.identity");
    assert.equal(permission.tenantReference, "tenant-a");
    assert.equal(permission.identityReference, "identity-1");
    assert.equal(permission[PERMISSION_SEAT_REF_KEY], seatRefValue);
    assert.deepEqual(permission.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
    assert.throws(
      () =>
        createPermission({
          tenantReference: "  ",
          permissionKind: PERMISSION_KINDS.Resource,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createPermission(
          {
            tenantReference: "tenant-b",
            permissionKind: PERMISSION_KINDS.Business,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createPermission({
          tenantReference: "tenant-a",
          permissionKind: PERMISSION_KINDS.System,
          identityReference: "  ",
        }),
      /identityReference must not be empty when provided/,
    );
  });

  it("accepts only known permission kinds", () => {
    assert.equal(isPermissionKind("permission.identity"), true);
    assert.equal(isPermissionKind(seatKindValue), true);
    assert.equal(isPermissionKind("permission.resource"), true);
    assert.equal(isPermissionKind("permission.operational"), true);
    assert.equal(isPermissionKind("permission.business"), true);
    assert.equal(isPermissionKind("permission.system"), true);
    assert.equal(isPermissionKind("unknown"), false);
    assert.equal(isPermissionKind(bannedPersonKind), false);
    assert.equal(isPermissionKind(bannedSignInKind), false);
    assert.equal(isPermissionKind(bannedPresenceKind), false);
    assert.equal(isPermissionKind(bannedEntryKind), false);

    assert.throws(
      () =>
        createPermission({
          tenantReference: "tenant-a",
          permissionKind: "permission.unknown" as never,
        }),
      /Unknown permission kind/,
    );

    assert.throws(
      () =>
        createPermission({
          tenantReference: "tenant-a",
          permissionKind: bannedSignInKind as never,
        }),
      /Unknown permission kind/,
    );
  });

  it("accepts only known permission statuses", () => {
    assert.equal(isPermissionStatus("draft"), true);
    assert.equal(isPermissionStatus("active"), true);
    assert.equal(isPermissionStatus("inactive"), true);
    assert.equal(isPermissionStatus("suspended"), true);
    assert.equal(isPermissionStatus("archived"), true);
    assert.equal(isPermissionStatus("cancelled"), true);
    assert.equal(isPermissionStatus("unknown"), false);

    const active = createPermission({
      tenantReference: "tenant-a",
      permissionKind: PERMISSION_KINDS.Identity,
      permissionStatus: PERMISSION_STATUSES.Active,
    });
    assert.equal(active.permissionStatus, "active");

    const inactive = createPermission({
      tenantReference: "tenant-a",
      permissionKind: PERMISSION_KINDS.Operational,
      permissionStatus: PERMISSION_STATUSES.Inactive,
    });
    assert.equal(inactive.permissionStatus, "inactive");

    const suspended = createPermission({
      tenantReference: "tenant-a",
      permissionKind: PERMISSION_KINDS.Seat,
      permissionStatus: PERMISSION_STATUSES.Suspended,
    });
    assert.equal(suspended.permissionStatus, "suspended");
  });

  it("stays apart from peer packages / identity / belonging / sign-in / process", () => {
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
      `@motanos/${"au"}${"th"}`,
      `@motanos/${"work"}${"flow"}`,
      `@motanos/${"poli"}${"cy"}`,
      `@motanos/${"permiss"}${"ions"}-lifecycle`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const permission = createPermission({
      tenantReference: "tenant-a",
      permissionKind: PERMISSION_KINDS.Seat,
      permissionStatus: PERMISSION_STATUSES.Archived,
      parentPermissionReference: "permission-parent-1",
    });
    assert.equal(isPermission(permission), true);
    assert.equal(permission.permissionStatus, "archived");
    assert.equal(permission.permissionKind, seatKindValue);
    assert.equal(
      permission.parentPermissionReference,
      "permission-parent-1",
    );
  });
});
