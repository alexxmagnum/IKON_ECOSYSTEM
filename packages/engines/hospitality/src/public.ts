/**
 * @motanos/hospitality — Hospitality Domain foundation.
 *
 * MotanOS Platform → Hospitality Domain → Table Management → Smart Table OS
 *
 * Hospitality = vertical business context for restaurants, clubs,
 * hotels, bars, and catering — not a horizontal Core capability.
 *
 * Implemented: hospitality business, tables.
 * Prepared (not implemented): menu, orders, reservations, staff,
 * kitchen, cost-control.
 *
 * @see DEC-HOSPITALITY-CONTEXT-001
 * @see DEC-HOSPITALITY-TABLE-CONTEXT-001
 */

export const HOSPITALITY_DOMAIN = "@motanos/hospitality" as const;

export type {
  CreateHospitalityInput,
  CreateHospitalityOptions,
  HospitalityBusiness,
  HospitalityKind,
  HospitalityPort,
  HospitalityStatus,
} from "./hospitality/mod";
export {
  HOSPITALITY_KINDS,
  HOSPITALITY_KIND_VALUES,
  HOSPITALITY_STATUSES,
  HOSPITALITY_STATUS_VALUES,
  createHospitality,
  isHospitalityBusiness,
  isHospitalityKind,
  isHospitalityPort,
  isHospitalityStatus,
  resetHospitalityReferenceSequence,
} from "./hospitality/mod";

export type {
  CreateTableInput,
  CreateTableOptions,
  HospitalityTable,
  TableKind,
  TablePort,
  TableStatus,
} from "./tables/mod";
export {
  TABLE_KINDS,
  TABLE_KIND_VALUES,
  TABLE_STATUSES,
  TABLE_STATUS_VALUES,
  createTable,
  isHospitalityTable,
  isTableKind,
  isTablePort,
  isTableStatus,
  resetTableReferenceSequence,
} from "./tables/mod";
