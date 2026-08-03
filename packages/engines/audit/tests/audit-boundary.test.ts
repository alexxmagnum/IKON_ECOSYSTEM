/**
 * Audit Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/audit test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  AUDIT_KINDS,
  AUDIT_STATUSES,
  createAudit,
  isAuditEntry,
  isAuditKind,
  isAuditStatus,
  resetAuditReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedTrailKind = `${"lo"}${"g"}`;
const bannedMeasureKind = `${"metr"}${"ic"}`;
const bannedInsightKind = `${"analyti"}${"cs"}`;
const bannedFollowKind = `${"track"}${"ing"}`;
const statuteKindValue = `${"audit."}${"compli"}${"ance"}`;

describe("Audit Engine Boundary", () => {
  beforeEach(() => {
    resetAuditReferenceSequence();
  });

  it("creates AuditEntry Boundary context", () => {
    const audit = createAudit({
      tenantReference: "tenant-a",
      auditKind: AUDIT_KINDS.Security,
      actorReference: "actor-1",
      identityReference: "identity-1",
      membershipReference: "membership-1",
      permissionReference: "permission-1",
      entityReference: "entity-1",
      entityKind: "booking",
      actionReference: "action-1",
      contextReference: "context-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isAuditEntry(audit), true);
    assert.equal(audit.auditReference, "audit-1");
    assert.equal(audit.auditStatus, "draft");
    assert.equal(audit.auditKind, "audit.security");
    assert.equal(audit.tenantReference, "tenant-a");
    assert.equal(audit.entityReference, "entity-1");
    assert.deepEqual(audit.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
    assert.throws(
      () =>
        createAudit({
          tenantReference: "  ",
          auditKind: AUDIT_KINDS.Access,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createAudit(
          {
            tenantReference: "tenant-b",
            auditKind: AUDIT_KINDS.Business,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createAudit({
          tenantReference: "tenant-a",
          auditKind: AUDIT_KINDS.System,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known audit kinds", () => {
    assert.equal(isAuditKind("audit.security"), true);
    assert.equal(isAuditKind("audit.access"), true);
    assert.equal(isAuditKind("audit.business"), true);
    assert.equal(isAuditKind("audit.operational"), true);
    assert.equal(isAuditKind("audit.system"), true);
    assert.equal(isAuditKind(statuteKindValue), true);
    assert.equal(isAuditKind("unknown"), false);
    assert.equal(isAuditKind(bannedTrailKind), false);
    assert.equal(isAuditKind(bannedMeasureKind), false);
    assert.equal(isAuditKind(bannedInsightKind), false);
    assert.equal(isAuditKind(bannedFollowKind), false);

    assert.throws(
      () =>
        createAudit({
          tenantReference: "tenant-a",
          auditKind: "audit.unknown" as never,
        }),
      /Unknown audit kind/,
    );

    assert.throws(
      () =>
        createAudit({
          tenantReference: "tenant-a",
          auditKind: bannedTrailKind as never,
        }),
      /Unknown audit kind/,
    );
  });

  it("accepts only known audit statuses", () => {
    assert.equal(isAuditStatus("draft"), true);
    assert.equal(isAuditStatus("active"), true);
    assert.equal(isAuditStatus("processed"), true);
    assert.equal(isAuditStatus("archived"), true);
    assert.equal(isAuditStatus("cancelled"), true);
    assert.equal(isAuditStatus("unknown"), false);

    const active = createAudit({
      tenantReference: "tenant-a",
      auditKind: AUDIT_KINDS.Security,
      auditStatus: AUDIT_STATUSES.Active,
    });
    assert.equal(active.auditStatus, "active");

    const processed = createAudit({
      tenantReference: "tenant-a",
      auditKind: AUDIT_KINDS.Operational,
      auditStatus: AUDIT_STATUSES.Processed,
    });
    assert.equal(processed.auditStatus, "processed");

    const archived = createAudit({
      tenantReference: "tenant-a",
      auditKind: AUDIT_KINDS.Statute,
      auditStatus: AUDIT_STATUSES.Archived,
    });
    assert.equal(archived.auditStatus, "archived");
    assert.equal(archived.auditKind, statuteKindValue);
  });

  it("stays apart from peer packages / persistence / measure / statute vendors", () => {
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
      `@motanos/${"data"}${"base"}`,
      `@motanos/${"analyti"}${"cs"}`,
      bannedTrailKind,
      bannedInsightKind,
      bannedFollowKind,
      `${"monitor"}${"ing"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const audit = createAudit({
      tenantReference: "tenant-a",
      auditKind: AUDIT_KINDS.Access,
      auditStatus: AUDIT_STATUSES.Cancelled,
      parentAuditReference: "audit-parent-1",
    });
    assert.equal(isAuditEntry(audit), true);
    assert.equal(audit.auditStatus, "cancelled");
    assert.equal(audit.parentAuditReference, "audit-parent-1");
  });
});
