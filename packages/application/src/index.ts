/**
 * @motanos/application — Application Layer foundation.
 *
 * UI / API → Application Layer → Engines + Domains → Core
 *
 * Orchestrates use cases. First vertical slice: CreateBooking.
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
  CREATE_BOOKING_ACTION,
  createCreateBookingUseCase,
  DEFAULT_HOLD_TTL_MINUTES,
  type CreateBookingAction,
  type CreateBookingInput,
  type CreateBookingOutput,
  type CreateBookingUseCase,
  type CreateBookingUseCaseDeps,
} from "./use-cases/booking";
