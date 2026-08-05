/**
 * Hospitality Customer Engagement contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  CUSTOMER_ENGAGEMENT_KINDS,
  CUSTOMER_ENGAGEMENT_STATUSES,
  createCustomerEngagement,
  isCustomerEngagementKind,
  isCustomerEngagementStatus,
  isHospitalityCustomerEngagement,
  resetCustomerEngagementReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const customerEngagementRoot = join(
  packageRoot,
  "src",
  "customer-engagement",
);
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Customer Engagement Boundary", () => {
  beforeEach(() => {
    resetCustomerEngagementReferenceSequence();
  });

  it("creates CustomerEngagement", () => {
    const engagement = createCustomerEngagement({
      engagementKind: CUSTOMER_ENGAGEMENT_KINDS.Community,
      hospitalityReference: hospitalityBusiness,
      communityReference: "community-1",
      actorReference: "actor-1",
      memberReference: "member-1",
      interactionReference: "interaction-1",
      activityReference: "activity-1",
      participationReference: "participation-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityCustomerEngagement(engagement), true);
    assert.equal(
      engagement.engagementReference,
      "customer-engagement-1",
    );
    assert.equal(engagement.engagementStatus, "draft");
    assert.equal(engagement.engagementKind, "engagement.community");
    assert.equal(engagement.hospitalityReference, hospitalityBusiness);
    assert.equal(
      Object.prototype.hasOwnProperty.call(engagement, "points"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(engagement, "score"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(engagement, "level"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(engagement, "rank"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    const ikon = createCustomerEngagement({
      engagementKind: CUSTOMER_ENGAGEMENT_KINDS.Relationship,
      hospitalityReference: hospitalityBusiness,
      communityReference: "community-ikon",
    });
    const marina = createCustomerEngagement({
      engagementKind: CUSTOMER_ENGAGEMENT_KINDS.Relationship,
      hospitalityReference: otherHospitalityBusiness,
      communityReference: "community-marina",
    });

    assert.equal(ikon.hospitalityReference, hospitalityBusiness);
    assert.equal(marina.hospitalityReference, otherHospitalityBusiness);
    assert.notEqual(ikon.hospitalityReference, marina.hospitalityReference);
    assert.notEqual(ikon.communityReference, marina.communityReference);

    assert.throws(
      () =>
        createCustomerEngagement({
          engagementKind: CUSTOMER_ENGAGEMENT_KINDS.Discovery,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createCustomerEngagement(
          {
            engagementKind: CUSTOMER_ENGAGEMENT_KINDS.Activity,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known customer-engagement kinds", () => {
    assert.equal(isCustomerEngagementKind("engagement.discovery"), true);
    assert.equal(isCustomerEngagementKind("engagement.interaction"), true);
    assert.equal(isCustomerEngagementKind("engagement.community"), true);
    assert.equal(isCustomerEngagementKind("engagement.activity"), true);
    assert.equal(isCustomerEngagementKind("engagement.relationship"), true);
    assert.equal(isCustomerEngagementKind("engagement.internal"), true);
    assert.equal(isCustomerEngagementKind("loyalty.points"), false);
    assert.equal(isCustomerEngagementKind("marketing.campaign"), false);

    const kinds = [
      CUSTOMER_ENGAGEMENT_KINDS.Discovery,
      CUSTOMER_ENGAGEMENT_KINDS.Interaction,
      CUSTOMER_ENGAGEMENT_KINDS.Community,
      CUSTOMER_ENGAGEMENT_KINDS.Activity,
      CUSTOMER_ENGAGEMENT_KINDS.Relationship,
      CUSTOMER_ENGAGEMENT_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const engagement = createCustomerEngagement({
        engagementKind: kind,
        hospitalityReference: hospitalityBusiness,
      });
      assert.equal(engagement.engagementKind, kind);
    }

    assert.throws(
      () =>
        createCustomerEngagement({
          engagementKind: "engagement.unknown" as never,
        }),
      /Unknown customer-engagement kind/,
    );
  });

  it("accepts only known customer-engagement statuses", () => {
    assert.equal(isCustomerEngagementStatus("draft"), true);
    assert.equal(isCustomerEngagementStatus("available"), true);
    assert.equal(isCustomerEngagementStatus("active"), true);
    assert.equal(isCustomerEngagementStatus("paused"), true);
    assert.equal(isCustomerEngagementStatus("completed"), true);
    assert.equal(isCustomerEngagementStatus("archived"), true);
    assert.equal(isCustomerEngagementStatus("cancelled"), true);
    assert.equal(isCustomerEngagementStatus("unknown"), false);
    assert.equal(isCustomerEngagementStatus("gold"), false);
    assert.equal(isCustomerEngagementStatus("rewarded"), false);

    const available = createCustomerEngagement({
      engagementKind: CUSTOMER_ENGAGEMENT_KINDS.Discovery,
      engagementStatus: CUSTOMER_ENGAGEMENT_STATUSES.Available,
    });
    assert.equal(available.engagementStatus, "available");

    const active = createCustomerEngagement({
      engagementKind: CUSTOMER_ENGAGEMENT_KINDS.Interaction,
      engagementStatus: CUSTOMER_ENGAGEMENT_STATUSES.Active,
    });
    assert.equal(active.engagementStatus, "active");

    const paused = createCustomerEngagement({
      engagementKind: CUSTOMER_ENGAGEMENT_KINDS.Relationship,
      engagementStatus: CUSTOMER_ENGAGEMENT_STATUSES.Paused,
    });
    assert.equal(paused.engagementStatus, "paused");

    const completed = createCustomerEngagement({
      engagementKind: CUSTOMER_ENGAGEMENT_KINDS.Activity,
      engagementStatus: CUSTOMER_ENGAGEMENT_STATUSES.Completed,
    });
    assert.equal(completed.engagementStatus, "completed");
  });

  it("stays apart from points / rewards / discounts / ranking / gamification logic", () => {
    const engagementSources = readdirSync(customerEngagementRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(customerEngagementRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(engagementSources.includes("points"), false);
    assert.equal(engagementSources.includes("rewards"), false);
    assert.equal(engagementSources.includes("discounts"), false);
    assert.equal(engagementSources.includes("ranking"), false);
    assert.equal(engagementSources.includes("gamification logic"), false);
    assert.equal(engagementSources.includes("loyalty logic"), false);
    assert.equal(engagementSources.includes("marketing logic"), false);
    assert.equal(engagementSources.includes("campaign logic"), false);

    assert.equal(engagementSources.includes("calculatepoints"), false);
    assert.equal(engagementSources.includes("assignreward"), false);
    assert.equal(engagementSources.includes("upgradelevel"), false);
    assert.equal(engagementSources.includes("sendcampaign"), false);
    assert.equal(engagementSources.includes("creatediscount"), false);

    assert.equal(engagementSources.includes("score:"), false);
    assert.equal(engagementSources.includes("level:"), false);
    assert.equal(engagementSources.includes("rank:"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/engagement"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/social"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/marketing"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/loyalty"),
      false,
    );

    const engagement = createCustomerEngagement({
      engagementKind: CUSTOMER_ENGAGEMENT_KINDS.Internal,
      engagementStatus: CUSTOMER_ENGAGEMENT_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentEngagementReference: "customer-engagement-parent-1",
    });
    assert.equal(isHospitalityCustomerEngagement(engagement), true);
    assert.equal(engagement.engagementStatus, "archived");
    assert.equal(
      engagement.parentEngagementReference,
      "customer-engagement-parent-1",
    );
  });
});
