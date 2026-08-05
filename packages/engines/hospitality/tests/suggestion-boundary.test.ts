/**
 * Hospitality Engagement Suggestion contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ENGAGEMENT_SUGGESTION_KINDS,
  ENGAGEMENT_SUGGESTION_STATUSES,
  createSuggestion,
  isEngagementSuggestionKind,
  isEngagementSuggestionStatus,
  isHospitalityEngagementSuggestion,
  resetEngagementSuggestionReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const suggestionsRoot = join(packageRoot, "src", "suggestions");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Engagement Suggestion Boundary", () => {
  beforeEach(() => {
    resetEngagementSuggestionReferenceSequence();
  });

  it("creates Suggestion", () => {
    const suggestion = createSuggestion({
      suggestionKind: ENGAGEMENT_SUGGESTION_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      communityReference: "community-1",
      actorReference: "actor-1",
      memberReference: "member-1",
      engagementReference: "engagement-1",
      activityReference: "activity-related-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityEngagementSuggestion(suggestion), true);
    assert.equal(
      suggestion.suggestionReference,
      "engagement-suggestion-1",
    );
    assert.equal(suggestion.suggestionStatus, "draft");
    assert.equal(suggestion.suggestionKind, "suggestion.activity");
    assert.equal(suggestion.hospitalityReference, hospitalityBusiness);
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        suggestion,
        "approvedActivityReference",
      ),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    const ikon = createSuggestion({
      suggestionKind: ENGAGEMENT_SUGGESTION_KINDS.Event,
      hospitalityReference: hospitalityBusiness,
      communityReference: "community-ikon",
    });
    const marina = createSuggestion({
      suggestionKind: ENGAGEMENT_SUGGESTION_KINDS.Event,
      hospitalityReference: otherHospitalityBusiness,
      communityReference: "community-marina",
    });

    assert.equal(ikon.hospitalityReference, hospitalityBusiness);
    assert.equal(marina.hospitalityReference, otherHospitalityBusiness);
    assert.notEqual(ikon.hospitalityReference, marina.hospitalityReference);
    assert.notEqual(ikon.suggestionReference, marina.suggestionReference);
    assert.notEqual(ikon.communityReference, marina.communityReference);

    assert.throws(
      () =>
        createSuggestion({
          suggestionKind: ENGAGEMENT_SUGGESTION_KINDS.Community,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createSuggestion(
          {
            suggestionKind: ENGAGEMENT_SUGGESTION_KINDS.Business,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known suggestion kinds", () => {
    assert.equal(isEngagementSuggestionKind("suggestion.activity"), true);
    assert.equal(isEngagementSuggestionKind("suggestion.event"), true);
    assert.equal(isEngagementSuggestionKind("suggestion.experience"), true);
    assert.equal(isEngagementSuggestionKind("suggestion.community"), true);
    assert.equal(isEngagementSuggestionKind("suggestion.business"), true);
    assert.equal(isEngagementSuggestionKind("suggestion.internal"), true);
    assert.equal(isEngagementSuggestionKind("activity.published"), false);
    assert.equal(isEngagementSuggestionKind("ai.generated"), false);

    const kinds = [
      ENGAGEMENT_SUGGESTION_KINDS.Activity,
      ENGAGEMENT_SUGGESTION_KINDS.Event,
      ENGAGEMENT_SUGGESTION_KINDS.Experience,
      ENGAGEMENT_SUGGESTION_KINDS.Community,
      ENGAGEMENT_SUGGESTION_KINDS.Business,
      ENGAGEMENT_SUGGESTION_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const suggestion = createSuggestion({
        suggestionKind: kind,
        hospitalityReference: hospitalityBusiness,
      });
      assert.equal(suggestion.suggestionKind, kind);
    }

    assert.throws(
      () =>
        createSuggestion({
          suggestionKind: "suggestion.unknown" as never,
        }),
      /Unknown engagement-suggestion kind/,
    );
  });

  it("accepts only known suggestion statuses", () => {
    assert.equal(isEngagementSuggestionStatus("draft"), true);
    assert.equal(isEngagementSuggestionStatus("submitted"), true);
    assert.equal(isEngagementSuggestionStatus("review"), true);
    assert.equal(isEngagementSuggestionStatus("accepted"), true);
    assert.equal(isEngagementSuggestionStatus("rejected"), true);
    assert.equal(isEngagementSuggestionStatus("converted"), true);
    assert.equal(isEngagementSuggestionStatus("archived"), true);
    assert.equal(isEngagementSuggestionStatus("cancelled"), true);
    assert.equal(isEngagementSuggestionStatus("unknown"), false);
    assert.equal(isEngagementSuggestionStatus("published"), false);

    const submitted = createSuggestion({
      suggestionKind: ENGAGEMENT_SUGGESTION_KINDS.Event,
      suggestionStatus: ENGAGEMENT_SUGGESTION_STATUSES.Submitted,
    });
    assert.equal(submitted.suggestionStatus, "submitted");

    const review = createSuggestion({
      suggestionKind: ENGAGEMENT_SUGGESTION_KINDS.Experience,
      suggestionStatus: ENGAGEMENT_SUGGESTION_STATUSES.Review,
    });
    assert.equal(review.suggestionStatus, "review");

    const accepted = createSuggestion({
      suggestionKind: ENGAGEMENT_SUGGESTION_KINDS.Activity,
      suggestionStatus: ENGAGEMENT_SUGGESTION_STATUSES.Accepted,
    });
    assert.equal(accepted.suggestionStatus, "accepted");

    const converted = createSuggestion({
      suggestionKind: ENGAGEMENT_SUGGESTION_KINDS.Community,
      suggestionStatus: ENGAGEMENT_SUGGESTION_STATUSES.Converted,
    });
    assert.equal(converted.suggestionStatus, "converted");
  });

  it("stays apart from activity execution / schedule / notification / AI / reward logic", () => {
    const suggestionSources = readdirSync(suggestionsRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(suggestionsRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(suggestionSources.includes("activity execution"), false);
    assert.equal(suggestionSources.includes("schedule logic"), false);
    assert.equal(suggestionSources.includes("notification engine"), false);
    assert.equal(suggestionSources.includes("ai generation"), false);
    assert.equal(suggestionSources.includes("reward logic"), false);

    assert.equal(suggestionSources.includes("approvesuggestion"), false);
    assert.equal(suggestionSources.includes("converttoactivity"), false);
    assert.equal(suggestionSources.includes("notifyowner"), false);
    assert.equal(suggestionSources.includes("generatesuggestion"), false);

    assert.equal(
      suggestionSources.includes("approvedactivityreference"),
      false,
    );

    const pkg = JSON.parse(
      readFileSync(join(packageRoot, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
    };
    assert.deepEqual(Object.keys(pkg.dependencies ?? {}).sort(), [
      "@motanos/contracts",
      "@motanos/core",
    ]);
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/suggestions"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/ideas"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/community-posts"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/social-feed"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/marketing"),
      false,
    );

    const suggestion = createSuggestion({
      suggestionKind: ENGAGEMENT_SUGGESTION_KINDS.Internal,
      suggestionStatus: ENGAGEMENT_SUGGESTION_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentSuggestionReference: "engagement-suggestion-parent-1",
    });
    assert.equal(isHospitalityEngagementSuggestion(suggestion), true);
    assert.equal(suggestion.suggestionStatus, "archived");
    assert.equal(
      suggestion.parentSuggestionReference,
      "engagement-suggestion-parent-1",
    );
  });
});
