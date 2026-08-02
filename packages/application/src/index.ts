/**
 * @motanos/application — Application Layer foundation.
 *
 * UI / API → Application Layer → Engines + Domains → Core
 *
 * Booking lifecycle slice: Create / Confirm / Cancel.
 */

export const APPLICATION_LAYER = "@motanos/application" as const;

export type {
  ActorReference,
  ExecutionContext,
  RequestReference,
} from "./context/execution-context";

export type {
  ApplicationError,
  ApplicationErrorCode,
} from "./contracts/errors";
export {
  APPLICATION_ERROR_CODES,
  isApplicationErrorCode,
} from "./contracts/errors";

export type {
  ApplicationFailure,
  ApplicationResult,
  ApplicationSuccess,
} from "./contracts/result";
export { failure, isFailure, isSuccess, success } from "./contracts/result";

export type { UseCase } from "./contracts/use-case";

export type { ApplicationService } from "./services/application-service";

export {
  CANCEL_BOOKING_ACTION,
  CHECK_AVAILABILITY_ACTION,
  CONFIRM_BOOKING_ACTION,
  CREATE_BOOKING_ACTION,
  createCancelBookingUseCase,
  createCheckAvailabilityUseCase,
  createConfirmBookingUseCase,
  createCreateBookingUseCase,
  DEFAULT_HOLD_TTL_MINUTES,
  toBookingOutput,
  type BookingOutput,
  type CancelBookingAction,
  type CancelBookingInput,
  type CancelBookingOutput,
  type CancelBookingUseCase,
  type CancelBookingUseCaseDeps,
  type CheckAvailabilityAction,
  type CheckAvailabilityInput,
  type CheckAvailabilityOutput,
  type CheckAvailabilityUseCase,
  type CheckAvailabilityUseCaseDeps,
  type ConfirmBookingAction,
  type ConfirmBookingInput,
  type ConfirmBookingOutput,
  type ConfirmBookingUseCase,
  type ConfirmBookingUseCaseDeps,
  type CreateBookingAction,
  type CreateBookingInput,
  type CreateBookingOutput,
  type CreateBookingUseCase,
  type CreateBookingUseCaseDeps,
} from "./use-cases/booking";
