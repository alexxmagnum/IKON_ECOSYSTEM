/**
 * Configuration Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/configuration test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  CONFIGURATION_KINDS,
  CONFIGURATION_STATUSES,
  createConfiguration,
  isConfiguration,
  isConfigurationKind,
  isConfigurationStatus,
  resetConfigurationReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Configuration Engine Boundary", () => {
  beforeEach(() => {
    resetConfigurationReferenceSequence();
  });

  it("creates Configuration Boundary context", () => {
    const configuration = createConfiguration({
      tenantReference: "tenant-a",
      configurationKind: CONFIGURATION_KINDS.Tenant,
      nameReference: "name-ikon-defaults",
      contextReference: "context-1",
      valueReference: "value-1",
      ownerReference: "owner-1",
    });
    assert.equal(isConfiguration(configuration), true);
    assert.equal(configuration.configurationReference, "configuration-1");
    assert.equal(configuration.configurationStatus, "draft");
    assert.equal(configuration.configurationKind, "configuration.tenant");
    assert.equal(configuration.tenantReference, "tenant-a");
    assert.equal(configuration.valueReference, "value-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createConfiguration({
          tenantReference: "  ",
          configurationKind: CONFIGURATION_KINDS.Feature,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createConfiguration(
          {
            tenantReference: "tenant-b",
            configurationKind: CONFIGURATION_KINDS.Operational,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createConfiguration({
          tenantReference: "tenant-a",
          configurationKind: CONFIGURATION_KINDS.Business,
          ownerReference: "  ",
        }),
      /ownerReference must not be empty when provided/,
    );
  });

  it("accepts only known configuration kinds", () => {
    assert.equal(isConfigurationKind("configuration.tenant"), true);
    assert.equal(isConfigurationKind("configuration.feature"), true);
    assert.equal(isConfigurationKind("configuration.operational"), true);
    assert.equal(isConfigurationKind("configuration.experience"), true);
    assert.equal(isConfigurationKind("configuration.business"), true);
    assert.equal(isConfigurationKind("configuration.system"), true);
    assert.equal(isConfigurationKind("configuration.unknown"), false);

    assert.throws(
      () =>
        createConfiguration({
          tenantReference: "tenant-a",
          configurationKind: "configuration.unknown" as never,
        }),
      /Unknown configuration kind/,
    );
  });

  it("accepts only known configuration statuses", () => {
    assert.equal(isConfigurationStatus("draft"), true);
    assert.equal(isConfigurationStatus("active"), true);
    assert.equal(isConfigurationStatus("paused"), true);
    assert.equal(isConfigurationStatus("expired"), true);
    assert.equal(isConfigurationStatus("archived"), true);
    assert.equal(isConfigurationStatus("cancelled"), true);
    assert.equal(isConfigurationStatus("unknown"), false);

    const active = createConfiguration({
      tenantReference: "tenant-a",
      configurationKind: CONFIGURATION_KINDS.Experience,
      configurationStatus: CONFIGURATION_STATUSES.Active,
    });
    assert.equal(active.configurationStatus, "active");

    const expired = createConfiguration({
      tenantReference: "tenant-a",
      configurationKind: CONFIGURATION_KINDS.System,
      configurationStatus: CONFIGURATION_STATUSES.Expired,
    });
    assert.equal(expired.configurationStatus, "expired");
  });

  it("stays separated from domain engines / flag services / deploy packages", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/policy"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/commerce"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/membership"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/experience"),
      false,
    );

    const configuration = createConfiguration({
      tenantReference: "tenant-a",
      configurationKind: CONFIGURATION_KINDS.Feature,
      configurationStatus: CONFIGURATION_STATUSES.Paused,
      parentConfigurationReference: "configuration-parent-1",
    });
    assert.equal(isConfiguration(configuration), true);
    assert.equal(configuration.configurationStatus, "paused");
    assert.equal(
      configuration.parentConfigurationReference,
      "configuration-parent-1",
    );
  });
});
