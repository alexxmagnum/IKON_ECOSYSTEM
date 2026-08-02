/**
 * Community Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/community test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  COMMUNITY_KINDS,
  COMMUNITY_STATUSES,
  createCommunity,
  isCommunity,
  isCommunityKind,
  isCommunityStatus,
  resetCommunityReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Community Engine Boundary", () => {
  beforeEach(() => {
    resetCommunityReferenceSequence();
  });

  it("creates Community Boundary context", () => {
    const community = createCommunity({
      tenantReference: "tenant-a",
      communityKind: COMMUNITY_KINDS.Group,
      nameReference: "name-1",
      descriptionReference: "desc-1",
      ownerReference: "owner-1",
      actorReference: "actor-1",
      parentCommunityReference: "club-1",
    });
    assert.equal(isCommunity(community), true);
    assert.equal(community.communityReference, "community-1");
    assert.equal(community.communityStatus, "draft");
    assert.equal(community.communityKind, "community.group");
    assert.equal(community.tenantReference, "tenant-a");
    assert.equal(community.parentCommunityReference, "club-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createCommunity({
          tenantReference: "  ",
          communityKind: COMMUNITY_KINDS.Club,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createCommunity(
          {
            tenantReference: "tenant-b",
            communityKind: COMMUNITY_KINDS.Team,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createCommunity({
          tenantReference: "tenant-a",
          communityKind: COMMUNITY_KINDS.Circle,
          nameReference: "  ",
        }),
      /nameReference must not be empty when provided/,
    );
  });

  it("accepts only known community kinds", () => {
    assert.equal(isCommunityKind("community.club"), true);
    assert.equal(isCommunityKind("community.group"), true);
    assert.equal(isCommunityKind("community.team"), true);
    assert.equal(isCommunityKind("community.circle"), true);
    assert.equal(isCommunityKind("community.network"), true);
    assert.equal(isCommunityKind("community.operational"), true);
    assert.equal(isCommunityKind("community.unknown"), false);

    assert.throws(
      () =>
        createCommunity({
          tenantReference: "tenant-a",
          communityKind: "community.unknown" as never,
        }),
      /Unknown community kind/,
    );
  });

  it("accepts only known community statuses", () => {
    assert.equal(isCommunityStatus("draft"), true);
    assert.equal(isCommunityStatus("active"), true);
    assert.equal(isCommunityStatus("paused"), true);
    assert.equal(isCommunityStatus("archived"), true);
    assert.equal(isCommunityStatus("cancelled"), true);
    assert.equal(isCommunityStatus("unknown"), false);

    const active = createCommunity({
      tenantReference: "tenant-a",
      communityKind: COMMUNITY_KINDS.Network,
      communityStatus: COMMUNITY_STATUSES.Active,
    });
    assert.equal(active.communityStatus, "active");

    const paused = createCommunity({
      tenantReference: "tenant-a",
      communityKind: COMMUNITY_KINDS.Operational,
      communityStatus: COMMUNITY_STATUSES.Paused,
    });
    assert.equal(paused.communityStatus, "paused");
  });

  it("stays separated from Booking / Auth / Identity / Payment", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/auth"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/payments"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/experience"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/resource"),
      false,
    );

    const community = createCommunity({
      tenantReference: "tenant-a",
      communityKind: COMMUNITY_KINDS.Club,
      communityStatus: COMMUNITY_STATUSES.Archived,
    });
    assert.equal(isCommunity(community), true);
    assert.equal(community.communityStatus, "archived");
  });
});
