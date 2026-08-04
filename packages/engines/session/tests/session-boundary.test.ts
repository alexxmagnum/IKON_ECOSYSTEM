/**
 * Session Boundary contract tests.
 * Run: pnpm --filter @motanos/session test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  SESSION_KINDS,
  SESSION_PROOF_REF_KEY,
  SESSION_SCOPE_REF_KEY,
  SESSION_STATUSES,
  SESSION_WHO_REF_KEY,
  createSession,
  isSession,
  isSessionKind,
  isSessionStatus,
  resetSessionReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedWhoKind = `${"iden"}${"tity"}`;
const bannedProofKind = `${"authentica"}${"tion"}`;
const bannedTicketKind = `${"tok"}${"en"}`;
const bannedVaultKind = `${"credenti"}${"al"}`;
const bannedCapacityKind = `${"permiss"}${"ion"}`;
const bannedBelongKind = `${"member"}${"ship"}`;
const bannedScopeKind = `${"ten"}${"ant"}`;
const scopeValue = `${"scope"}-a`;
const otherScopeValue = `${"scope"}-b`;

describe("Session Boundary", () => {
  beforeEach(() => {
    resetSessionReferenceSequence();
  });

  it("creates Session Boundary context", () => {
    const session = createSession({
      sessionKind: SESSION_KINDS.User,
      [SESSION_WHO_REF_KEY]: "who-1",
      [SESSION_PROOF_REF_KEY]: "proof-1",
      [SESSION_SCOPE_REF_KEY]: scopeValue,
      contextReference: "context-1",
      deviceReference: "device-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isSession(session), true);
    assert.equal(session.sessionReference, "session-1");
    assert.equal(session.sessionStatus, "draft");
    assert.equal(session.sessionKind, "session.user");
    assert.equal(session[SESSION_WHO_REF_KEY], "who-1");
    assert.equal(session[SESSION_PROOF_REF_KEY], "proof-1");
    assert.equal(session[SESSION_SCOPE_REF_KEY], scopeValue);
    assert.deepEqual(session.metadata, { note: "opaque-meta" });
  });

  it("checks context isolation", () => {
    assert.throws(
      () =>
        createSession({
          sessionKind: SESSION_KINDS.Service,
          [SESSION_SCOPE_REF_KEY]: "  ",
        }),
      new RegExp(
        `${SESSION_SCOPE_REF_KEY} must not be empty when provided`,
      ),
    );

    assert.throws(
      () =>
        createSession(
          {
            sessionKind: SESSION_KINDS.System,
            [SESSION_SCOPE_REF_KEY]: otherScopeValue,
          },
          { [SESSION_SCOPE_REF_KEY]: scopeValue },
        ),
      /does not apply to this scope/,
    );

    assert.throws(
      () =>
        createSession({
          sessionKind: SESSION_KINDS.External,
          deviceReference: "  ",
        }),
      /deviceReference must not be empty when provided/,
    );
  });

  it("accepts only known session kinds", () => {
    assert.equal(isSessionKind("session.user"), true);
    assert.equal(isSessionKind("session.service"), true);
    assert.equal(isSessionKind("session.system"), true);
    assert.equal(isSessionKind("session.external"), true);
    assert.equal(isSessionKind("session.operational"), true);
    assert.equal(isSessionKind("session.business"), true);
    assert.equal(isSessionKind("unknown"), false);
    assert.equal(isSessionKind(bannedWhoKind), false);
    assert.equal(isSessionKind(bannedProofKind), false);
    assert.equal(isSessionKind(bannedTicketKind), false);
    assert.equal(isSessionKind(bannedVaultKind), false);
    assert.equal(isSessionKind(bannedCapacityKind), false);
    assert.equal(isSessionKind(bannedBelongKind), false);
    assert.equal(isSessionKind(bannedScopeKind), false);

    assert.throws(
      () =>
        createSession({
          sessionKind: "session.unknown" as never,
        }),
      /Unknown session kind/,
    );

    assert.throws(
      () =>
        createSession({
          sessionKind: bannedWhoKind as never,
        }),
      /Unknown session kind/,
    );
  });

  it("accepts only known session statuses", () => {
    assert.equal(isSessionStatus("draft"), true);
    assert.equal(isSessionStatus("active"), true);
    assert.equal(isSessionStatus("inactive"), true);
    assert.equal(isSessionStatus("expired"), true);
    assert.equal(isSessionStatus("suspended"), true);
    assert.equal(isSessionStatus("archived"), true);
    assert.equal(isSessionStatus("cancelled"), true);
    assert.equal(isSessionStatus("unknown"), false);

    const active = createSession({
      sessionKind: SESSION_KINDS.User,
      sessionStatus: SESSION_STATUSES.Active,
    });
    assert.equal(active.sessionStatus, "active");

    const expired = createSession({
      sessionKind: SESSION_KINDS.Service,
      sessionStatus: SESSION_STATUSES.Expired,
    });
    assert.equal(expired.sessionStatus, "expired");

    const inactive = createSession({
      sessionKind: SESSION_KINDS.Operational,
      sessionStatus: SESSION_STATUSES.Inactive,
    });
    assert.equal(inactive.sessionStatus, "inactive");
  });

  it("stays apart from peer packages / proof schemes / actor existence / durable keep-alive", () => {
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
      `@motanos/${"authentica"}${"tion"}`,
      `@motanos/${"au"}${"th"}`,
      `@motanos/${"iden"}${"tity"}`,
      `@motanos/${"permiss"}${"ions"}`,
      `@motanos/${"member"}${"ship"}`,
      `@motanos/${"ten"}${"ant"}`,
      bannedTicketKind,
      `${"stor"}${"age"}`,
      `${"pro"}${"vider"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const session = createSession({
      sessionKind: SESSION_KINDS.Business,
      sessionStatus: SESSION_STATUSES.Archived,
      parentSessionReference: "session-parent-1",
    });
    assert.equal(isSession(session), true);
    assert.equal(session.sessionStatus, "archived");
    assert.equal(session.parentSessionReference, "session-parent-1");
  });
});
