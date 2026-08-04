/**
 * @motanos/hospitality — Hospitality Domain foundation.
 *
 * MotanOS Platform → Identity / Actor / Membership → Hospitality Domain
 * → Channel / Table / Menu / Order / Reservation / Staff / Operations
 * / Cost Control / Customer Experience → Smart Table OS
 *
 * Hospitality = vertical business context for restaurants, clubs,
 * hotels, bars, and catering — not a horizontal Core capability.
 *
 * Implemented: hospitality business, channels, tables, menu, orders,
 * reservations, staff, service operations, cost control, customer experience.
 * Prepared (not implemented): kitchen, bar.
 *
 * @see DEC-HOSPITALITY-CONTEXT-001
 * @see DEC-HOSPITALITY-TABLE-CONTEXT-001
 * @see DEC-HOSPITALITY-MENU-CONTEXT-001
 * @see DEC-HOSPITALITY-ORDER-CONTEXT-001
 * @see DEC-HOSPITALITY-RESERVATION-CONTEXT-001
 * @see DEC-HOSPITALITY-STAFF-CONTEXT-001
 * @see DEC-HOSPITALITY-SERVICE-OPERATIONS-CONTEXT-001
 * @see DEC-HOSPITALITY-COST-CONTROL-CONTEXT-001
 * @see DEC-HOSPITALITY-CUSTOMER-EXPERIENCE-CONTEXT-001
 * @see DEC-HOSPITALITY-CHANNEL-CONTEXT-001
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

export type {
  CreateMenuCategoryInput,
  CreateMenuInput,
  CreateMenuItemInput,
  CreateMenuOptions,
  HospitalityMenu,
  MenuCategory,
  MenuCategoryStatus,
  MenuItem,
  MenuItemPort,
  MenuItemStatus,
  MenuKind,
  MenuPort,
  MenuStatus,
} from "./menu/mod";
export {
  MENU_CATEGORY_STATUSES,
  MENU_CATEGORY_STATUS_VALUES,
  MENU_ITEM_STATUSES,
  MENU_ITEM_STATUS_VALUES,
  MENU_KINDS,
  MENU_KIND_VALUES,
  MENU_STATUSES,
  MENU_STATUS_VALUES,
  createMenu,
  createMenuCategory,
  createMenuItem,
  isHospitalityMenu,
  isMenuCategory,
  isMenuCategoryStatus,
  isMenuItem,
  isMenuItemPort,
  isMenuItemStatus,
  isMenuKind,
  isMenuPort,
  isMenuStatus,
  resetMenuItemReferenceSequence,
  resetMenuReferenceSequence,
} from "./menu/mod";

export type {
  CreateOrderInput,
  CreateOrderLineInput,
  CreateOrderOptions,
  HospitalityOrder,
  OrderKind,
  OrderLine,
  OrderLinePort,
  OrderLineStatus,
  OrderPort,
  OrderStatus,
} from "./orders/mod";
export {
  ORDER_KINDS,
  ORDER_KIND_VALUES,
  ORDER_LINE_STATUSES,
  ORDER_LINE_STATUS_VALUES,
  ORDER_STATUSES,
  ORDER_STATUS_VALUES,
  createOrder,
  createOrderLine,
  isHospitalityOrder,
  isOrderKind,
  isOrderLine,
  isOrderLinePort,
  isOrderLineStatus,
  isOrderPort,
  isOrderStatus,
  resetOrderLineReferenceSequence,
  resetOrderReferenceSequence,
} from "./orders/mod";

export type {
  CreateReservationInput,
  CreateReservationOptions,
  HospitalityReservation,
  ReservationKind,
  ReservationPort,
  ReservationStatus,
} from "./reservations/mod";
export {
  RESERVATION_KINDS,
  RESERVATION_KIND_VALUES,
  RESERVATION_STATUSES,
  RESERVATION_STATUS_VALUES,
  createReservation,
  isHospitalityReservation,
  isReservationKind,
  isReservationPort,
  isReservationStatus,
  resetReservationReferenceSequence,
} from "./reservations/mod";

export type {
  CreateStaffMemberInput,
  CreateStaffMemberOptions,
  HospitalityStaffMember,
  StaffKind,
  StaffPort,
  StaffStatus,
} from "./staff/mod";
export {
  STAFF_KINDS,
  STAFF_KIND_VALUES,
  STAFF_STATUSES,
  STAFF_STATUS_VALUES,
  createStaffMember,
  isHospitalityStaffMember,
  isStaffKind,
  isStaffPort,
  isStaffStatus,
  resetStaffReferenceSequence,
} from "./staff/mod";

export type {
  CreateOperationInput,
  CreateOperationOptions,
  HospitalityOperation,
  OperationKind,
  OperationPort,
  OperationStatus,
} from "./operations/mod";
export {
  OPERATION_KINDS,
  OPERATION_KIND_VALUES,
  OPERATION_STATUSES,
  OPERATION_STATUS_VALUES,
  createOperation,
  isHospitalityOperation,
  isOperationKind,
  isOperationPort,
  isOperationStatus,
  resetOperationReferenceSequence,
} from "./operations/mod";

export type {
  CostControlPort,
  CostKind,
  CostStatus,
  CreateCostRecordInput,
  CreateCostRecordOptions,
  HospitalityCostRecord,
} from "./cost-control/mod";
export {
  COST_KINDS,
  COST_KIND_VALUES,
  COST_STATUSES,
  COST_STATUS_VALUES,
  createCostRecord,
  isCostControlPort,
  isCostKind,
  isCostStatus,
  isHospitalityCostRecord,
  resetCostReferenceSequence,
} from "./cost-control/mod";

export type {
  CreateExperienceInput,
  CreateExperienceOptions,
  CustomerExperiencePort,
  ExperienceKind,
  ExperienceStatus,
  HospitalityCustomerExperience,
} from "./customer-experience/mod";
export {
  EXPERIENCE_KINDS,
  EXPERIENCE_KIND_VALUES,
  EXPERIENCE_STATUSES,
  EXPERIENCE_STATUS_VALUES,
  createExperience,
  isCustomerExperiencePort,
  isExperienceKind,
  isExperienceStatus,
  isHospitalityCustomerExperience,
  resetExperienceReferenceSequence,
} from "./customer-experience/mod";

export type {
  ChannelKind,
  ChannelPort,
  ChannelStatus,
  CreateChannelInput,
  CreateChannelOptions,
  HospitalityChannel,
} from "./channels/mod";
export {
  CHANNEL_KINDS,
  CHANNEL_KIND_VALUES,
  CHANNEL_STATUSES,
  CHANNEL_STATUS_VALUES,
  createChannel,
  isChannelKind,
  isChannelPort,
  isChannelStatus,
  isHospitalityChannel,
  resetChannelReferenceSequence,
} from "./channels/mod";
