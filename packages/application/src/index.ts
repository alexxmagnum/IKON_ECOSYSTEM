/**
 * @motanos/application — Application Layer foundation.
 *
 * UI / API → Application Layer → Engines + Domains → Core
 *
 * Orchestration contracts only. Does not import engines, domains, auth, or DB.
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
