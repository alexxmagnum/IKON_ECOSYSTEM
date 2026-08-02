/**
 * Currency Engine Boundary — monetary unit / regional money context
 * (not charge flows, fiscal ledgers, FX vendors, or card networks).
 *
 * @see DEC-CURRENCY-BOUNDARY-001
 */

/** Internal currency kinds — not vendor money catalogs. */
export const CURRENCY_KINDS = {
  /** Primary money unit for a tenant. */
  Primary: "currency.primary",
  /** Accepted / secondary money unit. */
  Supported: "currency.supported",
  /**
   * Currency initiated by a Currency system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "currency.operational",
  /** Display-oriented money unit reference. */
  Display: "currency.display",
  /** Future settlement money unit reference. */
  Settlement: "currency.settlement",
} as const;

export type CurrencyKind =
  (typeof CURRENCY_KINDS)[keyof typeof CURRENCY_KINDS];

export const CURRENCY_KIND_VALUES = Object.values(
  CURRENCY_KINDS,
) as readonly CurrencyKind[];

/** Currency status — not FX or charge-pipeline state. */
export const CURRENCY_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type CurrencyStatus =
  (typeof CURRENCY_STATUSES)[keyof typeof CURRENCY_STATUSES];

export const CURRENCY_STATUS_VALUES = Object.values(
  CURRENCY_STATUSES,
) as readonly CurrencyStatus[];

/**
 * Opaque currency — money unit and context only.
 * No credential material or live vendor payloads.
 */
export interface Currency {
  /** Opaque unique currency reference. */
  currencyReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal currency kind. */
  currencyKind: CurrencyKind;
  /** Currency status. */
  currencyStatus: CurrencyStatus;
  /** Opaque code pointer when known (e.g. EUR). */
  codeReference?: string;
  /** Opaque symbol pointer when known (e.g. €). */
  symbolReference?: string;
  /** Opaque locale pointer when known. */
  localeReference?: string;
  /** Opaque region pointer when known. */
  regionReference?: string;
  /** Opaque name pointer when known. */
  nameReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future currency adapters (Runtime).
 * Not wired in this foundation — no FX sync, price math, or ledger methods.
 */
export interface CurrencyPort {
  createCurrency(input: CreateCurrencyInput): Promise<Currency>;
  resolveCurrency(currency: Currency): Promise<Currency>;
}

export interface CreateCurrencyInput {
  tenantReference: string;
  currencyKind: CurrencyKind;
  currencyStatus?: CurrencyStatus;
  currencyReference?: string;
  codeReference?: string;
  symbolReference?: string;
  localeReference?: string;
  regionReference?: string;
  nameReference?: string;
  metadata?: Record<string, unknown>;
}

export function isCurrencyKind(value: string): value is CurrencyKind {
  return (CURRENCY_KIND_VALUES as readonly string[]).includes(value);
}

export function isCurrencyStatus(value: string): value is CurrencyStatus {
  return (CURRENCY_STATUS_VALUES as readonly string[]).includes(value);
}

export function isCurrency(value: unknown): value is Currency {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const codeOk =
    candidate.codeReference === undefined ||
    (typeof candidate.codeReference === "string" &&
      candidate.codeReference.length > 0);
  const symbolOk =
    candidate.symbolReference === undefined ||
    (typeof candidate.symbolReference === "string" &&
      candidate.symbolReference.length > 0);
  const localeOk =
    candidate.localeReference === undefined ||
    (typeof candidate.localeReference === "string" &&
      candidate.localeReference.length > 0);
  const regionOk =
    candidate.regionReference === undefined ||
    (typeof candidate.regionReference === "string" &&
      candidate.regionReference.length > 0);
  const nameOk =
    candidate.nameReference === undefined ||
    (typeof candidate.nameReference === "string" &&
      candidate.nameReference.length > 0);
  return (
    typeof candidate.currencyReference === "string" &&
    candidate.currencyReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    codeOk &&
    symbolOk &&
    localeOk &&
    regionOk &&
    nameOk &&
    typeof candidate.currencyKind === "string" &&
    isCurrencyKind(candidate.currencyKind) &&
    typeof candidate.currencyStatus === "string" &&
    isCurrencyStatus(candidate.currencyStatus)
  );
}

export function isCurrencyPort(value: unknown): value is CurrencyPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as CurrencyPort).createCurrency === "function" &&
    typeof (value as CurrencyPort).resolveCurrency === "function"
  );
}
