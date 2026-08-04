/**
 * Hospitality Community contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  COMMUNITY_KINDS,
  COMMUNITY_STATUSES,
  createCommunity,
  isCommunityKind,
  isCommunityStatus,
  isHospitalityCommunity,
  resetCommunityReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const communityRoot = join(packageRoot, "src", "community");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Community Boundary", () => {
  beforeEach(() => {
    resetCommunityReferenceSequence();
  });

  it("creates Community", () => {
    const community = createCommunity({
      communityKind: COMMUNITY_KINDS.Club,
      hospitalityReference: hospitalityBusiness,
      contextReference: "context-1",
      organizationReference: "organization-1",
      membershipReference: "membership-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityCommunity(community), true);
    assert.equal(community.communityReference, "community-1");
    assert.equal(community.communityStatus, "draft");
    assert.equal(community.communityKind, "community.club");
    assert.equal(community.hospitalityReference, hospitalityBusiness);
    assert.equal(community.organizationReference, "organization-1");
    assert.equal(community.membershipReference, "membership-1");
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createCommunity({
          communityKind: COMMUNITY_KINDS.Restaurant,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createCommunity(
          {
            communityKind: COMMUNITY_KINDS.Member,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createCommunity({
          communityKind: COMMUNITY_KINDS.Social,
          membershipReference: "  ",
        }),
      /membershipReference must not be empty when provided/,
    );
  });

  it("accepts only known community kinds", () => {
    assert.equal(isCommunityKind("community.member"), true);
    assert.equal(isCommunityKind("community.club"), true);
    assert.equal(isCommunityKind("community.restaurant"), true);
    assert.equal(isCommunityKind("community.social"), true);
    assert.equal(isCommunityKind("community.internal"), true);
    assert.equal(isCommunityKind("loyalty"), false);
    assert.equal(isCommunityKind("feed"), false);
    assert.equal(isCommunityKind("guild"), false);

    assert.throws(
      () =>
        createCommunity({
          communityKind: "community.unknown" as never,
        }),
      /Unknown community kind/,
    );

    assert.throws(
      () =>
        createCommunity({
          communityKind: "loyalty" as never,
        }),
      /Unknown community kind/,
    );
  });

  it("accepts only known community statuses", () => {
    assert.equal(isCommunityStatus("draft"), true);
    assert.equal(isCommunityStatus("active"), true);
    assert.equal(isCommunityStatus("inactive"), true);
    assert.equal(isCommunityStatus("archived"), true);
    assert.equal(isCommunityStatus("cancelled"), true);
    assert.equal(isCommunityStatus("unknown"), false);
    assert.equal(isCommunityStatus("engaged"), false);

    const active = createCommunity({
      communityKind: COMMUNITY_KINDS.Member,
      communityStatus: COMMUNITY_STATUSES.Active,
    });
    assert.equal(active.communityStatus, "active");

    const inactive = createCommunity({
      communityKind: COMMUNITY_KINDS.Internal,
      communityStatus: COMMUNITY_STATUSES.Inactive,
    });
    assert.equal(inactive.communityStatus, "inactive");
  });

  it("stays apart from gatherings / proposals / badges / scores / ladders / timeline logic", () => {
    const communitySources = readdirSync(communityRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(communityRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(communitySources.includes("activity logic"), false);
    assert.equal(communitySources.includes("event logic"), false);
    assert.equal(communitySources.includes("gamification"), false);
    assert.equal(communitySources.includes("reward"), false);
    assert.equal(communitySources.includes("points"), false);
    assert.equal(communitySources.includes("ranking"), false);
    assert.equal(communitySources.includes("social feed"), false);

    assert.equal(communitySources.includes("createmember"), false);
    assert.equal(communitySources.includes("createactivity"), false);
    assert.equal(communitySources.includes("createevent"), false);
    assert.equal(communitySources.includes("assignpoints"), false);
    assert.equal(communitySources.includes("createreward"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/community"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/social"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/membership"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/activity"),
      false,
    );

    const community = createCommunity({
      communityKind: COMMUNITY_KINDS.Social,
      communityStatus: COMMUNITY_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentCommunityReference: "community-parent-1",
    });
    assert.equal(isHospitalityCommunity(community), true);
    assert.equal(community.communityStatus, "archived");
    assert.equal(community.parentCommunityReference, "community-parent-1");
  });
});
