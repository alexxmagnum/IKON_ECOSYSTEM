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
  createAuditEvent,
  isAuditEvent,
  isAuditKind,
  isAuditStatus,
  resetAuditReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Audit Engine Boundary", () => {
  beforeEach(() => {
    resetAuditReferenceSequence();
  });

  it("creates Audit Boundary context", () => {
    const auditEvent = createAuditEvent({
      tenantReference: "tenant-a",
      auditKind: AUDIT_KINDS.Lifecycle,
      actorReference: "actor-1",
      entityReference: "bk-1",
      entityKind: "booking",
      actionReference: "booking.confirmed",
    });
    assert.equal(isAuditEvent(auditEvent), true);
    assert.equal(auditEvent.auditReference, "audit-1");
    assert.equal(auditEvent.auditStatus, "pending");
    assert.equal(auditEvent.auditKind, "audit.lifecycle");
    assert.equal(auditEvent.tenantReference, "tenant-a");
    assert.equal(auditEvent.entityReference, "bk-1");
    assert.equal(auditEvent.actionReference, "booking.confirmed");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createAuditEvent({
          tenantReference: "  ",
          auditKind: AUDIT_KINDS.Creation,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createAuditEvent(
          {
            tenantReference: "tenant-b",
            auditKind: AUDIT_KINDS.Update,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createAuditEvent({
          tenantReference: "tenant-a",
          auditKind: AUDIT_KINDS.Access,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known audit kinds", () => {
    assert.equal(isAuditKind("audit.creation"), true);
    assert.equal(isAuditKind("audit.update"), true);
    assert.equal(isAuditKind("audit.deletion"), true);
    assert.equal(isAuditKind("audit.access"), true);
    assert.equal(isAuditKind("audit.lifecycle"), true);
    assert.equal(isAuditKind("audit.operational"), true);
    assert.equal(isAuditKind("audit.unknown"), false);

    assert.throws(
      () =>
        createAuditEvent({
          tenantReference: "tenant-a",
          auditKind: "audit.unknown" as never,
        }),
      /Unknown audit kind/,
    );
  });

  it("accepts only known audit statuses", () => {
    assert.equal(isAuditStatus("pending"), true);
    assert.equal(isAuditStatus("recorded"), true);
    assert.equal(isAuditStatus("archived"), true);
    assert.equal(isAuditStatus("failed"), true);
    assert.equal(isAuditStatus("cancelled"), true);
    assert.equal(isAuditStatus("unknown"), false);

    const recorded = createAuditEvent({
      tenantReference: "tenant-a",
      auditKind: AUDIT_KINDS.Update,
      auditStatus: AUDIT_STATUSES.Recorded,
    });
    assert.equal(recorded.auditStatus, "recorded");

    const archived = createAuditEvent({
      tenantReference: "tenant-a",
      auditKind: AUDIT_KINDS.Operational,
      auditStatus: AUDIT_STATUSES.Archived,
    });
    assert.equal(archived.auditStatus, "archived");
  });

  it("stays separated from identity / persistence / analytics packages", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/payment"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/commerce"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/community"),
      false,
    );

    const auditEvent = createAuditEvent({
      tenantReference: "tenant-a",
      auditKind: AUDIT_KINDS.Creation,
      auditStatus: AUDIT_STATUSES.Recorded,
      entityReference: "community-1",
      entityKind: "community",
      sourceReference: "source-1",
    });
    assert.equal(isAuditEvent(auditEvent), true);
    assert.equal(auditEvent.auditStatus, "recorded");
    assert.equal(auditEvent.entityReference, "community-1");
  });
});
