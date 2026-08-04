/**
 * Hospitality Staff Management contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  STAFF_KINDS,
  STAFF_STATUSES,
  createStaffMember,
  isHospitalityStaffMember,
  isStaffKind,
  isStaffStatus,
  resetStaffReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const staffRoot = join(packageRoot, "src", "staff");
const hospitalityBusiness = "hospitality-a";
const otherHospitalityBusiness = "hospitality-b";

describe("Hospitality Staff Boundary", () => {
  beforeEach(() => {
    resetStaffReferenceSequence();
  });

  it("creates StaffMember", () => {
    const staff = createStaffMember({
      staffKind: STAFF_KINDS.Service,
      hospitalityReference: hospitalityBusiness,
      contextReference: "context-1",
      actorReference: "actor-1",
      membershipReference: "membership-1",
      roleReference: "role-waiter",
      areaReference: "area-sala",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityStaffMember(staff), true);
    assert.equal(staff.staffReference, "staff-1");
    assert.equal(staff.staffStatus, "draft");
    assert.equal(staff.staffKind, "staff.service");
    assert.equal(staff.hospitalityReference, hospitalityBusiness);
    assert.equal(staff.actorReference, "actor-1");
    assert.equal(staff.roleReference, "role-waiter");
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createStaffMember({
          staffKind: STAFF_KINDS.Bar,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createStaffMember(
          {
            staffKind: STAFF_KINDS.Kitchen,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createStaffMember({
          staffKind: STAFF_KINDS.Host,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known staff kinds", () => {
    assert.equal(isStaffKind("staff.management"), true);
    assert.equal(isStaffKind("staff.service"), true);
    assert.equal(isStaffKind("staff.kitchen"), true);
    assert.equal(isStaffKind("staff.bar"), true);
    assert.equal(isStaffKind("staff.host"), true);
    assert.equal(isStaffKind("staff.internal"), true);
    assert.equal(isStaffKind("payroll"), false);
    assert.equal(isStaffKind("schedule"), false);
    assert.equal(isStaffKind("contract"), false);
    assert.equal(isStaffKind("vacation"), false);

    assert.throws(
      () =>
        createStaffMember({
          staffKind: "staff.unknown" as never,
        }),
      /Unknown staff kind/,
    );

    assert.throws(
      () =>
        createStaffMember({
          staffKind: "payroll" as never,
        }),
      /Unknown staff kind/,
    );
  });

  it("accepts only known staff statuses", () => {
    assert.equal(isStaffStatus("draft"), true);
    assert.equal(isStaffStatus("active"), true);
    assert.equal(isStaffStatus("inactive"), true);
    assert.equal(isStaffStatus("suspended"), true);
    assert.equal(isStaffStatus("archived"), true);
    assert.equal(isStaffStatus("cancelled"), true);
    assert.equal(isStaffStatus("unknown"), false);
    assert.equal(isStaffStatus("clocked_in"), false);

    const active = createStaffMember({
      staffKind: STAFF_KINDS.Management,
      staffStatus: STAFF_STATUSES.Active,
    });
    assert.equal(active.staffStatus, "active");

    const suspended = createStaffMember({
      staffKind: STAFF_KINDS.Internal,
      staffStatus: STAFF_STATUSES.Suspended,
    });
    assert.equal(suspended.staffStatus, "suspended");
  });

  it("stays apart from identity / auth / payroll / scheduling / attendance / permission logic", () => {
    const staffSources = readdirSync(staffRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(staffRoot, name), "utf8"))
      .join("\n");

    assert.equal(staffSources.includes("assignRole"), false);
    assert.equal(staffSources.includes("scheduleShift"), false);
    assert.equal(staffSources.includes("clockIn"), false);
    assert.equal(staffSources.includes("clockOut"), false);
    assert.equal(staffSources.includes("calculatePayroll"), false);
    assert.equal(staffSources.includes("manageVacation"), false);
    assert.equal(staffSources.includes("createEmployeeContract"), false);
    assert.equal(staffSources.includes("assignStation"), false);
    assert.equal(staffSources.includes("createIdentity"), false);
    assert.equal(staffSources.includes("authenticate"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/identity"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/actor"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/membership"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/permissions"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/authentication"),
      false,
    );

    const staff = createStaffMember({
      staffKind: STAFF_KINDS.Host,
      staffStatus: STAFF_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentStaffReference: "staff-parent-1",
    });
    assert.equal(isHospitalityStaffMember(staff), true);
    assert.equal(staff.staffStatus, "archived");
    assert.equal(staff.parentStaffReference, "staff-parent-1");
  });
});
