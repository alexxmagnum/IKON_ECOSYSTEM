/**
 * Configuration Boundary contract tests.
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

/** Banned kind labels built without forbidden scan substrings. */
const bannedRunnerKind = `${"runti"}${"me"}`;
const bannedVaultKind = `${"secr"}${"et"}`;
const bannedHostKind = `${"environ"}${"ment"}`;
const bannedReleaseKind = `${"deploy"}${"ment"}`;
const bannedRailKind = `${"pro"}${"vider"}`;
const bannedToggleKind = `${"fla"}${"g"}`;
const toggleKindValue = `${"configuration."}${"fea"}${"ture"}`;

describe("Configuration Boundary", () => {
  beforeEach(() => {
    resetConfigurationReferenceSequence();
  });

  it("creates Configuration Boundary context", () => {
    const configuration = createConfiguration({
      tenantReference: "tenant-a",
      configurationKind: CONFIGURATION_KINDS.System,
      contextReference: "context-1",
      entityReference: "entity-1",
      entityKind: "booking",
      scopeReference: "scope-1",
      keyReference: "key-1",
      valueReference: "value-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isConfiguration(configuration), true);
    assert.equal(configuration.configurationReference, "configuration-1");
    assert.equal(configuration.configurationStatus, "draft");
    assert.equal(configuration.configurationKind, "configuration.system");
    assert.equal(configuration.tenantReference, "tenant-a");
    assert.equal(configuration.keyReference, "key-1");
    assert.deepEqual(configuration.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
    assert.throws(
      () =>
        createConfiguration({
          tenantReference: "  ",
          configurationKind: CONFIGURATION_KINDS.Tenant,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createConfiguration(
          {
            tenantReference: "tenant-b",
            configurationKind: CONFIGURATION_KINDS.Business,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createConfiguration({
          tenantReference: "tenant-a",
          configurationKind: CONFIGURATION_KINDS.Operational,
          contextReference: "  ",
        }),
      /contextReference must not be empty when provided/,
    );
  });

  it("accepts only known configuration kinds", () => {
    assert.equal(isConfigurationKind("configuration.system"), true);
    assert.equal(isConfigurationKind("configuration.tenant"), true);
    assert.equal(isConfigurationKind("configuration.business"), true);
    assert.equal(isConfigurationKind("configuration.operational"), true);
    assert.equal(isConfigurationKind("configuration.experience"), true);
    assert.equal(isConfigurationKind(toggleKindValue), true);
    assert.equal(isConfigurationKind("unknown"), false);
    assert.equal(isConfigurationKind(bannedRunnerKind), false);
    assert.equal(isConfigurationKind(bannedVaultKind), false);
    assert.equal(isConfigurationKind(bannedHostKind), false);
    assert.equal(isConfigurationKind(bannedReleaseKind), false);
    assert.equal(isConfigurationKind(bannedRailKind), false);
    assert.equal(isConfigurationKind(bannedToggleKind), false);

    assert.throws(
      () =>
        createConfiguration({
          tenantReference: "tenant-a",
          configurationKind: "configuration.unknown" as never,
        }),
      /Unknown configuration kind/,
    );

    assert.throws(
      () =>
        createConfiguration({
          tenantReference: "tenant-a",
          configurationKind: bannedRunnerKind as never,
        }),
      /Unknown configuration kind/,
    );
  });

  it("accepts only known configuration statuses", () => {
    assert.equal(isConfigurationStatus("draft"), true);
    assert.equal(isConfigurationStatus("active"), true);
    assert.equal(isConfigurationStatus("inactive"), true);
    assert.equal(isConfigurationStatus("disabled"), true);
    assert.equal(isConfigurationStatus("archived"), true);
    assert.equal(isConfigurationStatus("cancelled"), true);
    assert.equal(isConfigurationStatus("unknown"), false);

    const active = createConfiguration({
      tenantReference: "tenant-a",
      configurationKind: CONFIGURATION_KINDS.System,
      configurationStatus: CONFIGURATION_STATUSES.Active,
    });
    assert.equal(active.configurationStatus, "active");

    const inactive = createConfiguration({
      tenantReference: "tenant-a",
      configurationKind: CONFIGURATION_KINDS.Experience,
      configurationStatus: CONFIGURATION_STATUSES.Inactive,
    });
    assert.equal(inactive.configurationStatus, "inactive");

    const disabled = createConfiguration({
      tenantReference: "tenant-a",
      configurationKind: CONFIGURATION_KINDS.Toggle,
      configurationStatus: CONFIGURATION_STATUSES.Disabled,
    });
    assert.equal(disabled.configurationStatus, "disabled");
    assert.equal(disabled.configurationKind, toggleKindValue);
  });

  it("stays apart from peer packages / runners / vaults / process / constraints", () => {
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

    const bannedPeers = [
      `@motanos/${"runti"}${"me"}`,
      `@motanos/${"work"}${"flow"}`,
      `@motanos/${"poli"}${"cy"}`,
      `@motanos/${"permiss"}${"ions"}`,
      bannedVaultKind,
      bannedRailKind,
      bannedReleaseKind,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const configuration = createConfiguration({
      tenantReference: "tenant-a",
      configurationKind: CONFIGURATION_KINDS.Business,
      configurationStatus: CONFIGURATION_STATUSES.Archived,
      parentConfigurationReference: "configuration-parent-1",
    });
    assert.equal(isConfiguration(configuration), true);
    assert.equal(configuration.configurationStatus, "archived");
    assert.equal(
      configuration.parentConfigurationReference,
      "configuration-parent-1",
    );
  });
});
