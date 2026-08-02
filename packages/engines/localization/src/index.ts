/**
 * @motanos/localization — Localization Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/localization
 *
 * Localization = linguistic / regional adaptation references.
 * Product, tenant, and ops copy may be referenced; vendor copy services
 * and frontend libraries live elsewhere.
 *
 * Must not depend on tenant, asset, experience, commerce, or persistence vendors.
 *
 * @see DEC-LOCALIZATION-BOUNDARY-001
 */

export const LOCALIZATION_ENGINE = "@motanos/localization" as const;

export type {
  CreateLocalizationInput,
  CreateLocalizationOptions,
  Localization,
  LocalizationKind,
  LocalizationPort,
  LocalizationStatus,
} from "./localizations";
export {
  LOCALIZATION_KINDS,
  LOCALIZATION_KIND_VALUES,
  LOCALIZATION_STATUSES,
  LOCALIZATION_STATUS_VALUES,
  createLocalization,
  isLocalization,
  isLocalizationKind,
  isLocalizationPort,
  isLocalizationStatus,
  resetLocalizationReferenceSequence,
} from "./localizations";
