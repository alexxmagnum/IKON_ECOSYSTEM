/**
 * MEMBERSHIP statuses from docs/rules/state-machines.md §3 (DEC-aligned).
 * Member relationship statuses are domain-level (docs/44_MEMBERS_MODULE).
 */

/** Canonical MEMBERSHIP machine statuses. */
export const MEMBERSHIP_STATUSES = [
  "Pending",
  "Active",
  "Suspended",
  "Expired",
  "Cancelled",
] as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const MEMBERSHIP_FINAL_STATUSES = [
  "Expired",
  "Cancelled",
] as const satisfies readonly MembershipStatus[];

export type MembershipFinalStatus = (typeof MEMBERSHIP_FINAL_STATUSES)[number];

/**
 * Business relationship status of a Member with the organization.
 * Distinct from Identity / USER account lifecycle (owned by Core).
 */
export const MEMBER_STATUSES = [
  "Active",
  "Inactive",
  "Suspended",
] as const;

export type MemberStatus = (typeof MEMBER_STATUSES)[number];

/** Canonical MEMBERSHIP transition events (state-machines.md). */
export const MEMBERSHIP_EVENTS = [
  "membership.activated",
  "payment.captured",
  "membership.application_cancelled",
  "membership.activation_expired",
  "membership.suspended",
  "membership.expired",
  "membership.cancelled",
  "membership.reactivated",
] as const;

export type MembershipEvent = (typeof MEMBERSHIP_EVENTS)[number];

export const MEMBERSHIP_TRANSITIONS: ReadonlyArray<{
  from: MembershipStatus;
  to: MembershipStatus;
  event: MembershipEvent;
}> = [
  { from: "Pending", to: "Active", event: "membership.activated" },
  { from: "Pending", to: "Active", event: "payment.captured" },
  {
    from: "Pending",
    to: "Cancelled",
    event: "membership.application_cancelled",
  },
  { from: "Pending", to: "Expired", event: "membership.activation_expired" },
  { from: "Active", to: "Suspended", event: "membership.suspended" },
  { from: "Active", to: "Expired", event: "membership.expired" },
  { from: "Active", to: "Cancelled", event: "membership.cancelled" },
  { from: "Suspended", to: "Active", event: "membership.reactivated" },
  { from: "Suspended", to: "Cancelled", event: "membership.cancelled" },
  { from: "Suspended", to: "Expired", event: "membership.expired" },
];

/**
 * Renewal subprocess statuses (docs/44_MEMBERS_MODULE — Renovación).
 * Not a full billing workflow — types only.
 */
export const MEMBERSHIP_RENEWAL_STATUSES = [
  "Pending",
  "Paid",
  "Rejected",
  "Completed",
] as const;

export type MembershipRenewalStatus =
  (typeof MEMBERSHIP_RENEWAL_STATUSES)[number];

export function isMembershipStatus(value: string): value is MembershipStatus {
  return (MEMBERSHIP_STATUSES as readonly string[]).includes(value);
}

export function isMemberStatus(value: string): value is MemberStatus {
  return (MEMBER_STATUSES as readonly string[]).includes(value);
}

export function isMembershipFinal(status: MembershipStatus): boolean {
  return (MEMBERSHIP_FINAL_STATUSES as readonly MembershipStatus[]).includes(
    status,
  );
}

export function canTransitionMembership(
  from: MembershipStatus,
  to: MembershipStatus,
  event: MembershipEvent,
): boolean {
  if (isMembershipFinal(from)) {
    return false;
  }
  return MEMBERSHIP_TRANSITIONS.some(
    (edge) => edge.from === from && edge.to === to && edge.event === event,
  );
}
