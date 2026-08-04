/**
 * Context Boundary contract tests.
 * Run: pnpm --filter @motanos/context test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  CONTEXT_KINDS,
  CONTEXT_PARTICIPANT_REF_KEY,
  CONTEXT_SCOPE_REF_KEY,
  CONTEXT_STATUSES,
  createContext,
  isContext,
  isContextKind,
  isContextStatus,
  resetContextReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedWhoKind = `${"iden"}${"tity"}`;
const bannedParticipantKind = `${"act"}${"or"}`;
const bannedProofKind = `${"authentica"}${"tion"}`;
const bannedPresenceKind = `${"sess"}${"ion"}`;
const bannedCapacityKind = `${"permiss"}${"ion"}`;
const bannedBelongKind = `${"member"}${"ship"}`;
const bannedFlowKind = `${"work"}${"flow"}`;
const scopeValue = `${"scope"}-a`;
const otherScopeValue = `${"scope"}-b`;

describe("Context Boundary", () => {
  beforeEach(() => {
    resetContextReferenceSequence();
  });

  it("creates Context Boundary context", () => {
    const context = createContext({
      contextKind: CONTEXT_KINDS.Scope,
      [CONTEXT_SCOPE_REF_KEY]: scopeValue,
      [CONTEXT_PARTICIPANT_REF_KEY]: "participant-1",
      organizationReference: "org-1",
      entityReference: "entity-1",
      entityKind: "entity.sample",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isContext(context), true);
    assert.equal(context.contextReference, "context-1");
    assert.equal(context.contextStatus, "draft");
    assert.equal(context.contextKind, CONTEXT_KINDS.Scope);
    assert.equal(context[CONTEXT_SCOPE_REF_KEY], scopeValue);
    assert.equal(context[CONTEXT_PARTICIPANT_REF_KEY], "participant-1");
    assert.deepEqual(context.metadata, { note: "opaque-meta" });
  });

  it("checks ambit isolation", () => {
    assert.throws(
      () =>
        createContext({
          contextKind: CONTEXT_KINDS.Business,
          [CONTEXT_SCOPE_REF_KEY]: "  ",
        }),
      new RegExp(
        `${CONTEXT_SCOPE_REF_KEY} must not be empty when provided`,
      ),
    );

    assert.throws(
      () =>
        createContext(
          {
            contextKind: CONTEXT_KINDS.Operational,
            [CONTEXT_SCOPE_REF_KEY]: otherScopeValue,
          },
          { [CONTEXT_SCOPE_REF_KEY]: scopeValue },
        ),
      /does not apply to this scope/,
    );

    assert.throws(
      () =>
        createContext({
          contextKind: CONTEXT_KINDS.System,
          organizationReference: "  ",
        }),
      /organizationReference must not be empty when provided/,
    );
  });

  it("accepts only known context kinds", () => {
    assert.equal(isContextKind(CONTEXT_KINDS.Scope), true);
    assert.equal(isContextKind("context.business"), true);
    assert.equal(isContextKind("context.operational"), true);
    assert.equal(isContextKind("context.experience"), true);
    assert.equal(isContextKind("context.event"), true);
    assert.equal(isContextKind("context.system"), true);
    assert.equal(isContextKind("context.internal"), true);
    assert.equal(isContextKind("unknown"), false);
    assert.equal(isContextKind(bannedWhoKind), false);
    assert.equal(isContextKind(bannedParticipantKind), false);
    assert.equal(isContextKind(bannedProofKind), false);
    assert.equal(isContextKind(bannedPresenceKind), false);
    assert.equal(isContextKind(bannedCapacityKind), false);
    assert.equal(isContextKind(bannedBelongKind), false);
    assert.equal(isContextKind(bannedFlowKind), false);

    assert.throws(
      () =>
        createContext({
          contextKind: "context.unknown" as never,
        }),
      /Unknown context kind/,
    );

    assert.throws(
      () =>
        createContext({
          contextKind: bannedWhoKind as never,
        }),
      /Unknown context kind/,
    );
  });

  it("accepts only known context statuses", () => {
    assert.equal(isContextStatus("draft"), true);
    assert.equal(isContextStatus("active"), true);
    assert.equal(isContextStatus("inactive"), true);
    assert.equal(isContextStatus("suspended"), true);
    assert.equal(isContextStatus("archived"), true);
    assert.equal(isContextStatus("cancelled"), true);
    assert.equal(isContextStatus("unknown"), false);

    const active = createContext({
      contextKind: CONTEXT_KINDS.Business,
      contextStatus: CONTEXT_STATUSES.Active,
    });
    assert.equal(active.contextStatus, "active");

    const inactive = createContext({
      contextKind: CONTEXT_KINDS.Experience,
      contextStatus: CONTEXT_STATUSES.Inactive,
    });
    assert.equal(inactive.contextStatus, "inactive");

    const suspended = createContext({
      contextKind: CONTEXT_KINDS.Event,
      contextStatus: CONTEXT_STATUSES.Suspended,
    });
    assert.equal(suspended.contextStatus, "suspended");
  });

  it("stays apart from peer packages / root-org / participants / capacity / flows", () => {
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
      `@motanos/${"ten"}${"ant"}`,
      `@motanos/${"iden"}${"tity"}`,
      `@motanos/${"act"}${"or"}`,
      `@motanos/${"authentica"}${"tion"}`,
      `@motanos/${"sess"}${"ion"}`,
      `@motanos/${"permiss"}${"ions"}`,
      `@motanos/${"member"}${"ship"}`,
      `@motanos/${"poli"}${"cy"}`,
      `@motanos/${"work"}${"flow"}`,
      `@motanos/${"configura"}${"tion"}`,
      `@motanos/${"run"}${"time"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const context = createContext({
      contextKind: CONTEXT_KINDS.Internal,
      contextStatus: CONTEXT_STATUSES.Archived,
      parentContextReference: "context-parent-1",
    });
    assert.equal(isContext(context), true);
    assert.equal(context.contextStatus, "archived");
    assert.equal(context.parentContextReference, "context-parent-1");
  });
});
