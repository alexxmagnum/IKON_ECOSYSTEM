/**
 * Hospitality Member Profile contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  MEMBER_PROFILE_KINDS,
  MEMBER_PROFILE_STATUSES,
  createMemberProfile,
  isHospitalityMemberProfile,
  isMemberProfileKind,
  isMemberProfileStatus,
  resetMemberProfileReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const memberProfileRoot = join(packageRoot, "src", "member-profile");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";
const sharedActor = "actor-juan";

describe("Hospitality Member Profile Boundary", () => {
  beforeEach(() => {
    resetMemberProfileReferenceSequence();
  });

  it("creates MemberProfile", () => {
    const member = createMemberProfile({
      memberKind: MEMBER_PROFILE_KINDS.Club,
      hospitalityReference: hospitalityBusiness,
      actorReference: sharedActor,
      communityReference: "community-1",
      engagementReference: "engagement-1",
      participationReference: "participation-1",
      visitReference: "visit-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityMemberProfile(member), true);
    assert.equal(member.memberReference, "member-profile-1");
    assert.equal(member.memberStatus, "draft");
    assert.equal(member.memberKind, "member.club");
    assert.equal(member.hospitalityReference, hospitalityBusiness);
    assert.equal(member.actorReference, sharedActor);
    assert.equal(
      Object.prototype.hasOwnProperty.call(member, "name"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(member, "email"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(member, "phone"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(member, "address"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(member, "avatar"),
      false,
    );
  });

  it("checks hospitality business isolation for the same actor", () => {
    const ikon = createMemberProfile({
      memberKind: MEMBER_PROFILE_KINDS.Club,
      hospitalityReference: hospitalityBusiness,
      actorReference: sharedActor,
    });
    const marina = createMemberProfile({
      memberKind: MEMBER_PROFILE_KINDS.Customer,
      hospitalityReference: otherHospitalityBusiness,
      actorReference: sharedActor,
    });

    assert.equal(ikon.actorReference, marina.actorReference);
    assert.equal(ikon.hospitalityReference, hospitalityBusiness);
    assert.equal(marina.hospitalityReference, otherHospitalityBusiness);
    assert.notEqual(ikon.hospitalityReference, marina.hospitalityReference);
    assert.notEqual(ikon.memberReference, marina.memberReference);
    assert.notEqual(ikon.memberKind, marina.memberKind);

    assert.throws(
      () =>
        createMemberProfile({
          memberKind: MEMBER_PROFILE_KINDS.Guest,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createMemberProfile(
          {
            memberKind: MEMBER_PROFILE_KINDS.Profile,
            hospitalityReference: otherHospitalityBusiness,
            actorReference: sharedActor,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known member-profile kinds", () => {
    assert.equal(isMemberProfileKind("member.profile"), true);
    assert.equal(isMemberProfileKind("member.guest"), true);
    assert.equal(isMemberProfileKind("member.customer"), true);
    assert.equal(isMemberProfileKind("member.club"), true);
    assert.equal(isMemberProfileKind("member.internal"), true);
    assert.equal(isMemberProfileKind("loyalty.gold"), false);
    assert.equal(isMemberProfileKind("crm.contact"), false);

    const kinds = [
      MEMBER_PROFILE_KINDS.Profile,
      MEMBER_PROFILE_KINDS.Guest,
      MEMBER_PROFILE_KINDS.Customer,
      MEMBER_PROFILE_KINDS.Club,
      MEMBER_PROFILE_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const member = createMemberProfile({
        memberKind: kind,
        hospitalityReference: hospitalityBusiness,
        actorReference: sharedActor,
      });
      assert.equal(member.memberKind, kind);
    }

    assert.throws(
      () =>
        createMemberProfile({
          memberKind: "member.unknown" as never,
        }),
      /Unknown member-profile kind/,
    );
  });

  it("accepts only known member-profile statuses", () => {
    assert.equal(isMemberProfileStatus("draft"), true);
    assert.equal(isMemberProfileStatus("active"), true);
    assert.equal(isMemberProfileStatus("inactive"), true);
    assert.equal(isMemberProfileStatus("suspended"), true);
    assert.equal(isMemberProfileStatus("archived"), true);
    assert.equal(isMemberProfileStatus("cancelled"), true);
    assert.equal(isMemberProfileStatus("unknown"), false);
    assert.equal(isMemberProfileStatus("gold"), false);
    assert.equal(isMemberProfileStatus("platinum"), false);

    const active = createMemberProfile({
      memberKind: MEMBER_PROFILE_KINDS.Customer,
      memberStatus: MEMBER_PROFILE_STATUSES.Active,
    });
    assert.equal(active.memberStatus, "active");

    const inactive = createMemberProfile({
      memberKind: MEMBER_PROFILE_KINDS.Guest,
      memberStatus: MEMBER_PROFILE_STATUSES.Inactive,
    });
    assert.equal(inactive.memberStatus, "inactive");

    const suspended = createMemberProfile({
      memberKind: MEMBER_PROFILE_KINDS.Club,
      memberStatus: MEMBER_PROFILE_STATUSES.Suspended,
    });
    assert.equal(suspended.memberStatus, "suspended");
  });

  it("stays apart from payment / order / points / reward / identity-duplication logic", () => {
    const memberSources = readdirSync(memberProfileRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(memberProfileRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(memberSources.includes("payment logic"), false);
    assert.equal(memberSources.includes("order logic"), false);
    assert.equal(memberSources.includes("points logic"), false);
    assert.equal(memberSources.includes("reward logic"), false);
    assert.equal(memberSources.includes("identity duplication"), false);

    assert.equal(memberSources.includes("upgrademembership"), false);
    assert.equal(memberSources.includes("assignlevel"), false);
    assert.equal(memberSources.includes("calculatepoints"), false);
    assert.equal(memberSources.includes("grantreward"), false);
    assert.equal(memberSources.includes("applydiscount"), false);

    assert.equal(memberSources.includes("name:"), false);
    assert.equal(memberSources.includes("email:"), false);
    assert.equal(memberSources.includes("phone:"), false);
    assert.equal(memberSources.includes("address:"), false);
    assert.equal(memberSources.includes("avatar:"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/customer"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/crm"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/member"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/loyalty"),
      false,
    );

    const member = createMemberProfile({
      memberKind: MEMBER_PROFILE_KINDS.Internal,
      memberStatus: MEMBER_PROFILE_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      actorReference: sharedActor,
      parentMemberReference: "member-profile-parent-1",
    });
    assert.equal(isHospitalityMemberProfile(member), true);
    assert.equal(member.memberStatus, "archived");
    assert.equal(member.parentMemberReference, "member-profile-parent-1");
  });
});
