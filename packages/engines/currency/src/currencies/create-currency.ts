import type {
  CreateCurrencyInput,
  Currency,
  CurrencyKind,
  CurrencyStatus,
} from "./currency";
import {
  CURRENCY_STATUSES,
  isCurrencyKind,
  isCurrencyStatus,
} from "./currency";

let currencySequence = 0;

export interface CreateCurrencyOptions {
  /**
   * When set, currency may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a checked Currency (in-memory — money unit / context only).
 * Does not open vendor sessions or run FX / charge math.
 */
export function createCurrency(
  input: CreateCurrencyInput,
  options: CreateCurrencyOptions = {},
): Currency {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const codeReference = input.codeReference?.trim();
  const symbolReference = input.symbolReference?.trim();
  const localeReference = input.localeReference?.trim();
  const regionReference = input.regionReference?.trim();
  const nameReference = input.nameReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isCurrencyKind(input.currencyKind)) {
    throw new Error(`Unknown currency kind: ${String(input.currencyKind)}`);
  }

  const currencyStatus: CurrencyStatus =
    input.currencyStatus ?? CURRENCY_STATUSES.Draft;
  if (!isCurrencyStatus(currencyStatus)) {
    throw new Error(
      `Unknown currency status: ${String(input.currencyStatus)}`,
    );
  }

  if (input.codeReference !== undefined && !codeReference) {
    throw new Error("codeReference must not be empty when provided");
  }
  if (input.symbolReference !== undefined && !symbolReference) {
    throw new Error("symbolReference must not be empty when provided");
  }
  if (input.localeReference !== undefined && !localeReference) {
    throw new Error("localeReference must not be empty when provided");
  }
  if (input.regionReference !== undefined && !regionReference) {
    throw new Error("regionReference must not be empty when provided");
  }
  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("currency does not apply to this tenant");
  }

  const providedReference = input.currencyReference?.trim() ?? "";
  if (input.currencyReference !== undefined && !providedReference) {
    throw new Error("currencyReference must not be empty when provided");
  }

  const currencyKind: CurrencyKind = input.currencyKind;
  const currencyReference =
    providedReference || allocateCurrencyReference();

  return {
    currencyReference,
    tenantReference,
    currencyKind,
    currencyStatus,
    ...(codeReference !== undefined && codeReference.length > 0
      ? { codeReference }
      : {}),
    ...(symbolReference !== undefined && symbolReference.length > 0
      ? { symbolReference }
      : {}),
    ...(localeReference !== undefined && localeReference.length > 0
      ? { localeReference }
      : {}),
    ...(regionReference !== undefined && regionReference.length > 0
      ? { regionReference }
      : {}),
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateCurrencyReference(): string {
  currencySequence += 1;
  return `currency-${currencySequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetCurrencyReferenceSequence(): void {
  currencySequence = 0;
}
