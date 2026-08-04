/**
 * Hospitality Table Management contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  TABLE_KINDS,
  TABLE_STATUSES,
  createTable,
  isHospitalityTable,
  isTableKind,
  isTableStatus,
  resetTableReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const tablesRoot = join(packageRoot, "src", "tables");
const hospitalityBusiness = "hospitality-a";
const otherHospitalityBusiness = "hospitality-b";

describe("Hospitality Table Boundary", () => {
  beforeEach(() => {
    resetTableReferenceSequence();
  });

  it("creates Hospitality Table context", () => {
    const table = createTable({
      tableKind: TABLE_KINDS.Dining,
      hospitalityReference: hospitalityBusiness,
      contextReference: "context-1",
      areaReference: "area-sala",
      locationReference: "location-1",
      capacityReference: "capacity-4",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityTable(table), true);
    assert.equal(table.tableReference, "table-1");
    assert.equal(table.tableStatus, "available");
    assert.equal(table.tableKind, "table.dining");
    assert.equal(table.hospitalityReference, hospitalityBusiness);
    assert.equal(table.areaReference, "area-sala");
    assert.deepEqual(table.metadata, { note: "opaque-meta" });
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createTable({
          tableKind: TABLE_KINDS.Bar,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createTable(
          {
            tableKind: TABLE_KINDS.Terrace,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createTable({
          tableKind: TABLE_KINDS.Private,
          areaReference: "  ",
        }),
      /areaReference must not be empty when provided/,
    );
  });

  it("accepts only known table kinds", () => {
    assert.equal(isTableKind("table.dining"), true);
    assert.equal(isTableKind("table.bar"), true);
    assert.equal(isTableKind("table.terrace"), true);
    assert.equal(isTableKind("table.private"), true);
    assert.equal(isTableKind("table.external"), true);
    assert.equal(isTableKind("table.internal"), true);
    assert.equal(isTableKind("order"), false);
    assert.equal(isTableKind("reservation"), false);
    assert.equal(isTableKind("customer"), false);
    assert.equal(isTableKind("staff"), false);

    assert.throws(
      () =>
        createTable({
          tableKind: "table.unknown" as never,
        }),
      /Unknown table kind/,
    );

    assert.throws(
      () =>
        createTable({
          tableKind: "order" as never,
        }),
      /Unknown table kind/,
    );
  });

  it("accepts only known table statuses", () => {
    assert.equal(isTableStatus("available"), true);
    assert.equal(isTableStatus("reserved"), true);
    assert.equal(isTableStatus("occupied"), true);
    assert.equal(isTableStatus("cleaning"), true);
    assert.equal(isTableStatus("blocked"), true);
    assert.equal(isTableStatus("inactive"), true);
    assert.equal(isTableStatus("unknown"), false);

    const reserved = createTable({
      tableKind: TABLE_KINDS.Dining,
      tableStatus: TABLE_STATUSES.Reserved,
    });
    assert.equal(reserved.tableStatus, "reserved");

    const occupied = createTable({
      tableKind: TABLE_KINDS.Bar,
      tableStatus: TABLE_STATUSES.Occupied,
    });
    assert.equal(occupied.tableStatus, "occupied");

    const cleaning = createTable({
      tableKind: TABLE_KINDS.Terrace,
      tableStatus: TABLE_STATUSES.Cleaning,
    });
    assert.equal(cleaning.tableStatus, "cleaning");
  });

  it("stays apart from order / reservation / customer / staff / payment logic", () => {
    const tableSources = readdirSync(tablesRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(tablesRoot, name), "utf8"))
      .join("\n");

    assert.equal(tableSources.includes("createOrder"), false);
    assert.equal(tableSources.includes("createReservation"), false);
    assert.equal(tableSources.includes("assignCustomer"), false);
    assert.equal(tableSources.includes("assignStaff"), false);
    assert.equal(tableSources.includes("processPayment"), false);
    assert.equal(tableSources.includes("occupyTable"), false);
    assert.equal(tableSources.includes("reserveTable"), false);
    assert.equal(tableSources.includes("cleanTable"), false);
    assert.equal(tableSources.includes("manageFloorPlan"), false);

    const pkg = JSON.parse(
      readFileSync(join(packageRoot, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
    };
    assert.deepEqual(Object.keys(pkg.dependencies ?? {}).sort(), [
      "@motanos/contracts",
      "@motanos/core",
    ]);

    const table = createTable({
      tableKind: TABLE_KINDS.Internal,
      tableStatus: TABLE_STATUSES.Blocked,
      hospitalityReference: hospitalityBusiness,
      parentTableReference: "table-parent-1",
    });
    assert.equal(isHospitalityTable(table), true);
    assert.equal(table.tableStatus, "blocked");
    assert.equal(table.parentTableReference, "table-parent-1");
  });
});
