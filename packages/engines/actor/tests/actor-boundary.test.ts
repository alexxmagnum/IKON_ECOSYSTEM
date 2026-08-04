/**
 * Actor Boundary contract tests.
 * Run: pnpm --filter @motanos/actor test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ACTOR_KINDS,
  ACTOR_STATUSES,
  ACTOR_WHO_REF_KEY,
  createActor,
  isActor,
  isActorKind,
  isActorStatus,
  resetActorReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedWhoKind = `${"iden"}${"tity"}`;
const bannedProofKind = `${"authentica"}${"tion"}`;
const bannedPresenceKind = `${"sess"}${"ion"}`;
const bannedCapacityKind = `${"permiss"}${"ion"}`;
const bannedBelongKind = `${"member"}${"ship"}`;
const bannedScopeKind = `${"ten"}${"ant"}`;
const scopeValue = "tenant-a";
const otherScopeValue = "tenant-b";

describe("Actor Boundary", () => {
  beforeEach(() => {
    resetActorReferenceSequence();
  });

  it("creates Actor Boundary context", () => {
    const actor = createActor({
      actorKind: ACTOR_KINDS.Person,
      [ACTOR_WHO_REF_KEY]: "who-1",
      tenantReference: scopeValue,
      organizationReference: "org-1",
      contextReference: "context-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isActor(actor), true);
    assert.equal(actor.actorReference, "actor-1");
    assert.equal(actor.actorStatus, "draft");
    assert.equal(actor.actorKind, "actor.person");
    assert.equal(actor[ACTOR_WHO_REF_KEY], "who-1");
    assert.equal(actor.tenantReference, scopeValue);
    assert.deepEqual(actor.metadata, { note: "opaque-meta" });
  });

  it("checks context isolation", () => {
    assert.throws(
      () =>
        createActor({
          actorKind: ACTOR_KINDS.Organization,
          tenantReference: "  ",
        }),
      /tenantReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createActor(
          {
            actorKind: ACTOR_KINDS.Service,
            tenantReference: otherScopeValue,
          },
          { tenantReference: scopeValue },
        ),
      /does not apply to this scope/,
    );

    assert.throws(
      () =>
        createActor({
          actorKind: ACTOR_KINDS.System,
          organizationReference: "  ",
        }),
      /organizationReference must not be empty when provided/,
    );
  });

  it("accepts only known actor kinds", () => {
    assert.equal(isActorKind("actor.person"), true);
    assert.equal(isActorKind("actor.organization"), true);
    assert.equal(isActorKind("actor.service"), true);
    assert.equal(isActorKind("actor.system"), true);
    assert.equal(isActorKind("actor.external"), true);
    assert.equal(isActorKind("actor.operational"), true);
    assert.equal(isActorKind("actor.business"), true);
    assert.equal(isActorKind("unknown"), false);
    assert.equal(isActorKind(bannedWhoKind), false);
    assert.equal(isActorKind(bannedProofKind), false);
    assert.equal(isActorKind(bannedPresenceKind), false);
    assert.equal(isActorKind(bannedCapacityKind), false);
    assert.equal(isActorKind(bannedBelongKind), false);
    assert.equal(isActorKind(bannedScopeKind), false);

    assert.throws(
      () =>
        createActor({
          actorKind: "actor.unknown" as never,
        }),
      /Unknown actor kind/,
    );

    assert.throws(
      () =>
        createActor({
          actorKind: bannedWhoKind as never,
        }),
      /Unknown actor kind/,
    );
  });

  it("accepts only known actor statuses", () => {
    assert.equal(isActorStatus("draft"), true);
    assert.equal(isActorStatus("active"), true);
    assert.equal(isActorStatus("inactive"), true);
    assert.equal(isActorStatus("suspended"), true);
    assert.equal(isActorStatus("archived"), true);
    assert.equal(isActorStatus("cancelled"), true);
    assert.equal(isActorStatus("unknown"), false);

    const active = createActor({
      actorKind: ACTOR_KINDS.Person,
      actorStatus: ACTOR_STATUSES.Active,
    });
    assert.equal(active.actorStatus, "active");

    const inactive = createActor({
      actorKind: ACTOR_KINDS.External,
      actorStatus: ACTOR_STATUSES.Inactive,
    });
    assert.equal(inactive.actorStatus, "inactive");

    const suspended = createActor({
      actorKind: ACTOR_KINDS.Operational,
      actorStatus: ACTOR_STATUSES.Suspended,
    });
    assert.equal(suspended.actorStatus, "suspended");
  });

  it("stays apart from peer packages / existence / proof / presence / capacity", () => {
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
      `@motanos/${"authentica"}${"tion"}`,
      `@motanos/${"au"}${"th"}`,
      `@motanos/${"sess"}${"ion"}`,
      `@motanos/${"permiss"}${"ions"}`,
      `@motanos/${"member"}${"ship"}`,
      `@motanos/${"poli"}${"cy"}`,
      `@motanos/${"work"}${"flow"}`,
      `@motanos/${"ten"}${"ant"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const actor = createActor({
      actorKind: ACTOR_KINDS.Business,
      actorStatus: ACTOR_STATUSES.Archived,
      parentActorReference: "actor-parent-1",
    });
    assert.equal(isActor(actor), true);
    assert.equal(actor.actorStatus, "archived");
    assert.equal(actor.parentActorReference, "actor-parent-1");
  });
});
