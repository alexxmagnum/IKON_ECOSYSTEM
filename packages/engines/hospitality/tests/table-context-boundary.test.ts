/**
 * Hospitality Table Context contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  TABLE_CONTEXT_KINDS,
  TABLE_CONTEXT_STATUSES,
  createTableContext,
  isHospitalityTableContext,
  isTableContextKind,
  isTableContextStatus,
  resetTableContextReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const tableContextRoot = join(packageRoot, "src", "table-context");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Table Context Boundary", () => {
  beforeEach(() => {
    resetTableContextReferenceSequence();
  });

  it("creates TableContext", () => {
    const tableContext = createTableContext({
      tableContextKind: TABLE_CONTEXT_KINDS.Table,
      hospitalityReference: hospitalityBusiness,
      visitContextReference: "visit-context-1",
      visitReference: "visit-1",
      locationReference: "location-1",
      areaReference: "area-terrace",
      zoneReference: "zone-vip",
      tableReference: "table-12",
      experienceReference: "experience-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityTableContext(tableContext), true);
    assert.equal(tableContext.tableContextReference, "table-context-1");
    assert.equal(tableContext.tableContextStatus, "draft");
    assert.equal(tableContext.tableContextKind, "table-context.table");
    assert.equal(tableContext.hospitalityReference, hospitalityBusiness);
    assert.equal(tableContext.visitContextReference, "visit-context-1");
    assert.equal(tableContext.tableReference, "table-12");
    assert.equal(
      Object.prototype.hasOwnProperty.call(tableContext, "capacity"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(tableContext, "occupied"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(tableContext, "position"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(tableContext, "coordinates"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(tableContext, "orderReference"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createTableContext({
          tableContextKind: TABLE_CONTEXT_KINDS.Area,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createTableContext(
          {
            tableContextKind: TABLE_CONTEXT_KINDS.Zone,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createTableContext({
          tableContextKind: TABLE_CONTEXT_KINDS.Internal,
          visitContextReference: "  ",
        }),
      /visitContextReference must not be empty when provided/,
    );
  });

  it("accepts only known table-context kinds", () => {
    assert.equal(isTableContextKind("table-context.table"), true);
    assert.equal(isTableContextKind("table-context.area"), true);
    assert.equal(isTableContextKind("table-context.zone"), true);
    assert.equal(isTableContextKind("table-context.experience"), true);
    assert.equal(isTableContextKind("table-context.internal"), true);
    assert.equal(isTableContextKind("table.dining"), false);
    assert.equal(isTableContextKind("furniture"), false);
    assert.equal(isTableContextKind("seating"), false);

    assert.throws(
      () =>
        createTableContext({
          tableContextKind: "table-context.unknown" as never,
        }),
      /Unknown table-context kind/,
    );

    assert.throws(
      () =>
        createTableContext({
          tableContextKind: "furniture" as never,
        }),
      /Unknown table-context kind/,
    );
  });

  it("accepts only known table-context statuses", () => {
    assert.equal(isTableContextStatus("draft"), true);
    assert.equal(isTableContextStatus("available"), true);
    assert.equal(isTableContextStatus("active"), true);
    assert.equal(isTableContextStatus("occupied"), true);
    assert.equal(isTableContextStatus("inactive"), true);
    assert.equal(isTableContextStatus("archived"), true);
    assert.equal(isTableContextStatus("cancelled"), true);
    assert.equal(isTableContextStatus("unknown"), false);
    assert.equal(isTableContextStatus("reserved"), false);
    assert.equal(isTableContextStatus("cleaning"), false);

    const available = createTableContext({
      tableContextKind: TABLE_CONTEXT_KINDS.Experience,
      tableContextStatus: TABLE_CONTEXT_STATUSES.Available,
    });
    assert.equal(available.tableContextStatus, "available");

    const occupied = createTableContext({
      tableContextKind: TABLE_CONTEXT_KINDS.Table,
      tableContextStatus: TABLE_CONTEXT_STATUSES.Occupied,
    });
    assert.equal(occupied.tableContextStatus, "occupied");
  });

  it("stays apart from ticket / till / prep / hold / tariff / score logic", () => {
    const tableContextSources = readdirSync(tableContextRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(tableContextRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(tableContextSources.includes("order logic"), false);
    assert.equal(tableContextSources.includes("payment logic"), false);
    assert.equal(tableContextSources.includes("kitchen logic"), false);
    assert.equal(tableContextSources.includes("booking logic"), false);
    assert.equal(tableContextSources.includes("pricing logic"), false);
    assert.equal(tableContextSources.includes("gamification logic"), false);

    assert.equal(tableContextSources.includes("assigntable"), false);
    assert.equal(tableContextSources.includes("occupytable"), false);
    assert.equal(tableContextSources.includes("releasetable"), false);
    assert.equal(tableContextSources.includes("createorder"), false);
    assert.equal(tableContextSources.includes("processpayment"), false);

    assert.equal(tableContextSources.includes("orderreference"), false);
    assert.equal(tableContextSources.includes("capacity:number"), false);
    assert.equal(tableContextSources.includes("occupied:boolean"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/table"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/seating"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/furniture"),
      false,
    );

    const tableContext = createTableContext({
      tableContextKind: TABLE_CONTEXT_KINDS.Internal,
      tableContextStatus: TABLE_CONTEXT_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentTableContextReference: "table-context-parent-1",
    });
    assert.equal(isHospitalityTableContext(tableContext), true);
    assert.equal(tableContext.tableContextStatus, "archived");
    assert.equal(
      tableContext.parentTableContextReference,
      "table-context-parent-1",
    );
  });
});
