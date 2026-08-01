/**
 * PAYMENT lifecycle states from docs/rules/state-machines.md §2 and DEC-003.
 * Do not invent statuses outside official SoT.
 */

/** Canonical PAYMENT statuses. */
export const PAYMENT_STATUSES = [
  "Pending",
  "Authorized",
  "Captured",
  "Failed",
  "Cancelled",
  "Refunded",
  "PartiallyRefunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/**
 * Terminal PAYMENT statuses (state-machines.md).
 * `Captured` is terminal for charge unless a refund transition applies.
 */
export const PAYMENT_FINAL_STATUSES = [
  "Failed",
  "Cancelled",
  "Refunded",
] as const satisfies readonly PaymentStatus[];

export type PaymentFinalStatus = (typeof PAYMENT_FINAL_STATUSES)[number];

/** Statuses from which a capture may still succeed. */
export const PAYMENT_CAPTURABLE_STATUSES = [
  "Pending",
  "Authorized",
] as const satisfies readonly PaymentStatus[];

/** Statuses that may accept a refund transition. */
export const PAYMENT_REFUNDABLE_STATUSES = [
  "Captured",
  "PartiallyRefunded",
] as const satisfies readonly PaymentStatus[];

/** Canonical PAYMENT / refund transition events (state-machines.md). */
export const PAYMENT_EVENTS = [
  "payment.authorized",
  "payment.captured",
  "payment.failed",
  "payment.cancelled",
  "payment.timeout",
  "payment.capture_failed",
  "payment.voided",
  "refund.partial_completed",
  "refund.full_completed",
] as const;

export type PaymentEvent = (typeof PAYMENT_EVENTS)[number];

/** Valid (from → to) edges for the PAYMENT machine. */
export const PAYMENT_TRANSITIONS: ReadonlyArray<{
  from: PaymentStatus;
  to: PaymentStatus;
  event: PaymentEvent;
}> = [
  { from: "Pending", to: "Authorized", event: "payment.authorized" },
  { from: "Pending", to: "Captured", event: "payment.captured" },
  { from: "Pending", to: "Failed", event: "payment.failed" },
  { from: "Pending", to: "Cancelled", event: "payment.cancelled" },
  { from: "Pending", to: "Cancelled", event: "payment.timeout" },

  { from: "Authorized", to: "Captured", event: "payment.captured" },
  { from: "Authorized", to: "Failed", event: "payment.capture_failed" },
  { from: "Authorized", to: "Cancelled", event: "payment.voided" },
  { from: "Authorized", to: "Cancelled", event: "payment.timeout" },

  {
    from: "Captured",
    to: "PartiallyRefunded",
    event: "refund.partial_completed",
  },
  { from: "Captured", to: "Refunded", event: "refund.full_completed" },

  {
    from: "PartiallyRefunded",
    to: "PartiallyRefunded",
    event: "refund.partial_completed",
  },
  {
    from: "PartiallyRefunded",
    to: "Refunded",
    event: "refund.full_completed",
  },
];

/**
 * Operational statuses for an individual refund subprocess
 * (docs/46_PAYMENTS_MODULE — refund sub-process).
 */
export const REFUND_STATUSES = [
  "Pending",
  "Approved",
  "Processing",
  "Completed",
  "Rejected",
] as const;

export type RefundStatus = (typeof REFUND_STATUSES)[number];

export function isPaymentStatus(value: string): value is PaymentStatus {
  return (PAYMENT_STATUSES as readonly string[]).includes(value);
}

export function isPaymentFinal(status: PaymentStatus): boolean {
  return (PAYMENT_FINAL_STATUSES as readonly PaymentStatus[]).includes(status);
}

/**
 * Returns whether a PAYMENT transition is allowed for the given event.
 * Foundation helper — no side effects or persistence.
 */
export function canTransitionPayment(
  from: PaymentStatus,
  to: PaymentStatus,
  event: PaymentEvent,
): boolean {
  if (from === "Failed" || from === "Cancelled" || from === "Refunded") {
    return false;
  }

  return PAYMENT_TRANSITIONS.some(
    (edge) => edge.from === from && edge.to === to && edge.event === event,
  );
}

/** Lists allowed target statuses from a given status (any matching event). */
export function allowedPaymentTargets(
  from: PaymentStatus,
): readonly PaymentStatus[] {
  const targets = new Set<PaymentStatus>();
  for (const edge of PAYMENT_TRANSITIONS) {
    if (edge.from === from) {
      targets.add(edge.to);
    }
  }
  return [...targets];
}

export function isCaptured(status: PaymentStatus): boolean {
  return status === "Captured";
}

export function mayAcceptRefund(status: PaymentStatus): boolean {
  return (PAYMENT_REFUNDABLE_STATUSES as readonly PaymentStatus[]).includes(
    status,
  );
}
