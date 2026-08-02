/**
 * Recommendation Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/recommendation test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  RECOMMENDATION_KINDS,
  RECOMMENDATION_STATUSES,
  createRecommendation,
  isRecommendation,
  isRecommendationKind,
  isRecommendationStatus,
  resetRecommendationReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Recommendation Engine Boundary", () => {
  beforeEach(() => {
    resetRecommendationReferenceSequence();
  });

  it("creates Recommendation Boundary context", () => {
    const recommendation = createRecommendation({
      tenantReference: "tenant-a",
      recommendationKind: RECOMMENDATION_KINDS.Experience,
      targetReference: "exp-1",
      targetKind: "experience",
      contextReference: "context-1",
      ownerReference: "owner-1",
    });
    assert.equal(isRecommendation(recommendation), true);
    assert.equal(recommendation.recommendationReference, "recommendation-1");
    assert.equal(recommendation.recommendationStatus, "draft");
    assert.equal(
      recommendation.recommendationKind,
      "recommendation.experience",
    );
    assert.equal(recommendation.tenantReference, "tenant-a");
    assert.equal(recommendation.targetReference, "exp-1");
  });

  it("checks tenant isolation", () => {
    assert.throws(
      () =>
        createRecommendation({
          tenantReference: "  ",
          recommendationKind: RECOMMENDATION_KINDS.Community,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createRecommendation(
          {
            tenantReference: "tenant-b",
            recommendationKind: RECOMMENDATION_KINDS.Content,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createRecommendation({
          tenantReference: "tenant-a",
          recommendationKind: RECOMMENDATION_KINDS.Resource,
          ownerReference: "  ",
        }),
      /ownerReference must not be empty when provided/,
    );
  });

  it("accepts only known recommendation kinds", () => {
    assert.equal(isRecommendationKind("recommendation.experience"), true);
    assert.equal(isRecommendationKind("recommendation.community"), true);
    assert.equal(isRecommendationKind("recommendation.content"), true);
    assert.equal(isRecommendationKind("recommendation.resource"), true);
    assert.equal(isRecommendationKind("recommendation.operational"), true);
    assert.equal(isRecommendationKind("recommendation.business"), true);
    assert.equal(isRecommendationKind("recommendation.unknown"), false);

    assert.throws(
      () =>
        createRecommendation({
          tenantReference: "tenant-a",
          recommendationKind: "recommendation.unknown" as never,
        }),
      /Unknown recommendation kind/,
    );
  });

  it("accepts only known recommendation statuses", () => {
    assert.equal(isRecommendationStatus("draft"), true);
    assert.equal(isRecommendationStatus("active"), true);
    assert.equal(isRecommendationStatus("paused"), true);
    assert.equal(isRecommendationStatus("accepted"), true);
    assert.equal(isRecommendationStatus("dismissed"), true);
    assert.equal(isRecommendationStatus("archived"), true);
    assert.equal(isRecommendationStatus("cancelled"), true);
    assert.equal(isRecommendationStatus("unknown"), false);

    const active = createRecommendation({
      tenantReference: "tenant-a",
      recommendationKind: RECOMMENDATION_KINDS.Business,
      recommendationStatus: RECOMMENDATION_STATUSES.Active,
    });
    assert.equal(active.recommendationStatus, "active");

    const accepted = createRecommendation({
      tenantReference: "tenant-a",
      recommendationKind: RECOMMENDATION_KINDS.Operational,
      recommendationStatus: RECOMMENDATION_STATUSES.Accepted,
    });
    assert.equal(accepted.recommendationStatus, "accepted");
  });

  it("stays separated from discovery / measurement / peer packages", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/search"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/identity"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/community"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/experience"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/commerce"),
      false,
    );

    const recommendation = createRecommendation({
      tenantReference: "tenant-a",
      recommendationKind: RECOMMENDATION_KINDS.Content,
      recommendationStatus: RECOMMENDATION_STATUSES.Dismissed,
      sourceReference: "source-1",
    });
    assert.equal(isRecommendation(recommendation), true);
    assert.equal(recommendation.recommendationStatus, "dismissed");
    assert.equal(recommendation.sourceReference, "source-1");
  });
});
