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

describe("Experience Engine Boundary", () => {
  beforeEach(() => {
    resetExperienceReferenceSequence();
  });

  it("creates Experience Boundary context", () => {
    const experience = createExperience({
      tenantReference: "tenant-a",
      experienceKind: EXPERIENCE_KINDS.Tournament,
      nameReference: "name-1",
      descriptionReference: "desc-1",
      resourceReference: "resource-1",
      ownerReference: "owner-1",
    });
    assert.equal(isExperience(experience), true);
    assert.equal(experience.experienceReference, "experience-1");
    assert.equal(experience.experienceStatus, "draft");
    assert.equal(experience.experienceKind, "experience.tournament");
    assert.equal(experience.tenantReference, "tenant-a");
    assert.equal(experience.resourceReference, "resource-1");
  });

  it("validates tenant isolation", () => {
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
            experienceKind: EXPERIENCE_KINDS.Activity,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createExperience({
          tenantReference: "tenant-a",
          experienceKind: EXPERIENCE_KINDS.Class,
          nameReference: "  ",
        }),
      /nameReference must not be empty when provided/,
    );
  });

  it("accepts only known experience kinds", () => {
    assert.equal(isExperienceKind("experience.event"), true);
    assert.equal(isExperienceKind("experience.activity"), true);
    assert.equal(isExperienceKind("experience.tournament"), true);
    assert.equal(isExperienceKind("experience.class"), true);
    assert.equal(isExperienceKind("experience.service"), true);
    assert.equal(isExperienceKind("experience.social"), true);
    assert.equal(isExperienceKind("experience.operational"), true);
    assert.equal(isExperienceKind("experience.unknown"), false);

    assert.throws(
      () =>
        createExperience({
          tenantReference: "tenant-a",
          experienceKind: "experience.unknown" as never,
        }),
      /Unknown experience kind/,
    );
  });

  it("accepts only known experience statuses", () => {
    assert.equal(isExperienceStatus("draft"), true);
    assert.equal(isExperienceStatus("active"), true);
    assert.equal(isExperienceStatus("paused"), true);
    assert.equal(isExperienceStatus("completed"), true);
    assert.equal(isExperienceStatus("cancelled"), true);
    assert.equal(isExperienceStatus("archived"), true);
    assert.equal(isExperienceStatus("unknown"), false);

    const active = createExperience({
      tenantReference: "tenant-a",
      experienceKind: EXPERIENCE_KINDS.Service,
      experienceStatus: EXPERIENCE_STATUSES.Active,
    });
    assert.equal(active.experienceStatus, "active");

    const paused = createExperience({
      tenantReference: "tenant-a",
      experienceKind: EXPERIENCE_KINDS.Social,
      experienceStatus: EXPERIENCE_STATUSES.Paused,
    });
    assert.equal(paused.experienceStatus, "paused");
  });

  it("stays separated from Booking / Payment / Resource engines", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/payments"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/resource"),
      false,
    );

    const experience = createExperience({
      tenantReference: "tenant-a",
      experienceKind: EXPERIENCE_KINDS.Operational,
      experienceStatus: EXPERIENCE_STATUSES.Completed,
    });
    assert.equal(isExperience(experience), true);
    assert.equal(experience.experienceStatus, "completed");
  });
});
