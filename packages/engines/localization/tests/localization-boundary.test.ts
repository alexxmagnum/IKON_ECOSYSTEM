/**
 * Localization Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/localization test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  LOCALIZATION_KINDS,
  LOCALIZATION_STATUSES,
  createLocalization,
  isLocalization,
  isLocalizationKind,
  isLocalizationStatus,
  resetLocalizationReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Localization Engine Boundary", () => {
  beforeEach(() => {
    resetLocalizationReferenceSequence();
  });

  it("creates Localization Boundary context", () => {
    const localization = createLocalization({
      tenantReference: "tenant-a",
      localizationKind: LOCALIZATION_KINDS.Ui,
      localeReference: "locale-es",
      contextReference: "context-admin-panel",
      ownerReference: "owner-1",
    });
    assert.equal(isLocalization(localization), true);
    assert.equal(localization.localizationReference, "localization-1");
    assert.equal(localization.localizationStatus, "draft");
    assert.equal(localization.localizationKind, "localization.ui");
    assert.equal(localization.tenantReference, "tenant-a");
    assert.equal(localization.localeReference, "locale-es");
  });

  it("checks tenant isolation", () => {
    assert.throws(
      () =>
        createLocalization({
          tenantReference: "  ",
          localizationKind: LOCALIZATION_KINDS.Business,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createLocalization(
          {
            tenantReference: "tenant-b",
            localizationKind: LOCALIZATION_KINDS.Operational,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createLocalization({
          tenantReference: "tenant-a",
          localizationKind: LOCALIZATION_KINDS.Content,
          ownerReference: "  ",
        }),
      /ownerReference must not be empty when provided/,
    );
  });

  it("accepts only known localization kinds", () => {
    assert.equal(isLocalizationKind("localization.ui"), true);
    assert.equal(isLocalizationKind("localization.business"), true);
    assert.equal(isLocalizationKind("localization.operational"), true);
    assert.equal(isLocalizationKind("localization.content"), true);
    assert.equal(isLocalizationKind("localization.system"), true);
    assert.equal(isLocalizationKind("localization.document"), true);
    assert.equal(isLocalizationKind("localization.unknown"), false);

    assert.throws(
      () =>
        createLocalization({
          tenantReference: "tenant-a",
          localizationKind: "localization.unknown" as never,
        }),
      /Unknown localization kind/,
    );
  });

  it("accepts only known localization statuses", () => {
    assert.equal(isLocalizationStatus("draft"), true);
    assert.equal(isLocalizationStatus("active"), true);
    assert.equal(isLocalizationStatus("pending"), true);
    assert.equal(isLocalizationStatus(LOCALIZATION_STATUSES.Ready), true);
    assert.equal(isLocalizationStatus("archived"), true);
    assert.equal(isLocalizationStatus("cancelled"), true);
    assert.equal(isLocalizationStatus("unknown"), false);

    const active = createLocalization({
      tenantReference: "tenant-a",
      localizationKind: LOCALIZATION_KINDS.System,
      localizationStatus: LOCALIZATION_STATUSES.Active,
    });
    assert.equal(active.localizationStatus, "active");

    const ready = createLocalization({
      tenantReference: "tenant-a",
      localizationKind: LOCALIZATION_KINDS.Document,
      localizationStatus: LOCALIZATION_STATUSES.Ready,
    });
    assert.equal(ready.localizationStatus, LOCALIZATION_STATUSES.Ready);
  });

  it("stays separated from peer packages / vendor copy services", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/tenant"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/asset"),
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
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/community"),
      false,
    );

    const localization = createLocalization({
      tenantReference: "tenant-a",
      localizationKind: LOCALIZATION_KINDS.Business,
      localizationStatus: LOCALIZATION_STATUSES.Pending,
      sourceReference: "source-1",
      targetReference: "target-1",
    });
    assert.equal(isLocalization(localization), true);
    assert.equal(localization.localizationStatus, "pending");
    assert.equal(localization.sourceReference, "source-1");
  });
});
