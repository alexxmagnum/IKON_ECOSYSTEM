/**
 * Re-exports for consumers that prefer `@motanos/application` types barrel.
 */
export type {
  ActorReference,
  RequestReference,
} from "../context/execution-context";
export type { ApplicationErrorCode } from "../contracts/errors";
export {
  APPLICATION_ERROR_CODES,
  isApplicationErrorCode,
} from "../contracts/errors";
