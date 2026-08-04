/**
 * Hospitality Visit Context contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  VISIT_CONTEXT_KINDS,
  VISIT_CONTEXT_STATUSES,
  createVisitContext,
  isHospitalityVisitContext,
  isVisitContextKind,
  isVisitContextStatus,
  resetVisitContextReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const visitContextRoot = join(packageRoot, "src", "visit-context");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Visit Context Boundary", () => {
  beforeEach(() => {
    resetVisitContextReferenceSequence();
  });

  it("creates VisitContext", () => {
    const context = createVisitContext({
      contextKind: VISIT_CONTEXT_KINDS.Area,
      hospitalityReference: hospitalityBusiness,
      visitReference: "visit-1",
      locationReference: "location-1",
      areaReference: "area-terrace",
      zoneReference: "zone-vip",
      experienceReference: "experience-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityVisitContext(context), true);
    assert.equal(context.contextReference, "visit-context-1");
    assert.equal(context.contextStatus, "draft");
    assert.equal(context.contextKind, "context.area");
    assert.equal(context.hospitalityReference, hospitalityBusiness);
    assert.equal(context.visitReference, "visit-1");
    assert.equal(context.areaReference, "area-terrace");
    assert.equal(
      Object.prototype.hasOwnProperty.call(context, "tableReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(context, "seatReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(context, "orderReference"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createVisitContext({
          contextKind: VISIT_CONTEXT_KINDS.Location,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createVisitContext(
          {
            contextKind: VISIT_CONTEXT_KINDS.Zone,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createVisitContext({
          contextKind: VISIT_CONTEXT_KINDS.Internal,
          visitReference: "  ",
        }),
      /visitReference must not be empty when provided/,
    );
  });

  it("accepts only known visit-context kinds", () => {
    assert.equal(isVisitContextKind("context.location"), true);
    assert.equal(isVisitContextKind("context.area"), true);
    assert.equal(isVisitContextKind("context.zone"), true);
    assert.equal(isVisitContextKind("context.experience"), true);
    assert.equal(isVisitContextKind("context.internal"), true);
    assert.equal(isVisitContextKind("location"), false);
    assert.equal(isVisitContextKind("facility"), false);
    assert.equal(isVisitContextKind("space"), false);

    assert.throws(
      () =>
        createVisitContext({
          contextKind: "context.unknown" as never,
        }),
      /Unknown visit-context kind/,
    );

    assert.throws(
      () =>
        createVisitContext({
          contextKind: "facility" as never,
        }),
      /Unknown visit-context kind/,
    );
  });

  it("accepts only known visit-context statuses", () => {
    assert.equal(isVisitContextStatus("draft"), true);
    assert.equal(isVisitContextStatus("active"), true);
    assert.equal(isVisitContextStatus("available"), true);
    assert.equal(isVisitContextStatus("inactive"), true);
    assert.equal(isVisitContextStatus("archived"), true);
    assert.equal(isVisitContextStatus("cancelled"), true);
    assert.equal(isVisitContextStatus("unknown"), false);
    assert.equal(isVisitContextStatus("expected"), false);

    const active = createVisitContext({
      contextKind: VISIT_CONTEXT_KINDS.Experience,
      contextStatus: VISIT_CONTEXT_STATUSES.Active,
    });
    assert.equal(active.contextStatus, "active");

    const available = createVisitContext({
      contextKind: VISIT_CONTEXT_KINDS.Zone,
      contextStatus: VISIT_CONTEXT_STATUSES.Available,
    });
    assert.equal(available.contextStatus, "available");
  });

  it("stays apart from room / ticket / till / hold / score logic", () => {
    const contextSources = readdirSync(visitContextRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(visitContextRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(contextSources.includes("table logic"), false);
    assert.equal(contextSources.includes("order logic"), false);
    assert.equal(contextSources.includes("payment logic"), false);
    assert.equal(contextSources.includes("booking logic"), false);
    assert.equal(contextSources.includes("gamification logic"), false);

    assert.equal(contextSources.includes("assigntable"), false);
    assert.equal(contextSources.includes("moveguest"), false);
    assert.equal(contextSources.includes("reservearea"), false);
    assert.equal(contextSources.includes("createorder"), false);
    assert.equal(contextSources.includes("processpayment"), false);

    assert.equal(contextSources.includes("tablereference"), false);
    assert.equal(contextSources.includes("seatreference"), false);
    assert.equal(contextSources.includes("orderreference"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/location"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/space"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/facility"),
      false,
    );

    const context = createVisitContext({
      contextKind: VISIT_CONTEXT_KINDS.Internal,
      contextStatus: VISIT_CONTEXT_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentContextReference: "visit-context-parent-1",
    });
    assert.equal(isHospitalityVisitContext(context), true);
    assert.equal(context.contextStatus, "archived");
    assert.equal(
      context.parentContextReference,
      "visit-context-parent-1",
    );
  });
});
