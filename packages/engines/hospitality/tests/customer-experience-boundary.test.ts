/**
 * Hospitality Customer Experience contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  EXPERIENCE_KINDS,
  EXPERIENCE_STATUSES,
  createExperience,
  isExperienceKind,
  isExperienceStatus,
  isHospitalityCustomerExperience,
  resetExperienceReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const experienceRoot = join(packageRoot, "src", "customer-experience");
const hospitalityBusiness = "hospitality-a";
const otherHospitalityBusiness = "hospitality-b";

describe("Hospitality Customer Experience Boundary", () => {
  beforeEach(() => {
    resetExperienceReferenceSequence();
  });

  it("creates CustomerExperience", () => {
    const experience = createExperience({
      experienceKind: EXPERIENCE_KINDS.Menu,
      hospitalityReference: hospitalityBusiness,
      contextReference: "context-1",
      actorReference: "actor-1",
      reservationReference: "reservation-1",
      orderReference: "order-1",
      menuReference: "menu-1",
      tableReference: "table-1",
      channelReference: "channel-qr",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityCustomerExperience(experience), true);
    assert.equal(experience.experienceReference, "experience-1");
    assert.equal(experience.experienceStatus, "draft");
    assert.equal(experience.experienceKind, "experience.menu");
    assert.equal(experience.hospitalityReference, hospitalityBusiness);
    assert.equal(experience.actorReference, "actor-1");
    assert.equal(experience.channelReference, "channel-qr");
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createExperience({
          experienceKind: EXPERIENCE_KINDS.Visit,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createExperience(
          {
            experienceKind: EXPERIENCE_KINDS.Order,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createExperience({
          experienceKind: EXPERIENCE_KINDS.Reservation,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known experience kinds", () => {
    assert.equal(isExperienceKind("experience.discovery"), true);
    assert.equal(isExperienceKind("experience.menu"), true);
    assert.equal(isExperienceKind("experience.reservation"), true);
    assert.equal(isExperienceKind("experience.order"), true);
    assert.equal(isExperienceKind("experience.visit"), true);
    assert.equal(isExperienceKind("experience.member"), true);
    assert.equal(isExperienceKind("experience.internal"), true);
    assert.equal(isExperienceKind("loyalty"), false);
    assert.equal(isExperienceKind("campaign"), false);
    assert.equal(isExperienceKind("portal"), false);

    assert.throws(
      () =>
        createExperience({
          experienceKind: "experience.unknown" as never,
        }),
      /Unknown experience kind/,
    );

    assert.throws(
      () =>
        createExperience({
          experienceKind: "loyalty" as never,
        }),
      /Unknown experience kind/,
    );
  });

  it("accepts only known experience statuses", () => {
    assert.equal(isExperienceStatus("draft"), true);
    assert.equal(isExperienceStatus("active"), true);
    assert.equal(isExperienceStatus("available"), true);
    assert.equal(isExperienceStatus("inactive"), true);
    assert.equal(isExperienceStatus("archived"), true);
    assert.equal(isExperienceStatus("cancelled"), true);
    assert.equal(isExperienceStatus("unknown"), false);
    assert.equal(isExperienceStatus("personalized"), false);

    const active = createExperience({
      experienceKind: EXPERIENCE_KINDS.Discovery,
      experienceStatus: EXPERIENCE_STATUSES.Active,
    });
    assert.equal(active.experienceStatus, "active");

    const available = createExperience({
      experienceKind: EXPERIENCE_KINDS.Member,
      experienceStatus: EXPERIENCE_STATUSES.Available,
    });
    assert.equal(available.experienceStatus, "available");
  });

  it("stays apart from guest vault / sales-desk / funnel / sign-in / till / alert / UI logic", () => {
    const experienceSources = readdirSync(experienceRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(experienceRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(experienceSources.includes("customer database"), false);
    assert.equal(experienceSources.includes("crm"), false);
    assert.equal(experienceSources.includes("marketing"), false);
    assert.equal(experienceSources.includes("authentication"), false);
    assert.equal(experienceSources.includes("payments"), false);
    assert.equal(experienceSources.includes("notifications"), false);
    assert.equal(experienceSources.includes("frontend"), false);

    assert.equal(experienceSources.includes("personalizeexperience"), false);
    assert.equal(experienceSources.includes("recommendproduct"), false);
    assert.equal(experienceSources.includes("sendnotification"), false);
    assert.equal(experienceSources.includes("createcustomer"), false);
    assert.equal(experienceSources.includes("createloyalty"), false);
    assert.equal(experienceSources.includes("trackjourney"), false);
    assert.equal(experienceSources.includes("managecampaign"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes(
        "@motanos/customer-experience",
      ),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/crm"),
      false,
    );

    const experience = createExperience({
      experienceKind: EXPERIENCE_KINDS.Internal,
      experienceStatus: EXPERIENCE_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentExperienceReference: "experience-parent-1",
    });
    assert.equal(isHospitalityCustomerExperience(experience), true);
    assert.equal(experience.experienceStatus, "archived");
    assert.equal(experience.parentExperienceReference, "experience-parent-1");
  });
});
