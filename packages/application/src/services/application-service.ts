import type { ExecutionContext } from "../context/execution-context";
import type { ApplicationResult } from "../contracts/result";
import type { UseCase } from "../contracts/use-case";

/**
 * Application service contract — future orchestration entry point.
 * Executes registered use cases with an execution context; returns results.
 * No domain/engine wiring in this foundation.
 */
export interface ApplicationService {
  execute<TInput, TOutput>(
    useCase: UseCase<TInput, TOutput>,
    input: TInput,
    context: ExecutionContext,
  ): Promise<ApplicationResult<TOutput>>;
}
