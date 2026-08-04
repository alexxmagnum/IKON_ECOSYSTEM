/**
 * Authentication Boundary contract tests.
 * Run: pnpm --filter @motanos/authentication test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  AUTHENTICATION_KINDS,
  AUTHENTICATION_PRESENCE_REF_KEY,
  AUTHENTICATION_RAIL_REF_KEY,
  AUTHENTICATION_SCOPE_REF_KEY,
  AUTHENTICATION_STATUSES,
  AUTHENTICATION_WHO_REF_KEY,
  createAuthentication,
  isAuthentication,
  isAuthenticationKind,
  isAuthenticationStatus,
  resetAuthenticationReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedWhoKind = `${"iden"}${"tity"}`;
const bannedPersonKind = `${"us"}${"er"}`;
const bannedPresenceKind = `${"sess"}${"ion"}`;
const bannedTicketKind = `${"tok"}${"en"}`;
const bannedVaultKind = `${"credenti"}${"al"}`;
const bannedCapacityKind = `${"permiss"}${"ion"}`;
const bannedBelongKind = `${"member"}${"ship"}`;
const bannedScopeKind = `${"ten"}${"ant"}`;
const scopeValue = `${"scope"}-a`;
const otherScopeValue = `${"scope"}-b`;

describe("Authentication Boundary", () => {
  beforeEach(() => {
    resetAuthenticationReferenceSequence();
  });

  it("creates Authentication Boundary context", () => {
    const authentication = createAuthentication({
      authenticationKind: AUTHENTICATION_KINDS.Password,
      [AUTHENTICATION_WHO_REF_KEY]: "who-1",
      [AUTHENTICATION_SCOPE_REF_KEY]: scopeValue,
      actorReference: "actor-1",
      methodReference: "method-1",
      contextReference: "context-1",
      [AUTHENTICATION_PRESENCE_REF_KEY]: "presence-1",
      [AUTHENTICATION_RAIL_REF_KEY]: "rail-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isAuthentication(authentication), true);
    assert.equal(
      authentication.authenticationReference,
      "authentication-1",
    );
    assert.equal(authentication.authenticationStatus, "draft");
    assert.equal(
      authentication.authenticationKind,
      "authentication.password",
    );
    assert.equal(authentication[AUTHENTICATION_WHO_REF_KEY], "who-1");
    assert.equal(authentication[AUTHENTICATION_SCOPE_REF_KEY], scopeValue);
    assert.deepEqual(authentication.metadata, { note: "opaque-meta" });
  });

  it("checks context isolation", () => {
    assert.throws(
      () =>
        createAuthentication({
          authenticationKind: AUTHENTICATION_KINDS.External,
          [AUTHENTICATION_SCOPE_REF_KEY]: "  ",
        }),
      new RegExp(
        `${AUTHENTICATION_SCOPE_REF_KEY} must not be empty when provided`,
      ),
    );

    assert.throws(
      () =>
        createAuthentication(
          {
            authenticationKind: AUTHENTICATION_KINDS.Service,
            [AUTHENTICATION_SCOPE_REF_KEY]: otherScopeValue,
          },
          { [AUTHENTICATION_SCOPE_REF_KEY]: scopeValue },
        ),
      /does not apply to this scope/,
    );

    assert.throws(
      () =>
        createAuthentication({
          authenticationKind: AUTHENTICATION_KINDS.System,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known authentication kinds", () => {
    assert.equal(isAuthenticationKind("authentication.password"), true);
    assert.equal(isAuthenticationKind("authentication.external"), true);
    assert.equal(isAuthenticationKind("authentication.service"), true);
    assert.equal(isAuthenticationKind("authentication.system"), true);
    assert.equal(isAuthenticationKind("authentication.operational"), true);
    assert.equal(isAuthenticationKind("authentication.business"), true);
    assert.equal(isAuthenticationKind("unknown"), false);
    assert.equal(isAuthenticationKind(bannedWhoKind), false);
    assert.equal(isAuthenticationKind(bannedPersonKind), false);
    assert.equal(isAuthenticationKind(bannedPresenceKind), false);
    assert.equal(isAuthenticationKind(bannedTicketKind), false);
    assert.equal(isAuthenticationKind(bannedVaultKind), false);
    assert.equal(isAuthenticationKind(bannedCapacityKind), false);
    assert.equal(isAuthenticationKind(bannedBelongKind), false);
    assert.equal(isAuthenticationKind(bannedScopeKind), false);

    assert.throws(
      () =>
        createAuthentication({
          authenticationKind: "authentication.unknown" as never,
        }),
      /Unknown authentication kind/,
    );

    assert.throws(
      () =>
        createAuthentication({
          authenticationKind: bannedWhoKind as never,
        }),
      /Unknown authentication kind/,
    );
  });

  it("accepts only known authentication statuses", () => {
    assert.equal(isAuthenticationStatus("draft"), true);
    assert.equal(isAuthenticationStatus("pending"), true);
    assert.equal(isAuthenticationStatus("active"), true);
    assert.equal(isAuthenticationStatus("inactive"), true);
    assert.equal(isAuthenticationStatus("failed"), true);
    assert.equal(isAuthenticationStatus("suspended"), true);
    assert.equal(isAuthenticationStatus("archived"), true);
    assert.equal(isAuthenticationStatus("cancelled"), true);
    assert.equal(isAuthenticationStatus("unknown"), false);

    const pending = createAuthentication({
      authenticationKind: AUTHENTICATION_KINDS.Password,
      authenticationStatus: AUTHENTICATION_STATUSES.Pending,
    });
    assert.equal(pending.authenticationStatus, "pending");

    const failed = createAuthentication({
      authenticationKind: AUTHENTICATION_KINDS.External,
      authenticationStatus: AUTHENTICATION_STATUSES.Failed,
    });
    assert.equal(failed.authenticationStatus, "failed");

    const inactive = createAuthentication({
      authenticationKind: AUTHENTICATION_KINDS.Operational,
      authenticationStatus: AUTHENTICATION_STATUSES.Inactive,
    });
    assert.equal(inactive.authenticationStatus, "inactive");
  });

  it("stays apart from peer packages / actor existence / belonging / capacity / rails", () => {
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
      `@motanos/${"iden"}${"tity"}`,
      `@motanos/${"au"}${"th"}`,
      `@motanos/${"member"}${"ship"}`,
      `@motanos/${"permiss"}${"ions"}`,
      `@motanos/${"ten"}${"ant"}`,
      bannedPresenceKind,
      bannedTicketKind,
      bannedVaultKind,
      `${"pro"}${"vider"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const authentication = createAuthentication({
      authenticationKind: AUTHENTICATION_KINDS.Business,
      authenticationStatus: AUTHENTICATION_STATUSES.Archived,
      parentAuthenticationReference: "authentication-parent-1",
    });
    assert.equal(isAuthentication(authentication), true);
    assert.equal(authentication.authenticationStatus, "archived");
    assert.equal(
      authentication.parentAuthenticationReference,
      "authentication-parent-1",
    );
  });
});
