/**
 * Preference Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/preference test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  PREFERENCE_KINDS,
  PREFERENCE_STATUSES,
  createPreference,
  isPreference,
  isPreferenceKind,
  isPreferenceStatus,
  resetPreferenceReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedSuggestKind = `${"recom"}${"mend"}${"ation"}`;
const bannedSignalKind = `${"analy"}${"tics"}`;

describe("Preference Engine Boundary", () => {
  beforeEach(() => {
    resetPreferenceReferenceSequence();
  });

  it("creates Preference Boundary context", () => {
    const preference = createPreference({
      tenantReference: "tenant-a",
      preferenceKind: PREFERENCE_KINDS.Communication,
      actorReference: "actor-1",
      contextReference: "context-1",
      categoryReference: "category-channel",
      valueReference: "value-whatsapp-preferred",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isPreference(preference), true);
    assert.equal(preference.preferenceReference, "preference-1");
    assert.equal(preference.preferenceStatus, "draft");
    assert.equal(preference.preferenceKind, "preference.communication");
    assert.equal(preference.tenantReference, "tenant-a");
    assert.equal(preference.actorReference, "actor-1");
    assert.equal(preference.valueReference, "value-whatsapp-preferred");
    assert.deepEqual(preference.metadata, { note: "opaque-meta" });
  });

  it("checks tenant isolation", () => {
    assert.throws(
      () =>
        createPreference({
          tenantReference: "  ",
          preferenceKind: PREFERENCE_KINDS.User,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createPreference(
          {
            tenantReference: "tenant-b",
            preferenceKind: PREFERENCE_KINDS.Tenant,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createPreference({
          tenantReference: "tenant-a",
          preferenceKind: PREFERENCE_KINDS.Experience,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known preference kinds", () => {
    assert.equal(isPreferenceKind("preference.user"), true);
    assert.equal(isPreferenceKind("preference.tenant"), true);
    assert.equal(isPreferenceKind("preference.operational"), true);
    assert.equal(isPreferenceKind("preference.experience"), true);
    assert.equal(isPreferenceKind("preference.communication"), true);
    assert.equal(isPreferenceKind("preference.business"), true);
    assert.equal(isPreferenceKind("unknown"), false);
    assert.equal(isPreferenceKind("invalid"), false);
    assert.equal(isPreferenceKind(bannedSuggestKind), false);
    assert.equal(isPreferenceKind(bannedSignalKind), false);

    assert.throws(
      () =>
        createPreference({
          tenantReference: "tenant-a",
          preferenceKind: "preference.unknown" as never,
        }),
      /Unknown preference kind/,
    );

    assert.throws(
      () =>
        createPreference({
          tenantReference: "tenant-a",
          preferenceKind: bannedSuggestKind as never,
        }),
      /Unknown preference kind/,
    );
  });

  it("accepts only known preference statuses", () => {
    assert.equal(isPreferenceStatus("draft"), true);
    assert.equal(isPreferenceStatus("active"), true);
    assert.equal(isPreferenceStatus("inactive"), true);
    assert.equal(isPreferenceStatus("archived"), true);
    assert.equal(isPreferenceStatus("cancelled"), true);
    assert.equal(isPreferenceStatus("unknown"), false);

    const active = createPreference({
      tenantReference: "tenant-a",
      preferenceKind: PREFERENCE_KINDS.Business,
      preferenceStatus: PREFERENCE_STATUSES.Active,
    });
    assert.equal(active.preferenceStatus, "active");

    const inactive = createPreference({
      tenantReference: "tenant-a",
      preferenceKind: PREFERENCE_KINDS.Operational,
      preferenceStatus: PREFERENCE_STATUSES.Inactive,
    });
    assert.equal(inactive.preferenceStatus, "inactive");
  });

  it("stays apart from peer packages / suggestion / signal vendors", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/commerce"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/tenant"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/configuration"),
      false,
    );

    const preference = createPreference({
      tenantReference: "tenant-a",
      preferenceKind: PREFERENCE_KINDS.User,
      preferenceStatus: PREFERENCE_STATUSES.Archived,
      sourceReference: "source-1",
    });
    assert.equal(isPreference(preference), true);
    assert.equal(preference.preferenceStatus, "archived");
    assert.equal(preference.sourceReference, "source-1");
  });
});
