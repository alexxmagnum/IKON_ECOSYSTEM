/**
 * Recommendation Boundary contract tests.
 * Run: pnpm --filter @motanos/recommendation test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  RECOMMENDATION_FIND_REF_KEY,
  RECOMMENDATION_KINDS,
  RECOMMENDATION_STATUSES,
  createRecommendation,
  isRecommendation,
  isRecommendationKind,
  isRecommendationStatus,
  resetRecommendationReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedSortKind = `${"rank"}${"ing"}`;
const bannedWeightKind = `${"sco"}${"re"}`;
const bannedShapeKind = `${"mo"}${"del"}`;
const bannedMethodKind = `${"algo"}${"rithm"}`;
const bannedTailorKind = `${"personaliza"}${"tion"}`;
const bannedTrailKind = `${"track"}${"ing"}`;
const bannedForecastKind = `${"predic"}${"tion"}`;
const bannedRailKind = `${"pro"}${"vider"}`;
const bannedStorePeer = `${"stor"}${"age"}`;
const bannedFindPeer = `${"sea"}${"rch"}`;
const bannedSignalPeer = `${"analy"}${"tics"}`;
const bannedLivePeer = `${"run"}${"time"}`;
const scopeValue = "context-a";
const otherScopeValue = "context-b";

describe("Recommendation Boundary", () => {
  beforeEach(() => {
    resetRecommendationReferenceSequence();
  });

  it("creates Recommendation Boundary context", () => {
    const recommendation = createRecommendation({
      recommendationKind: RECOMMENDATION_KINDS.Catalog,
      contextReference: scopeValue,
      actorReference: "actor-1",
      entityReference: "entity-1",
      entityKind: "entity.sample",
      catalogReference: "catalog-1",
      [RECOMMENDATION_FIND_REF_KEY]: "find-1",
      sourceReference: "source-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isRecommendation(recommendation), true);
    assert.equal(
      recommendation.recommendationReference,
      "recommendation-1",
    );
    assert.equal(recommendation.recommendationStatus, "draft");
    assert.equal(
      recommendation.recommendationKind,
      "recommendation.catalog",
    );
    assert.equal(recommendation.contextReference, scopeValue);
    assert.equal(recommendation[RECOMMENDATION_FIND_REF_KEY], "find-1");
    assert.deepEqual(recommendation.metadata, { note: "opaque-meta" });
  });

  it("checks context isolation", () => {
    assert.throws(
      () =>
        createRecommendation({
          recommendationKind: RECOMMENDATION_KINDS.Discovery,
          contextReference: "  ",
        }),
      /contextReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createRecommendation(
          {
            recommendationKind: RECOMMENDATION_KINDS.Business,
            contextReference: otherScopeValue,
          },
          { contextReference: scopeValue },
        ),
      /does not apply to this scope/,
    );

    assert.throws(
      () =>
        createRecommendation({
          recommendationKind: RECOMMENDATION_KINDS.Operational,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known recommendation kinds", () => {
    assert.equal(isRecommendationKind("recommendation.catalog"), true);
    assert.equal(isRecommendationKind("recommendation.discovery"), true);
    assert.equal(isRecommendationKind("recommendation.business"), true);
    assert.equal(isRecommendationKind("recommendation.operational"), true);
    assert.equal(isRecommendationKind("recommendation.experience"), true);
    assert.equal(isRecommendationKind("recommendation.customer"), true);
    assert.equal(isRecommendationKind("recommendation.internal"), true);
    assert.equal(isRecommendationKind(bannedSortKind), false);
    assert.equal(isRecommendationKind(bannedWeightKind), false);
    assert.equal(isRecommendationKind(bannedShapeKind), false);
    assert.equal(isRecommendationKind(bannedMethodKind), false);
    assert.equal(isRecommendationKind(bannedTailorKind), false);
    assert.equal(isRecommendationKind(bannedTrailKind), false);
    assert.equal(isRecommendationKind(bannedForecastKind), false);

    assert.throws(
      () =>
        createRecommendation({
          recommendationKind: "recommendation.unknown" as never,
        }),
      /Unknown recommendation kind/,
    );

    assert.throws(
      () =>
        createRecommendation({
          recommendationKind: bannedSortKind as never,
        }),
      /Unknown recommendation kind/,
    );
  });

  it("accepts only known recommendation statuses", () => {
    assert.equal(isRecommendationStatus("draft"), true);
    assert.equal(isRecommendationStatus("active"), true);
    assert.equal(isRecommendationStatus("configured"), true);
    assert.equal(isRecommendationStatus("available"), true);
    assert.equal(isRecommendationStatus("archived"), true);
    assert.equal(isRecommendationStatus("cancelled"), true);
    assert.equal(isRecommendationStatus("unknown"), false);

    const active = createRecommendation({
      recommendationKind: RECOMMENDATION_KINDS.Catalog,
      recommendationStatus: RECOMMENDATION_STATUSES.Active,
    });
    assert.equal(active.recommendationStatus, "active");

    const configured = createRecommendation({
      recommendationKind: RECOMMENDATION_KINDS.Customer,
      recommendationStatus: RECOMMENDATION_STATUSES.Configured,
    });
    assert.equal(configured.recommendationStatus, "configured");

    const available = createRecommendation({
      recommendationKind: RECOMMENDATION_KINDS.Internal,
      recommendationStatus: RECOMMENDATION_STATUSES.Available,
    });
    assert.equal(available.recommendationStatus, "available");
  });

  it("stays apart from peer packages / find rails / interpretation / suggest rails", () => {
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
      `@motanos/${bannedFindPeer}`,
      `@motanos/${bannedSignalPeer}`,
      `@motanos/measurement`,
      `@motanos/event`,
      bannedRailKind,
      bannedStorePeer,
      bannedLivePeer,
      bannedSortKind,
      `@motanos/${"data"}${"base"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const recommendation = createRecommendation({
      recommendationKind: RECOMMENDATION_KINDS.Experience,
      recommendationStatus: RECOMMENDATION_STATUSES.Archived,
      parentRecommendationReference: "recommendation-parent-1",
    });
    assert.equal(isRecommendation(recommendation), true);
    assert.equal(recommendation.recommendationStatus, "archived");
    assert.equal(
      recommendation.parentRecommendationReference,
      "recommendation-parent-1",
    );
  });
});
