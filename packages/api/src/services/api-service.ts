import type { UseCase } from "@motanos/application";
import type { ApiRequest } from "../contracts/request";
import type { ApiResponse } from "../contracts/response";
import type { ApiContext } from "../context/api-context";

/**
 * API service contract — future entry point for external → Application execution.
 * No routes, controllers, or domain handlers in this foundation.
 */
export interface ApiService {
  execute<TInput, TOutput>(args: {
    request: ApiRequest;
    input: TInput;
    useCase: UseCase<TInput, TOutput>;
    context?: ApiContext;
  }): Promise<ApiResponse<TOutput>>;
}
