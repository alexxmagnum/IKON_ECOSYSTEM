/**
 * @motanos/booking — Shared Booking Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/booking → Domain Modules
 *
 * Must not depend on customer implementations, concrete domains,
 * persistence packages, or payment vendors.
 */

export const BOOKING_ENGINE = "@motanos/booking" as const;

export type {
  AvailabilityRule,
  FacilityId,
  Resource,
  ResourceId,
  ResourceType,
} from "./domain/resource";
export { RESOURCE_TYPES } from "./domain/resource";

export type {
  Booking,
  BookingId,
  /** Legacy aggregate party shape — use boundary `BookingParticipant` for new work. */
  BookingParticipant as BookingAggregateParticipant,
  ParticipantId,
  TimeInterval,
  UserId,
  WaitlistEntry,
} from "./domain/booking";

export type { Availability, AvailabilitySlot } from "./domain/availability";
export {
  bookingsConflict,
  checkRangeAvailability,
  intervalsOverlap,
  statusBlocksAvailability,
} from "./domain/availability";

export type {
  AvailabilityBlockingStatus,
  BookingEvent,
  BookingFinalStatus,
  BookingStatus,
  ReschedulableBookingStatus,
  ResourceStatus,
} from "./types/states";
export {
  allowedBookingTargets,
  AVAILABILITY_BLOCKING_STATUSES,
  BOOKING_EVENTS,
  BOOKING_FINAL_STATUSES,
  BOOKING_STATUSES,
  BOOKING_TRANSITIONS,
  canRescheduleBooking,
  canTransitionBooking,
  DEFAULT_HOLD_TTL_MINUTES,
  DEFAULT_WAITLIST_OFFER_TTL_MINUTES,
  isAvailabilityBlocking,
  isBookingFinal,
  isBookingStatus,
  NON_BLOCKING_STATUSES,
  RESCHEDULABLE_BOOKING_STATUSES,
  RESOURCE_STATUSES,
  shouldExpireBookingHold,
} from "./types/states";

export type {
  AvailabilityCheckInput,
  AvailabilityCheckResult,
  AvailabilityQuery,
  AvailabilityResult,
  BookingResult,
  CancelBookingInput,
  ConfirmBookingInput,
  CreateBookingInput,
  ExpireBookingHoldsInput,
  ExpireBookingHoldsResult,
  JoinWaitlistInput,
  ListBookingsQuery,
  RescheduleBookingInput,
  ResourceResult,
  UpdateBookingInput,
  WaitlistResult,
} from "./contracts";

export type {
  AvailabilityService,
  BookingService,
  ResourceService,
  WaitlistService,
} from "./services";
export {
  createBookingService,
  type CreateBookingServiceOptions,
} from "./services/create-booking-service";
export {
  commitBookingMutation,
  type BookingMutationCommitResult,
  type BookingMutationPhase,
} from "./services/booking-mutation-boundary";

export type { BookingQueryService } from "./queries";
export { createBookingQueryService } from "./queries";

export type {
  BookingTenantContext,
  TenantReference,
} from "./context";
export {
  createBookingTenantContext,
  requireTenantReference,
  sameTenant,
} from "./context";

export type {
  BookingAuthAction,
  BookingAuthOperation,
  BookingAuthorizationDecision,
  BookingAuthorizationGateway,
  BookingAuthorizationPolicy,
  BookingAuthorizationRequest,
  BookingAuthorizationResourceContext,
  BookingPolicy,
  BookingPolicyOperation,
  BookingPolicyRequest,
  CreateBookingPolicyOptions,
  PolicyDecision,
} from "./policies";
export {
  BOOKING_AUTH_ACTIONS,
  BOOKING_AUTH_OPERATIONS,
  BOOKING_POLICY_OPERATIONS,
  BOOKING_POLICY_OPERATION_VALUES,
  bookingAuthActionFor,
  createBookingAuthorizationPolicy,
  createBookingPolicy,
  isBookingAuthOperation,
  isBookingPolicy,
  isBookingPolicyOperation,
  isPolicyDecision,
} from "./policies";

export type {
  BookingPricing,
  BookingPricingOperation,
  BookingPricingRequest,
  CreateBookingPricingOptions,
  PricingDecision,
} from "./pricing";
export {
  BOOKING_PRICING_OPERATIONS,
  BOOKING_PRICING_OPERATION_VALUES,
  createBookingPricing,
  isBookingPricing,
  isBookingPricingOperation,
  isPricingDecision,
} from "./pricing";

export type {
  BookingDiscount,
  BookingDiscountOperation,
  BookingDiscountRequest,
  CreateBookingDiscountOptions,
  DiscountDecision,
} from "./discounts";
export {
  BOOKING_DISCOUNT_OPERATIONS,
  BOOKING_DISCOUNT_OPERATION_VALUES,
  createBookingDiscount,
  isBookingDiscount,
  isBookingDiscountOperation,
  isDiscountDecision,
} from "./discounts";

export type {
  BookingTax,
  BookingTaxKind,
  BookingTaxPort,
  BookingTaxRequest,
  CreateBookingTaxOptions,
  CreateBookingTaxRequestInput,
  TaxDecision,
} from "./taxes";
export {
  BOOKING_TAX_KINDS,
  BOOKING_TAX_KIND_VALUES,
  createBookingTax,
  createBookingTaxRequest,
  isBookingTax,
  isBookingTaxKind,
  isBookingTaxPort,
  isBookingTaxRequest,
  isTaxDecision,
  resetBookingTaxReferenceSequence,
} from "./taxes";

export type {
  BookingFee,
  BookingFeeKind,
  BookingFeePort,
  BookingFeeRequest,
  CreateBookingFeeOptions,
  CreateBookingFeeRequestInput,
  FeeDecision,
} from "./fees";
export {
  BOOKING_FEE_KINDS,
  BOOKING_FEE_KIND_VALUES,
  createBookingFee,
  createBookingFeeRequest,
  isBookingFee,
  isBookingFeeKind,
  isBookingFeePort,
  isBookingFeeRequest,
  isFeeDecision,
  resetBookingFeeReferenceSequence,
} from "./fees";

export type {
  BalanceDecision,
  BookingBalance,
  BookingBalanceKind,
  BookingBalancePort,
  BookingBalanceRequest,
  BookingBalanceStatus,
  CreateBookingBalanceOptions,
  CreateBookingBalanceRequestInput,
} from "./balances";
export {
  BOOKING_BALANCE_KINDS,
  BOOKING_BALANCE_KIND_VALUES,
  BOOKING_BALANCE_STATUSES,
  BOOKING_BALANCE_STATUS_VALUES,
  createBookingBalance,
  createBookingBalanceRequest,
  isBalanceDecision,
  isBookingBalance,
  isBookingBalanceKind,
  isBookingBalancePort,
  isBookingBalanceRequest,
  isBookingBalanceStatus,
  resetBookingBalanceReferenceSequence,
} from "./balances";

export type {
  BookingSettlement,
  BookingSettlementKind,
  BookingSettlementPort,
  BookingSettlementRequest,
  BookingSettlementStatus,
  CreateBookingSettlementOptions,
  CreateBookingSettlementRequestInput,
  SettlementDecision,
} from "./settlements";
export {
  BOOKING_SETTLEMENT_KINDS,
  BOOKING_SETTLEMENT_KIND_VALUES,
  BOOKING_SETTLEMENT_STATUSES,
  BOOKING_SETTLEMENT_STATUS_VALUES,
  createBookingSettlement,
  createBookingSettlementRequest,
  isBookingSettlement,
  isBookingSettlementKind,
  isBookingSettlementPort,
  isBookingSettlementRequest,
  isBookingSettlementStatus,
  isSettlementDecision,
  resetBookingSettlementReferenceSequence,
} from "./settlements";

export type {
  BookingInvoice,
  BookingInvoiceKind,
  BookingInvoicePort,
  BookingInvoiceStatus,
  CreateBookingInvoiceInput,
  CreateBookingInvoiceOptions,
} from "./invoices";
export {
  BOOKING_INVOICE_KINDS,
  BOOKING_INVOICE_KIND_VALUES,
  BOOKING_INVOICE_STATUSES,
  BOOKING_INVOICE_STATUS_VALUES,
  createBookingInvoice,
  isBookingInvoice,
  isBookingInvoiceKind,
  isBookingInvoicePort,
  isBookingInvoiceStatus,
  resetBookingInvoiceReferenceSequence,
} from "./invoices";

export type {
  BookingDocument,
  BookingDocumentKind,
  BookingDocumentPort,
  BookingDocumentStatus,
  CreateBookingDocumentInput,
  CreateBookingDocumentOptions,
} from "./documents";
export {
  BOOKING_DOCUMENT_KINDS,
  BOOKING_DOCUMENT_KIND_VALUES,
  BOOKING_DOCUMENT_STATUSES,
  BOOKING_DOCUMENT_STATUS_VALUES,
  createBookingDocument,
  isBookingDocument,
  isBookingDocumentKind,
  isBookingDocumentPort,
  isBookingDocumentStatus,
  resetBookingDocumentReferenceSequence,
} from "./documents";

export type {
  BookingApproval,
  BookingApprovalKind,
  BookingApprovalPort,
  BookingApprovalStatus,
  CreateBookingApprovalInput,
  CreateBookingApprovalOptions,
} from "./approvals";
export {
  BOOKING_APPROVAL_KINDS,
  BOOKING_APPROVAL_KIND_VALUES,
  BOOKING_APPROVAL_STATUSES,
  BOOKING_APPROVAL_STATUS_VALUES,
  createBookingApproval,
  isBookingApproval,
  isBookingApprovalKind,
  isBookingApprovalPort,
  isBookingApprovalStatus,
  resetBookingApprovalReferenceSequence,
} from "./approvals";

export type {
  BookingException,
  BookingExceptionKind,
  BookingExceptionPort,
  BookingExceptionStatus,
  CreateBookingExceptionInput,
  CreateBookingExceptionOptions,
} from "./exceptions";
export {
  BOOKING_EXCEPTION_KINDS,
  BOOKING_EXCEPTION_KIND_VALUES,
  BOOKING_EXCEPTION_STATUSES,
  BOOKING_EXCEPTION_STATUS_VALUES,
  createBookingException,
  isBookingException,
  isBookingExceptionKind,
  isBookingExceptionPort,
  isBookingExceptionStatus,
  resetBookingExceptionReferenceSequence,
} from "./exceptions";

export type {
  BookingCancellation,
  BookingCancellationKind,
  BookingCancellationPort,
  BookingCancellationStatus,
  CreateBookingCancellationInput,
  CreateBookingCancellationOptions,
} from "./cancellations";
export {
  BOOKING_CANCELLATION_KINDS,
  BOOKING_CANCELLATION_KIND_VALUES,
  BOOKING_CANCELLATION_STATUSES,
  BOOKING_CANCELLATION_STATUS_VALUES,
  createBookingCancellation,
  isBookingCancellation,
  isBookingCancellationKind,
  isBookingCancellationPort,
  isBookingCancellationStatus,
  resetBookingCancellationReferenceSequence,
} from "./cancellations";

export type {
  BookingReschedule,
  BookingRescheduleKind,
  BookingReschedulePort,
  BookingRescheduleStatus,
  CreateBookingRescheduleInput,
  CreateBookingRescheduleOptions,
} from "./reschedules";
export {
  BOOKING_RESCHEDULE_KINDS,
  BOOKING_RESCHEDULE_KIND_VALUES,
  BOOKING_RESCHEDULE_STATUSES,
  BOOKING_RESCHEDULE_STATUS_VALUES,
  createBookingReschedule,
  isBookingReschedule,
  isBookingRescheduleKind,
  isBookingReschedulePort,
  isBookingRescheduleStatus,
  resetBookingRescheduleReferenceSequence,
} from "./reschedules";

export type {
  BookingModification,
  BookingModificationKind,
  BookingModificationPort,
  BookingModificationStatus,
  CreateBookingModificationInput,
  CreateBookingModificationOptions,
} from "./modifications";
export {
  BOOKING_MODIFICATION_KINDS,
  BOOKING_MODIFICATION_KIND_VALUES,
  BOOKING_MODIFICATION_STATUSES,
  BOOKING_MODIFICATION_STATUS_VALUES,
  createBookingModification,
  isBookingModification,
  isBookingModificationKind,
  isBookingModificationPort,
  isBookingModificationStatus,
  resetBookingModificationReferenceSequence,
} from "./modifications";

export type {
  BookingCheckIn,
  BookingCheckInKind,
  BookingCheckInPort,
  BookingCheckInStatus,
  CreateBookingCheckInInput,
  CreateBookingCheckInOptions,
} from "./checkins";
export {
  BOOKING_CHECK_IN_KINDS,
  BOOKING_CHECK_IN_KIND_VALUES,
  BOOKING_CHECK_IN_STATUSES,
  BOOKING_CHECK_IN_STATUS_VALUES,
  createBookingCheckIn,
  isBookingCheckIn,
  isBookingCheckInKind,
  isBookingCheckInPort,
  isBookingCheckInStatus,
  resetBookingCheckInReferenceSequence,
} from "./checkins";

export type {
  BookingNoShow,
  BookingNoShowKind,
  BookingNoShowPort,
  BookingNoShowStatus,
  CreateBookingNoShowInput,
  CreateBookingNoShowOptions,
} from "./no-shows";
export {
  BOOKING_NO_SHOW_KINDS,
  BOOKING_NO_SHOW_KIND_VALUES,
  BOOKING_NO_SHOW_STATUSES,
  BOOKING_NO_SHOW_STATUS_VALUES,
  createBookingNoShow,
  isBookingNoShow,
  isBookingNoShowKind,
  isBookingNoShowPort,
  isBookingNoShowStatus,
  resetBookingNoShowReferenceSequence,
} from "./no-shows";

export type {
  BookingCompletion,
  BookingCompletionKind,
  BookingCompletionPort,
  BookingCompletionStatus,
  CreateBookingCompletionInput,
  CreateBookingCompletionOptions,
} from "./completions";
export {
  BOOKING_COMPLETION_KINDS,
  BOOKING_COMPLETION_KIND_VALUES,
  BOOKING_COMPLETION_STATUSES,
  BOOKING_COMPLETION_STATUS_VALUES,
  createBookingCompletion,
  isBookingCompletion,
  isBookingCompletionKind,
  isBookingCompletionPort,
  isBookingCompletionStatus,
  resetBookingCompletionReferenceSequence,
} from "./completions";

export type {
  BookingWaitlist,
  BookingWaitlistKind,
  BookingWaitlistPort,
  BookingWaitlistStatus,
  CreateBookingWaitlistInput,
  CreateBookingWaitlistOptions,
} from "./waitlists";
export {
  BOOKING_WAITLIST_KINDS,
  BOOKING_WAITLIST_KIND_VALUES,
  BOOKING_WAITLIST_STATUSES,
  BOOKING_WAITLIST_STATUS_VALUES,
  createBookingWaitlist,
  isBookingWaitlist,
  isBookingWaitlistKind,
  isBookingWaitlistPort,
  isBookingWaitlistStatus,
  resetBookingWaitlistReferenceSequence,
} from "./waitlists";

export type {
  BookingRecurrence,
  BookingRecurrenceKind,
  BookingRecurrencePort,
  BookingRecurrenceStatus,
  CreateBookingRecurrenceInput,
  CreateBookingRecurrenceOptions,
} from "./recurrences";
export {
  BOOKING_RECURRENCE_KINDS,
  BOOKING_RECURRENCE_KIND_VALUES,
  BOOKING_RECURRENCE_STATUSES,
  BOOKING_RECURRENCE_STATUS_VALUES,
  createBookingRecurrence,
  isBookingRecurrence,
  isBookingRecurrenceKind,
  isBookingRecurrencePort,
  isBookingRecurrenceStatus,
  resetBookingRecurrenceReferenceSequence,
} from "./recurrences";

export type {
  BookingParticipant,
  BookingParticipantKind,
  BookingParticipantPort,
  BookingParticipantStatus,
  CreateBookingParticipantInput,
  CreateBookingParticipantOptions,
} from "./participants";
export {
  BOOKING_PARTICIPANT_KINDS,
  BOOKING_PARTICIPANT_KIND_VALUES,
  BOOKING_PARTICIPANT_STATUSES,
  BOOKING_PARTICIPANT_STATUS_VALUES,
  createBookingParticipant,
  isBookingParticipant,
  isBookingParticipantKind,
  isBookingParticipantPort,
  isBookingParticipantStatus,
  resetBookingParticipantReferenceSequence,
} from "./participants";

export type {
  BookingAuditAction,
  BookingAuditRecord,
  CreateBookingAuditRecordInput,
} from "./audit";
export {
  BOOKING_AUDIT_ACTIONS,
  BOOKING_AUDIT_ACTION_VALUES,
  createBookingAuditRecord,
  isBookingAuditAction,
  isBookingAuditRecord,
  resetBookingAuditReferenceSequence,
} from "./audit";

export type {
  BookingCalendarPort,
  BookingCalendarSyncRequest,
  BookingIntegrationPort,
  BookingNotificationPort,
  BookingPaymentPort,
} from "./integrations";
export {
  BOOKING_INTEGRATION_FORBIDDEN_REQUEST_KEYS,
  isBookingCalendarPort,
  isBookingIntegrationPort,
  isBookingNotificationPort,
  isBookingPaymentPort,
} from "./integrations";

export type {
  BookingNotificationKind,
  BookingNotificationRequest,
  CreateBookingNotificationRequestInput,
} from "./notifications";
export {
  BOOKING_NOTIFICATION_KINDS,
  BOOKING_NOTIFICATION_KIND_VALUES,
  createBookingNotificationRequest,
  isBookingNotificationKind,
  isBookingNotificationRequest,
  resetBookingNotificationReferenceSequence,
} from "./notifications";

export type {
  BookingPaymentKind,
  BookingPaymentRequest,
  BookingPaymentResult,
  CreateBookingPaymentRequestInput,
} from "./payments";
export {
  BOOKING_PAYMENT_KINDS,
  BOOKING_PAYMENT_KIND_VALUES,
  createBookingPaymentRequest,
  isBookingPaymentKind,
  isBookingPaymentRequest,
  resetBookingPaymentReferenceSequence,
} from "./payments";

export type {
  BookingAvailabilityDecision,
  BookingAvailabilityKind,
  BookingAvailabilityPolicy,
  BookingAvailabilityPort,
  BookingAvailabilityRequest,
  CreateBookingAvailabilityRequestInput,
} from "./availability";
export {
  BOOKING_AVAILABILITY_KINDS,
  BOOKING_AVAILABILITY_KIND_VALUES,
  availabilityBelongsToTenant,
  createBookingAvailabilityRequest,
  isBookingAvailabilityKind,
  isBookingAvailabilityPort,
  isBookingAvailabilityRequest,
  resetBookingAvailabilityReferenceSequence,
} from "./availability";

export type {
  BookingResource,
  BookingResourceKind,
  BookingResourcePort,
  CreateBookingResourceInput,
} from "./resources";
export {
  BOOKING_RESOURCE_KINDS,
  BOOKING_RESOURCE_KIND_VALUES,
  createBookingResource,
  isBookingResource,
  isBookingResourceKind,
  isBookingResourcePort,
  resetBookingResourceReferenceSequence,
  resourceBelongsToTenant,
} from "./resources";

export type {
  BookingMembership,
  BookingMembershipKind,
  BookingMembershipPort,
  BookingMembershipStatus,
  CreateBookingMembershipInput,
} from "./memberships";
export {
  BOOKING_MEMBERSHIP_KINDS,
  BOOKING_MEMBERSHIP_KIND_VALUES,
  BOOKING_MEMBERSHIP_STATUSES,
  BOOKING_MEMBERSHIP_STATUS_VALUES,
  createBookingMembership,
  isBookingMembership,
  isBookingMembershipKind,
  isBookingMembershipPort,
  isBookingMembershipStatus,
  membershipBelongsToTenant,
  resetBookingMembershipReferenceSequence,
} from "./memberships";

export type {
  BookingWorkflow,
  BookingWorkflowDefinition,
  BookingWorkflowKind,
  BookingWorkflowState,
  CreateBookingWorkflowInput,
} from "./workflows";
export {
  BOOKING_WORKFLOW_KINDS,
  BOOKING_WORKFLOW_KIND_VALUES,
  BOOKING_WORKFLOW_STATES,
  BOOKING_WORKFLOW_STATE_VALUES,
  createBookingWorkflow,
  createBookingWorkflowDefinition,
  isBookingWorkflow,
  isBookingWorkflowDefinition,
  isBookingWorkflowKind,
  isBookingWorkflowState,
  resetBookingWorkflowReferenceSequence,
  workflowBelongsToTenant,
} from "./workflows";

export type {
  BookingRepository,
  FindBookingConflictsQuery,
} from "./repositories";
export {
  createInMemoryBookingRepository,
  patchInMemoryHoldExpiresAt,
} from "./repositories";

export type {
  BookingCancelledEvent,
  BookingConfirmedEvent,
  BookingCreatedEvent,
  BookingDomainEvent,
  BookingDomainEventType,
  BookingHoldExpiredEvent,
  BookingRescheduledEvent,
  CreateBookingCancelledEventInput,
  CreateBookingConfirmedEventInput,
  CreateBookingCreatedEventInput,
  CreateBookingHoldExpiredEventInput,
  CreateBookingRescheduledEventInput,
  DomainEvent,
} from "./events";
export {
  BOOKING_DOMAIN_EVENT_TYPES,
  createBookingCancelledEvent,
  createBookingConfirmedEvent,
  createBookingCreatedEvent,
  createBookingHoldExpiredEvent,
  createBookingRescheduledEvent,
  emitBookingCancelled,
  emitBookingConfirmed,
  emitBookingCreated,
  emitBookingHoldExpired,
  emitBookingRescheduled,
  isDomainEvent,
} from "./events";
