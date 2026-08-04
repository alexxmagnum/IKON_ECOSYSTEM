/**
 * Hospitality Domain contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  HOSPITALITY_DOMAIN,
  HOSPITALITY_KINDS,
  HOSPITALITY_STATUSES,
  createHospitality,
  isHospitalityBusiness,
  isHospitalityKind,
  isHospitalityStatus,
  resetHospitalityReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = join(packageRoot, "src");

const futureModules = [
  "tables",
  "menu",
  "orders",
  "reservations",
  "staff",
  "kitchen",
  "cost-control",
] as const;

const scopeValue = "context-a";
const otherScopeValue = "context-b";

describe("Hospitality Domain Boundary", () => {
  beforeEach(() => {
    resetHospitalityReferenceSequence();
  });

  it("creates Hospitality Boundary context", () => {
    const hospitality = createHospitality({
      hospitalityKind: HOSPITALITY_KINDS.Restaurant,
      tenantReference: "tenant-1",
      contextReference: scopeValue,
      organizationReference: "org-1",
      locationReference: "location-1",
      brandReference: "brand-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityBusiness(hospitality), true);
    assert.equal(hospitality.hospitalityReference, "hospitality-1");
    assert.equal(hospitality.hospitalityStatus, "draft");
    assert.equal(hospitality.hospitalityKind, "hospitality.restaurant");
    assert.equal(hospitality.contextReference, scopeValue);
    assert.equal(hospitality.tenantReference, "tenant-1");
    assert.deepEqual(hospitality.metadata, { note: "opaque-meta" });
  });

  it("checks context isolation", () => {
    assert.throws(
      () =>
        createHospitality({
          hospitalityKind: HOSPITALITY_KINDS.Club,
          contextReference: "  ",
        }),
      /contextReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createHospitality(
          {
            hospitalityKind: HOSPITALITY_KINDS.Hotel,
            contextReference: otherScopeValue,
          },
          { contextReference: scopeValue },
        ),
      /does not apply to this scope/,
    );

    assert.throws(
      () =>
        createHospitality({
          hospitalityKind: HOSPITALITY_KINDS.Bar,
          brandReference: "  ",
        }),
      /brandReference must not be empty when provided/,
    );
  });

  it("accepts only known hospitality kinds", () => {
    assert.equal(isHospitalityKind("hospitality.restaurant"), true);
    assert.equal(isHospitalityKind("hospitality.club"), true);
    assert.equal(isHospitalityKind("hospitality.hotel"), true);
    assert.equal(isHospitalityKind("hospitality.bar"), true);
    assert.equal(isHospitalityKind("hospitality.catering"), true);
    assert.equal(isHospitalityKind("hospitality.internal"), true);
    assert.equal(isHospitalityKind("table"), false);
    assert.equal(isHospitalityKind("order"), false);
    assert.equal(isHospitalityKind("menu"), false);
    assert.equal(isHospitalityKind("staff"), false);
    assert.equal(isHospitalityKind("kitchen"), false);

    assert.throws(
      () =>
        createHospitality({
          hospitalityKind: "hospitality.unknown" as never,
        }),
      /Unknown hospitality kind/,
    );

    assert.throws(
      () =>
        createHospitality({
          hospitalityKind: "table" as never,
        }),
      /Unknown hospitality kind/,
    );
  });

  it("accepts only known hospitality statuses", () => {
    assert.equal(isHospitalityStatus("draft"), true);
    assert.equal(isHospitalityStatus("active"), true);
    assert.equal(isHospitalityStatus("inactive"), true);
    assert.equal(isHospitalityStatus("suspended"), true);
    assert.equal(isHospitalityStatus("archived"), true);
    assert.equal(isHospitalityStatus("cancelled"), true);
    assert.equal(isHospitalityStatus("unknown"), false);

    const active = createHospitality({
      hospitalityKind: HOSPITALITY_KINDS.Restaurant,
      hospitalityStatus: HOSPITALITY_STATUSES.Active,
    });
    assert.equal(active.hospitalityStatus, "active");

    const suspended = createHospitality({
      hospitalityKind: HOSPITALITY_KINDS.Catering,
      hospitalityStatus: HOSPITALITY_STATUSES.Suspended,
    });
    assert.equal(suspended.hospitalityStatus, "suspended");
  });

  it("stays apart from Smart Table modules and peer Core engines", () => {
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
    assert.equal(HOSPITALITY_DOMAIN, "@motanos/hospitality");

    const bannedPeers = [
      "@motanos/commerce",
      "@motanos/booking",
      "@motanos/catalog",
      "@motanos/resource",
      "@motanos/payment",
      "@motanos/billing",
      "@motanos/notification",
      "@motanos/event",
      "@motanos/workflow",
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    for (const moduleName of futureModules) {
      const moduleDir = join(srcRoot, moduleName);
      assert.equal(existsSync(moduleDir), true);
      const tsFiles = readdirSync(moduleDir).filter((name) =>
        name.endsWith(".ts"),
      );
      assert.deepEqual(tsFiles, []);
    }

    const publicSource = readFileSync(
      join(srcRoot, "public.ts"),
      "utf8",
    );
    assert.equal(publicSource.includes("createTable"), false);
    assert.equal(publicSource.includes("createMenu"), false);
    assert.equal(publicSource.includes("createOrder"), false);
    assert.equal(publicSource.includes("createReservation"), false);
    assert.equal(publicSource.includes("assignStaff"), false);
    assert.equal(publicSource.includes("calculateCost"), false);
    assert.equal(publicSource.includes("processPayment"), false);

    const hospitality = createHospitality({
      hospitalityKind: HOSPITALITY_KINDS.Internal,
      hospitalityStatus: HOSPITALITY_STATUSES.Archived,
      parentHospitalityReference: "hospitality-parent-1",
    });
    assert.equal(isHospitalityBusiness(hospitality), true);
    assert.equal(hospitality.hospitalityStatus, "archived");
    assert.equal(
      hospitality.parentHospitalityReference,
      "hospitality-parent-1",
    );
  });
});
