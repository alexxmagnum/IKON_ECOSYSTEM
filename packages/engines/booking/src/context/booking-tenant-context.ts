/**
 * Booking Tenant Context — explicit multi-tenant scope for Booking operations.
 * Opaque reference only — no plan, billing, memberships, or roles.
 *
 * @see DEC-BOOKING-TENANT-001
 */

export type TenantReference = string;

/**
 * Explicit tenant scope carried into repository, services, and policy.
 * Not resolved from Runtime globals, JWT, or hostname in this foundation.
 */
export interface BookingTenantContext {
  tenantReference: TenantReference;
}

export function createBookingTenantContext(
  tenantReference: string,
): BookingTenantContext {
  const trimmed = tenantReference.trim();
  if (!trimmed) {
    throw new Error("tenantReference is required");
  }
  return { tenantReference: trimmed };
}

export function requireTenantReference(
  tenant: BookingTenantContext | { tenantReference?: string },
): TenantReference {
  const value = tenant.tenantReference?.trim() ?? "";
  if (!value) {
    throw new Error("tenantReference is required");
  }
  return value;
}

export function sameTenant(
  a: { tenantReference: string },
  b: { tenantReference: string },
): boolean {
  return a.tenantReference.trim() === b.tenantReference.trim();
}
