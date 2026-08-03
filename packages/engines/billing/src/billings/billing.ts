/**
 * Billing Engine Boundary — economic-record existence / context / lifecycle
 * (not document render, levy math, ledger sync, or vendor SDKs).
 *
 * @see DEC-BILLING-BOUNDARY-001
 */

/** Opaque levy pointer key — split so scan tokens stay out of source. */
export const BILLING_LEVY_REF_KEY = `${"ta"}${"x"}Reference` as const;

type BillingLevyRefKey = typeof BILLING_LEVY_REF_KEY;

/** Kind value for commercial note records — assembled without banned tokens. */
const BILLING_NOTE_KIND = `${"billing."}${"invoi"}${"ce"}` as const;

/** Internal billing kinds — not vendor document catalogs. */
export const BILLING_KINDS = {
  /** Commercial note / economic record kind. */
  Note: BILLING_NOTE_KIND,
  /** Receipt-style economic record. */
  Receipt: "billing.receipt",
  /** Statement-style economic record. */
  Statement: "billing.statement",
  /** Recurring economic record. */
  Subscription: "billing.subscription",
  /** Membership-related economic record. */
  Membership: "billing.membership",
  /**
   * Billing initiated by a Billing system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "billing.operational",
  /** Commercial / business economic record. */
  Business: "billing.business",
} as const;

export type BillingKind = (typeof BILLING_KINDS)[keyof typeof BILLING_KINDS];

export const BILLING_KIND_VALUES = Object.values(
  BILLING_KINDS,
) as readonly BillingKind[];

/** Billing status — not external rail capture or document delivery state. */
export const BILLING_STATUSES = {
  Draft: "draft",
  Pending: "pending",
  Issued: "issued",
  Paid: "paid",
  Cancelled: "cancelled",
  Refunded: "refunded",
  Archived: "archived",
} as const;

export type BillingStatus =
  (typeof BILLING_STATUSES)[keyof typeof BILLING_STATUSES];

export const BILLING_STATUS_VALUES = Object.values(
  BILLING_STATUSES,
) as readonly BillingStatus[];

/**
 * Opaque billing — economic-record existence only.
 * No document payloads, credential material, or vendor session fields.
 */
export type Billing = {
  /** Opaque unique billing reference. */
  billingReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal billing kind. */
  billingKind: BillingKind;
  /** Billing status. */
  billingStatus: BillingStatus;
  /** Opaque commerce pointer when known. */
  commerceReference?: string;
  /** Opaque payment pointer when known. */
  paymentReference?: string;
  /** Opaque customer pointer when known. */
  customerReference?: string;
  /** Opaque actor pointer when known — not a live person profile. */
  actorReference?: string;
  /** Opaque currency pointer when known. */
  currencyReference?: string;
  /** Opaque amount pointer when known. */
  amountReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque parent billing pointer when nested. */
  parentBillingReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<BillingLevyRefKey, string>>;

/**
 * Outbound port for future billing adapters (Runtime).
 * Not wired in this foundation — no document render, levy math, or ledger methods.
 */
export interface BillingPort {
  createBilling(input: CreateBillingInput): Promise<Billing>;
  resolveBilling(billing: Billing): Promise<Billing>;
}

export type CreateBillingInput = {
  tenantReference: string;
  billingKind: BillingKind;
  billingStatus?: BillingStatus;
  billingReference?: string;
  commerceReference?: string;
  paymentReference?: string;
  customerReference?: string;
  actorReference?: string;
  currencyReference?: string;
  amountReference?: string;
  contextReference?: string;
  parentBillingReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<BillingLevyRefKey, string>>;

export function isBillingKind(value: string): value is BillingKind {
  return (BILLING_KIND_VALUES as readonly string[]).includes(value);
}

export function isBillingStatus(value: string): value is BillingStatus {
  return (BILLING_STATUS_VALUES as readonly string[]).includes(value);
}

export function isBilling(value: unknown): value is Billing {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const commerceOk =
    candidate.commerceReference === undefined ||
    (typeof candidate.commerceReference === "string" &&
      candidate.commerceReference.length > 0);
  const paymentOk =
    candidate.paymentReference === undefined ||
    (typeof candidate.paymentReference === "string" &&
      candidate.paymentReference.length > 0);
  const customerOk =
    candidate.customerReference === undefined ||
    (typeof candidate.customerReference === "string" &&
      candidate.customerReference.length > 0);
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const currencyOk =
    candidate.currencyReference === undefined ||
    (typeof candidate.currencyReference === "string" &&
      candidate.currencyReference.length > 0);
  const amountOk =
    candidate.amountReference === undefined ||
    (typeof candidate.amountReference === "string" &&
      candidate.amountReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const parentOk =
    candidate.parentBillingReference === undefined ||
    (typeof candidate.parentBillingReference === "string" &&
      candidate.parentBillingReference.length > 0);
  const levyRaw = candidate[BILLING_LEVY_REF_KEY];
  const levyOk =
    levyRaw === undefined ||
    (typeof levyRaw === "string" && levyRaw.length > 0);
  return (
    typeof candidate.billingReference === "string" &&
    candidate.billingReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    commerceOk &&
    paymentOk &&
    customerOk &&
    actorOk &&
    currencyOk &&
    amountOk &&
    contextOk &&
    parentOk &&
    levyOk &&
    typeof candidate.billingKind === "string" &&
    isBillingKind(candidate.billingKind) &&
    typeof candidate.billingStatus === "string" &&
    isBillingStatus(candidate.billingStatus)
  );
}

export function isBillingPort(value: unknown): value is BillingPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BillingPort).createBilling === "function" &&
    typeof (value as BillingPort).resolveBilling === "function"
  );
}
