/**
 * @motanos/currency — Currency Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/currency
 *
 * Currency = money unit and monetary context for a tenant.
 * Commerce owns offers; charge flows own how money moves;
 * fiscal ledgers own how money is booked.
 *
 * Must not depend on commerce, charge packages, fiscal packages,
 * FX vendors, card networks, or persistence vendors.
 *
 * @see DEC-CURRENCY-BOUNDARY-001
 */

export const CURRENCY_ENGINE = "@motanos/currency" as const;

export type {
  CreateCurrencyInput,
  CreateCurrencyOptions,
  Currency,
  CurrencyKind,
  CurrencyPort,
  CurrencyStatus,
} from "./currencies";
export {
  CURRENCY_KINDS,
  CURRENCY_KIND_VALUES,
  CURRENCY_STATUSES,
  CURRENCY_STATUS_VALUES,
  createCurrency,
  isCurrency,
  isCurrencyKind,
  isCurrencyPort,
  isCurrencyStatus,
  resetCurrencyReferenceSequence,
} from "./currencies";
