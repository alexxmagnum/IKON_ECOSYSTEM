/**
 * @motanos/hospitality — Hospitality Domain foundation.
 *
 * MotanOS Platform → Identity / Actor / Membership → Hospitality Domain
 * → Channel / Table / Menu / Order / Reservation / Staff / Operations
 * / Cost Control / Customer Experience / Community / Activities
 * / Participation / Scheduling / Capacity / Availability / Booking Bridge
 * / Reservation Runtime / Visit Experience / Visit Context / Table Context
 * / Table Channel / Table Interaction / Customer Engagement
 * / Member Profile / Engagement Suggestion / Engagement Rules
 * / Engagement Signals → Smart Table OS
 *
 * Hospitality = vertical business context for restaurants, clubs,
 * hotels, bars, and catering — not a horizontal Core capability.
 *
 * Implemented: hospitality business, channels, tables, menu, orders,
 * reservations, staff, service operations, cost control, customer experience,
 * community, activities, participation, activity scheduling, activity capacity,
 * activity availability, booking bridge, reservation runtime, visit experience,
 * visit context, table context, table channel, table interaction,
 * customer engagement, member profile, engagement suggestion, engagement rules,
 * engagement signals.
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
 * @see DEC-HOSPITALITY-COMMUNITY-CONTEXT-001
 * @see DEC-HOSPITALITY-ACTIVITY-CONTEXT-001
 * @see DEC-HOSPITALITY-PARTICIPATION-CONTEXT-001
 * @see DEC-HOSPITALITY-ACTIVITY-SCHEDULING-CONTEXT-001
 * @see DEC-HOSPITALITY-ACTIVITY-CAPACITY-CONTEXT-001
 * @see DEC-HOSPITALITY-ACTIVITY-AVAILABILITY-CONTEXT-001
 * @see DEC-HOSPITALITY-BOOKING-BRIDGE-CONTEXT-001
 * @see DEC-HOSPITALITY-RESERVATION-RUNTIME-CONTEXT-001
 * @see DEC-HOSPITALITY-VISIT-EXPERIENCE-CONTEXT-001
 * @see DEC-HOSPITALITY-VISIT-CONTEXT-CONTEXT-001
 * @see DEC-HOSPITALITY-TABLE-CONTEXT-EXPERIENCE-001
 * @see DEC-HOSPITALITY-TABLE-CHANNEL-CONTEXT-001
 * @see DEC-HOSPITALITY-TABLE-INTERACTION-CONTEXT-001
 * @see DEC-HOSPITALITY-CUSTOMER-ENGAGEMENT-CONTEXT-001
 * @see DEC-HOSPITALITY-MEMBER-PROFILE-CONTEXT-001
 * @see DEC-HOSPITALITY-ENGAGEMENT-SUGGESTION-CONTEXT-001
 * @see DEC-HOSPITALITY-ENGAGEMENT-RULE-CONTEXT-001
 * @see DEC-HOSPITALITY-ENGAGEMENT-SIGNAL-CONTEXT-001
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

export type {
  CommunityKind,
  CommunityPort,
  CommunityStatus,
  CreateCommunityInput,
  CreateCommunityOptions,
  HospitalityCommunity,
} from "./community/mod";
export {
  COMMUNITY_KINDS,
  COMMUNITY_KIND_VALUES,
  COMMUNITY_STATUSES,
  COMMUNITY_STATUS_VALUES,
  createCommunity,
  isCommunityKind,
  isCommunityPort,
  isCommunityStatus,
  isHospitalityCommunity,
  resetCommunityReferenceSequence,
} from "./community/mod";

export type {
  ActivityKind,
  ActivityPort,
  ActivityStatus,
  CreateActivityInput,
  CreateActivityOptions,
  HospitalityActivity,
} from "./activities/mod";
export {
  ACTIVITY_KINDS,
  ACTIVITY_KIND_VALUES,
  ACTIVITY_STATUSES,
  ACTIVITY_STATUS_VALUES,
  createActivity,
  isActivityKind,
  isActivityPort,
  isActivityStatus,
  isHospitalityActivity,
  resetActivityReferenceSequence,
} from "./activities/mod";

export type {
  CreateParticipationInput,
  CreateParticipationOptions,
  HospitalityParticipation,
  ParticipationKind,
  ParticipationPort,
  ParticipationStatus,
} from "./participation/mod";
export {
  PARTICIPATION_KINDS,
  PARTICIPATION_KIND_VALUES,
  PARTICIPATION_STATUSES,
  PARTICIPATION_STATUS_VALUES,
  createParticipation,
  isHospitalityParticipation,
  isParticipationKind,
  isParticipationPort,
  isParticipationStatus,
  resetParticipationReferenceSequence,
} from "./participation/mod";

export type {
  ActivitySchedulePort,
  CreateActivityScheduleInput,
  CreateActivityScheduleOptions,
  HospitalityActivitySchedule,
  ScheduleKind,
  ScheduleStatus,
} from "./scheduling/mod";
export {
  SCHEDULE_KINDS,
  SCHEDULE_KIND_VALUES,
  SCHEDULE_STATUSES,
  SCHEDULE_STATUS_VALUES,
  createActivitySchedule,
  isActivitySchedulePort,
  isHospitalityActivitySchedule,
  isScheduleKind,
  isScheduleStatus,
  resetActivityScheduleReferenceSequence,
} from "./scheduling/mod";

export type {
  ActivityCapacityPort,
  CapacityKind,
  CapacityStatus,
  CreateActivityCapacityInput,
  CreateActivityCapacityOptions,
  HospitalityActivityCapacity,
} from "./capacity/mod";
export {
  CAPACITY_KINDS,
  CAPACITY_KIND_VALUES,
  CAPACITY_STATUSES,
  CAPACITY_STATUS_VALUES,
  createActivityCapacity,
  isActivityCapacityPort,
  isCapacityKind,
  isCapacityStatus,
  isHospitalityActivityCapacity,
  resetActivityCapacityReferenceSequence,
} from "./capacity/mod";

export type {
  ActivityAvailabilityPort,
  AvailabilityKind,
  AvailabilityStatus,
  CreateActivityAvailabilityInput,
  CreateActivityAvailabilityOptions,
  HospitalityActivityAvailability,
} from "./availability/mod";
export {
  AVAILABILITY_KINDS,
  AVAILABILITY_KIND_VALUES,
  AVAILABILITY_STATUSES,
  AVAILABILITY_STATUS_VALUES,
  createActivityAvailability,
  isActivityAvailabilityPort,
  isAvailabilityKind,
  isAvailabilityStatus,
  isHospitalityActivityAvailability,
  resetActivityAvailabilityReferenceSequence,
} from "./availability/mod";

export type {
  BookingBridgePort,
  BookingKind,
  BookingStatus,
  CreateBookingRequestInput,
  CreateBookingRequestOptions,
  HospitalityBookingRequest,
} from "./booking-bridge/mod";
export {
  BOOKING_KINDS,
  BOOKING_KIND_VALUES,
  BOOKING_STATUSES,
  BOOKING_STATUS_VALUES,
  createBookingRequest,
  isBookingBridgePort,
  isBookingKind,
  isBookingStatus,
  isHospitalityBookingRequest,
  resetBookingReferenceSequence,
} from "./booking-bridge/mod";

export type {
  CreateReservationRuntimeInput,
  CreateReservationRuntimeOptions,
  HospitalityReservationRuntime,
  ReservationRuntimeKind,
  ReservationRuntimePort,
  ReservationRuntimeStatus,
} from "./reservation-runtime/mod";
export {
  RESERVATION_RUNTIME_KINDS,
  RESERVATION_RUNTIME_KIND_VALUES,
  RESERVATION_RUNTIME_STATUSES,
  RESERVATION_RUNTIME_STATUS_VALUES,
  createReservationRuntime,
  isHospitalityReservationRuntime,
  isReservationRuntimeKind,
  isReservationRuntimePort,
  isReservationRuntimeStatus,
  resetReservationRuntimeReferenceSequence,
} from "./reservation-runtime/mod";

export type {
  CreateVisitExperienceInput,
  CreateVisitExperienceOptions,
  HospitalityVisitExperience,
  VisitExperiencePort,
  VisitKind,
  VisitStatus,
} from "./visit-experience/mod";
export {
  VISIT_KINDS,
  VISIT_KIND_VALUES,
  VISIT_STATUSES,
  VISIT_STATUS_VALUES,
  createVisitExperience,
  isHospitalityVisitExperience,
  isVisitExperiencePort,
  isVisitKind,
  isVisitStatus,
  resetVisitReferenceSequence,
} from "./visit-experience/mod";

export type {
  CreateVisitContextInput,
  CreateVisitContextOptions,
  HospitalityVisitContext,
  VisitContextKind,
  VisitContextPort,
  VisitContextStatus,
} from "./visit-context/mod";
export {
  VISIT_CONTEXT_KINDS,
  VISIT_CONTEXT_KIND_VALUES,
  VISIT_CONTEXT_STATUSES,
  VISIT_CONTEXT_STATUS_VALUES,
  createVisitContext,
  isHospitalityVisitContext,
  isVisitContextKind,
  isVisitContextPort,
  isVisitContextStatus,
  resetVisitContextReferenceSequence,
} from "./visit-context/mod";

export type {
  CreateTableContextInput,
  CreateTableContextOptions,
  HospitalityTableContext,
  TableContextKind,
  TableContextPort,
  TableContextStatus,
} from "./table-context/mod";
export {
  TABLE_CONTEXT_KINDS,
  TABLE_CONTEXT_KIND_VALUES,
  TABLE_CONTEXT_STATUSES,
  TABLE_CONTEXT_STATUS_VALUES,
  createTableContext,
  isHospitalityTableContext,
  isTableContextKind,
  isTableContextPort,
  isTableContextStatus,
  resetTableContextReferenceSequence,
} from "./table-context/mod";

export type {
  CreateTableChannelInput,
  CreateTableChannelOptions,
  HospitalityTableChannel,
  TableChannelKind,
  TableChannelPort,
  TableChannelStatus,
} from "./table-channel/mod";
export {
  TABLE_CHANNEL_KINDS,
  TABLE_CHANNEL_KIND_VALUES,
  TABLE_CHANNEL_STATUSES,
  TABLE_CHANNEL_STATUS_VALUES,
  createTableChannel,
  isHospitalityTableChannel,
  isTableChannelKind,
  isTableChannelPort,
  isTableChannelStatus,
  resetTableChannelReferenceSequence,
} from "./table-channel/mod";

export type {
  CreateTableInteractionInput,
  CreateTableInteractionOptions,
  HospitalityTableInteraction,
  TableInteractionKind,
  TableInteractionPort,
  TableInteractionStatus,
} from "./table-interaction/mod";
export {
  TABLE_INTERACTION_KINDS,
  TABLE_INTERACTION_KIND_VALUES,
  TABLE_INTERACTION_STATUSES,
  TABLE_INTERACTION_STATUS_VALUES,
  createTableInteraction,
  isHospitalityTableInteraction,
  isTableInteractionKind,
  isTableInteractionPort,
  isTableInteractionStatus,
  resetTableInteractionReferenceSequence,
} from "./table-interaction/mod";

export type {
  CreateCustomerEngagementInput,
  CreateCustomerEngagementOptions,
  CustomerEngagementKind,
  CustomerEngagementPort,
  CustomerEngagementStatus,
  HospitalityCustomerEngagement,
} from "./customer-engagement/mod";
export {
  CUSTOMER_ENGAGEMENT_KINDS,
  CUSTOMER_ENGAGEMENT_KIND_VALUES,
  CUSTOMER_ENGAGEMENT_STATUSES,
  CUSTOMER_ENGAGEMENT_STATUS_VALUES,
  createCustomerEngagement,
  isCustomerEngagementKind,
  isCustomerEngagementPort,
  isCustomerEngagementStatus,
  isHospitalityCustomerEngagement,
  resetCustomerEngagementReferenceSequence,
} from "./customer-engagement/mod";

export type {
  CreateMemberProfileInput,
  CreateMemberProfileOptions,
  HospitalityMemberProfile,
  MemberProfileKind,
  MemberProfilePort,
  MemberProfileStatus,
} from "./member-profile/mod";
export {
  MEMBER_PROFILE_KINDS,
  MEMBER_PROFILE_KIND_VALUES,
  MEMBER_PROFILE_STATUSES,
  MEMBER_PROFILE_STATUS_VALUES,
  createMemberProfile,
  isHospitalityMemberProfile,
  isMemberProfileKind,
  isMemberProfilePort,
  isMemberProfileStatus,
  resetMemberProfileReferenceSequence,
} from "./member-profile/mod";

export type {
  CreateEngagementSuggestionInput,
  CreateEngagementSuggestionOptions,
  EngagementSuggestionKind,
  EngagementSuggestionPort,
  EngagementSuggestionStatus,
  HospitalityEngagementSuggestion,
} from "./suggestions/mod";
export {
  ENGAGEMENT_SUGGESTION_KINDS,
  ENGAGEMENT_SUGGESTION_KIND_VALUES,
  ENGAGEMENT_SUGGESTION_STATUSES,
  ENGAGEMENT_SUGGESTION_STATUS_VALUES,
  createSuggestion,
  isEngagementSuggestionKind,
  isEngagementSuggestionPort,
  isEngagementSuggestionStatus,
  isHospitalityEngagementSuggestion,
  resetEngagementSuggestionReferenceSequence,
} from "./suggestions/mod";

export type {
  CreateEngagementRuleInput,
  CreateEngagementRuleOptions,
  EngagementRuleKind,
  EngagementRulePort,
  EngagementRuleStatus,
  HospitalityEngagementRule,
} from "./engagement-rules/mod";
export {
  ENGAGEMENT_RULE_KINDS,
  ENGAGEMENT_RULE_KIND_VALUES,
  ENGAGEMENT_RULE_STATUSES,
  ENGAGEMENT_RULE_STATUS_VALUES,
  createEngagementRule,
  isEngagementRuleKind,
  isEngagementRulePort,
  isEngagementRuleStatus,
  isHospitalityEngagementRule,
  resetEngagementRuleReferenceSequence,
} from "./engagement-rules/mod";

export type {
  CreateEngagementSignalInput,
  CreateEngagementSignalOptions,
  EngagementSignalKind,
  EngagementSignalPort,
  EngagementSignalStatus,
  HospitalityEngagementSignal,
} from "./engagement-signals/mod";
export {
  ENGAGEMENT_SIGNAL_KINDS,
  ENGAGEMENT_SIGNAL_KIND_VALUES,
  ENGAGEMENT_SIGNAL_STATUSES,
  ENGAGEMENT_SIGNAL_STATUS_VALUES,
  createEngagementSignal,
  isEngagementSignalKind,
  isEngagementSignalPort,
  isEngagementSignalStatus,
  isHospitalityEngagementSignal,
  resetEngagementSignalReferenceSequence,
} from "./engagement-signals/mod";
