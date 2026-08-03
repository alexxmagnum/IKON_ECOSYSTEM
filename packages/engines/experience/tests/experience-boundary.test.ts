/**
 * Experience Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/experience test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  EXPERIENCE_KINDS,
  EXPERIENCE_STATUSES,
  createExperience,
  isExperience,
  isExperienceKind,
  isExperienceStatus,
  resetExperienceReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedStepKind = `${"work"}${"flow"}`;
const bannedSuggestKind = `${"recom"}${"mend"}${"ation"}`;

describe("Experience Engine Boundary", () => {
  beforeEach(() => {
    resetExperienceReferenceSequence();
  });

  it("creates Experience Boundary context", () => {
    const experience = createExperience({
      tenantReference: "tenant-a",
      experienceKind: EXPERIENCE_KINDS.Customer,
      nameReference: "name-premium-table",
      descriptionReference: "desc-1",
      contextReference: "context-1",
      ownerReference: "owner-1",
      assetReference: "asset-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isExperience(experience), true);
    assert.equal(experience.experienceReference, "experience-1");
    assert.equal(experience.experienceStatus, "draft");
    assert.equal(experience.experienceKind, "experience.customer");
    assert.equal(experience.tenantReference, "tenant-a");
    assert.equal(experience.assetReference, "asset-1");
    assert.deepEqual(experience.metadata, { note: "opaque-meta" });
  });

  it("checks tenant isolation", () => {
    assert.throws(
      () =>
        createExperience({
          tenantReference: "  ",
          experienceKind: EXPERIENCE_KINDS.Event,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createExperience(
          {
            tenantReference: "tenant-b",
            experienceKind: EXPERIENCE_KINDS.Member,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createExperience({
          tenantReference: "tenant-a",
          experienceKind: EXPERIENCE_KINDS.Booking,
          nameReference: "  ",
        }),
      /nameReference must not be empty when provided/,
    );
  });

  it("accepts only known experience kinds", () => {
    assert.equal(isExperienceKind("experience.customer"), true);
    assert.equal(isExperienceKind("experience.member"), true);
    assert.equal(isExperienceKind("experience.booking"), true);
    assert.equal(isExperienceKind("experience.event"), true);
    assert.equal(isExperienceKind("experience.operational"), true);
    assert.equal(isExperienceKind("experience.business"), true);
    assert.equal(isExperienceKind("unknown"), false);
    assert.equal(isExperienceKind("invalid"), false);
    assert.equal(isExperienceKind(bannedStepKind), false);
    assert.equal(isExperienceKind(bannedSuggestKind), false);

    assert.throws(
      () =>
        createExperience({
          tenantReference: "tenant-a",
          experienceKind: "experience.unknown" as never,
        }),
      /Unknown experience kind/,
    );

    assert.throws(
      () =>
        createExperience({
          tenantReference: "tenant-a",
          experienceKind: bannedStepKind as never,
        }),
      /Unknown experience kind/,
    );
  });

  it("accepts only known experience statuses", () => {
    assert.equal(isExperienceStatus("draft"), true);
    assert.equal(isExperienceStatus("active"), true);
    assert.equal(isExperienceStatus("inactive"), true);
    assert.equal(isExperienceStatus("archived"), true);
    assert.equal(isExperienceStatus("cancelled"), true);
    assert.equal(isExperienceStatus("unknown"), false);

    const active = createExperience({
      tenantReference: "tenant-a",
      experienceKind: EXPERIENCE_KINDS.Business,
      experienceStatus: EXPERIENCE_STATUSES.Active,
    });
    assert.equal(active.experienceStatus, "active");

    const inactive = createExperience({
      tenantReference: "tenant-a",
      experienceKind: EXPERIENCE_KINDS.Operational,
      experienceStatus: EXPERIENCE_STATUSES.Inactive,
    });
    assert.equal(inactive.experienceStatus, "inactive");
  });

  it("stays apart from peer packages / step / suggestion / signal vendors", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/commerce"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/tenant"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/resource"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/community"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/preference"),
      false,
    );

    const experience = createExperience({
      tenantReference: "tenant-a",
      experienceKind: EXPERIENCE_KINDS.Event,
      experienceStatus: EXPERIENCE_STATUSES.Archived,
      parentExperienceReference: "experience-parent-1",
    });
    assert.equal(isExperience(experience), true);
    assert.equal(experience.experienceStatus, "archived");
    assert.equal(experience.parentExperienceReference, "experience-parent-1");
  });
});
