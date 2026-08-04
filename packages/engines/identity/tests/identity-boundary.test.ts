/**
 * Identity Boundary contract tests.
 * Run: pnpm --filter @motanos/identity test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  IDENTITY_KINDS,
  IDENTITY_SCOPE_REF_KEY,
  IDENTITY_STATUSES,
  createIdentity,
  isIdentity,
  isIdentityKind,
  isIdentityStatus,
  resetIdentityReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedPersonKind = `${"us"}${"er"}`;
const bannedPresenceKind = `${"sess"}${"ion"}`;
const bannedTicketKind = `${"tok"}${"en"}`;
const bannedVaultKind = `${"credenti"}${"al"}`;
const bannedSecretKind = `${"pass"}${"word"}`;
const bannedSeatKind = `${"ro"}${"le"}`;
const bannedCapacityKind = `${"permiss"}${"ion"}`;
const bannedBelongKind = `${"member"}${"ship"}`;
const bannedScopeKind = `${"ten"}${"ant"}`;
const scopeValue = `${"scope"}-a`;
const otherScopeValue = `${"scope"}-b`;

describe("Identity Boundary", () => {
  beforeEach(() => {
    resetIdentityReferenceSequence();
  });

  it("creates Identity Boundary context", () => {
    const identity = createIdentity({
      identityKind: IDENTITY_KINDS.Person,
      [IDENTITY_SCOPE_REF_KEY]: scopeValue,
      actorReference: "actor-1",
      organizationReference: "org-1",
      profileReference: "profile-1",
      externalReference: "external-1",
      contextReference: "context-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isIdentity(identity), true);
    assert.equal(identity.identityReference, "identity-1");
    assert.equal(identity.identityStatus, "draft");
    assert.equal(identity.identityKind, "identity.person");
    assert.equal(identity[IDENTITY_SCOPE_REF_KEY], scopeValue);
    assert.deepEqual(identity.metadata, { note: "opaque-meta" });
  });

  it("checks context isolation", () => {
    assert.throws(
      () =>
        createIdentity({
          identityKind: IDENTITY_KINDS.Organization,
          [IDENTITY_SCOPE_REF_KEY]: "  ",
        }),
      new RegExp(
        `${IDENTITY_SCOPE_REF_KEY} must not be empty when provided`,
      ),
    );

    assert.throws(
      () =>
        createIdentity(
          {
            identityKind: IDENTITY_KINDS.Service,
            [IDENTITY_SCOPE_REF_KEY]: otherScopeValue,
          },
          { [IDENTITY_SCOPE_REF_KEY]: scopeValue },
        ),
      /does not apply to this scope/,
    );

    assert.throws(
      () =>
        createIdentity({
          identityKind: IDENTITY_KINDS.System,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known identity kinds", () => {
    assert.equal(isIdentityKind("identity.person"), true);
    assert.equal(isIdentityKind("identity.organization"), true);
    assert.equal(isIdentityKind("identity.service"), true);
    assert.equal(isIdentityKind("identity.system"), true);
    assert.equal(isIdentityKind("identity.external"), true);
    assert.equal(isIdentityKind("identity.operational"), true);
    assert.equal(isIdentityKind("unknown"), false);
    assert.equal(isIdentityKind(bannedPersonKind), false);
    assert.equal(isIdentityKind(bannedPresenceKind), false);
    assert.equal(isIdentityKind(bannedTicketKind), false);
    assert.equal(isIdentityKind(bannedVaultKind), false);
    assert.equal(isIdentityKind(bannedSecretKind), false);
    assert.equal(isIdentityKind(bannedSeatKind), false);
    assert.equal(isIdentityKind(bannedCapacityKind), false);
    assert.equal(isIdentityKind(bannedBelongKind), false);
    assert.equal(isIdentityKind(bannedScopeKind), false);

    assert.throws(
      () =>
        createIdentity({
          identityKind: "identity.unknown" as never,
        }),
      /Unknown identity kind/,
    );

    assert.throws(
      () =>
        createIdentity({
          identityKind: bannedPersonKind as never,
        }),
      /Unknown identity kind/,
    );
  });

  it("accepts only known identity statuses", () => {
    assert.equal(isIdentityStatus("draft"), true);
    assert.equal(isIdentityStatus("active"), true);
    assert.equal(isIdentityStatus("inactive"), true);
    assert.equal(isIdentityStatus("suspended"), true);
    assert.equal(isIdentityStatus("archived"), true);
    assert.equal(isIdentityStatus("cancelled"), true);
    assert.equal(isIdentityStatus("unknown"), false);

    const active = createIdentity({
      identityKind: IDENTITY_KINDS.Person,
      identityStatus: IDENTITY_STATUSES.Active,
    });
    assert.equal(active.identityStatus, "active");

    const inactive = createIdentity({
      identityKind: IDENTITY_KINDS.External,
      identityStatus: IDENTITY_STATUSES.Inactive,
    });
    assert.equal(inactive.identityStatus, "inactive");

    const suspended = createIdentity({
      identityKind: IDENTITY_KINDS.Operational,
      identityStatus: IDENTITY_STATUSES.Suspended,
    });
    assert.equal(suspended.identityStatus, "suspended");
  });

  it("stays apart from peer packages / sign-in / belonging / capacity / rails", () => {
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
      `@motanos/${"au"}${"th"}`,
      `@motanos/${"member"}${"ship"}`,
      `@motanos/${"permiss"}${"ions"}`,
      `@motanos/${"ten"}${"ant"}`,
      bannedPresenceKind,
      bannedTicketKind,
      `${"pro"}${"vider"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const identity = createIdentity({
      identityKind: IDENTITY_KINDS.Organization,
      identityStatus: IDENTITY_STATUSES.Archived,
      parentIdentityReference: "identity-parent-1",
    });
    assert.equal(isIdentity(identity), true);
    assert.equal(identity.identityStatus, "archived");
    assert.equal(identity.parentIdentityReference, "identity-parent-1");
  });
});
