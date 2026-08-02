import type { ExecutionContext } from "../context/execution-context";
import type { ApplicationResult } from "./result";

/**
 * Application use-case contract.
 * One use case = one documented business intention (Backend Architect criteria).
 * No concrete product use cases in this foundation.
 */
export interface UseCase<TInput, TOutput> {
  readonly name: string;
  execute(
    input: TInput,
    context: ExecutionContext,
  ): Promise<ApplicationResult<TOutput>>;
}
