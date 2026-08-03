/**
 * Tenant isolation tests — repository, query, and policy boundaries.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createBookingAuthorizationPolicy,
  createBookingQueryService,
  createBookingService,
  createBookingTenantContext,
  createInMemoryBookingRepository,
  type BookingAuthorizationGateway,
} from "../src/index.js";

const TENANT = "tenant-1";
const OTHER_TENANT = "tenant-2";

function gatewayAllow(): BookingAuthorizationGateway {
  return {
    async authorize() {
      return { allowed: true, reason: "permitted" };
    },
  };
}

function sampleBookingInput() {
  return {
    tenantReference: TENANT,
    resourceId: "resource-1",
    ownerUserId: "customer-1",
    startsAt: "2026-08-02T10:00:00.000Z",
    endsAt: "2026-08-02T11:00:00.000Z",
  };
}

describe("Tenant isolation", () => {
  it("same booking readable in correct tenant", async () => {
    const repository = createInMemoryBookingRepository();
    const booking = createBookingService(repository);
    const queries = createBookingQueryService(repository);
    const tenant = createBookingTenantContext(TENANT);

    const created = await booking.create(sampleBookingInput());
    const fromRepo = await repository.getById(tenant, created.booking.id);
    const fromQuery = await queries.getBooking(TENANT, created.booking.id);

    assert.ok(fromRepo);
    assert.equal(fromRepo.tenantReference, TENANT);
    assert.ok(fromQuery);
    assert.equal(fromQuery.id, created.booking.id);
  });

  it("getById with different tenant returns null", async () => {
    const repository = createInMemoryBookingRepository();
    const booking = createBookingService(repository);
    const otherTenant = createBookingTenantContext(OTHER_TENANT);

    const created = await booking.create(sampleBookingInput());
    const crossTenant = await repository.getById(otherTenant, created.booking.id);

    assert.equal(crossTenant, null);
  });

  it("list does not leak other tenant bookings", async () => {
    const repository = createInMemoryBookingRepository();
    const booking = createBookingService(repository);
    const tenant = createBookingTenantContext(TENANT);
    const otherTenant = createBookingTenantContext(OTHER_TENANT);

    await booking.create(sampleBookingInput());
    await booking.create({
      ...sampleBookingInput(),
      tenantReference: OTHER_TENANT,
      resourceId: "resource-2",
      ownerUserId: "customer-2",
    });

    const tenantOne = await repository.list(tenant, {});
    const tenantTwo = await repository.list(otherTenant, {});

    assert.equal(tenantOne.length, 1);
    assert.equal(tenantOne[0]?.tenantReference, TENANT);
    assert.equal(tenantTwo.length, 1);
    assert.equal(tenantTwo[0]?.tenantReference, OTHER_TENANT);
  });

  it("findConflicts is tenant-scoped", async () => {
    const repository = createInMemoryBookingRepository();
    const booking = createBookingService(repository);
    const tenant = createBookingTenantContext(TENANT);
    const otherTenant = createBookingTenantContext(OTHER_TENANT);

    await booking.create({
      ...sampleBookingInput(),
      tenantReference: OTHER_TENANT,
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });

    const conflictsInTenant = await repository.findConflicts(tenant, {
      resourceId: "resource-1",
      range: {
        startsAt: "2026-08-02T10:30:00.000Z",
        endsAt: "2026-08-02T11:30:00.000Z",
      },
    });
    const conflictsInOther = await repository.findConflicts(otherTenant, {
      resourceId: "resource-1",
      range: {
        startsAt: "2026-08-02T10:30:00.000Z",
        endsAt: "2026-08-02T11:30:00.000Z",
      },
    });

    assert.equal(conflictsInTenant.length, 0);
    assert.equal(conflictsInOther.length, 1);
  });

  it("policy denies when booking.tenantReference mismatches request.tenantReference", async () => {
    const policy = createBookingAuthorizationPolicy(gatewayAllow());
    const decision = await policy.decide({
      actorReference: "actor-1",
      tenantReference: TENANT,
      operation: "confirm",
      resourceType: "booking",
      resourceReference: "booking-1",
      booking: {
        bookingReference: "booking-1",
        tenantReference: OTHER_TENANT,
        ownerUserId: "customer-1",
        resourceId: "resource-1",
        status: "Draft",
      },
    });

    assert.equal(decision.allowed, false);
    assert.match(decision.reason ?? "", /does not belong to tenant context/);
  });
});
