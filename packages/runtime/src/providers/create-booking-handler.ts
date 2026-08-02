import {
  defaultApiErrorMapper,
  toApiResponse,
  toCreateBookingInput,
  toCreateBookingResponse,
  toExecutionContext,
  type ApiRequest,
  type ApiService,
} from "@motanos/api";
import type { CreateBookingUseCase } from "@motanos/application";
import type { CreateBookingHandler } from "../contracts/create-booking-handler";

/**
 * Internal: wires CreateBooking UseCase to the API handler contract.
 */
export function createCreateBookingHandler(deps: {
  useCase: CreateBookingUseCase;
}): CreateBookingHandler {
  return {
    async handle(request, context) {
      const input = toCreateBookingInput(request);
      const executionContext = toExecutionContext(context, request);
      const result = await deps.useCase.execute(input, executionContext);
      return toCreateBookingResponse(result, {
        ...(request.requestReference !== undefined
          ? { requestReference: request.requestReference }
          : context?.requestReference !== undefined
            ? { requestReference: context.requestReference }
            : {}),
        version: "v1",
      });
    },
  };
}

/**
 * Internal: generic ApiService executing any UseCase via the API pipeline shape.
 */
export function createDefaultApiService(): ApiService {
  return {
    async execute({ request, input, useCase, context }) {
      const executionContext = toExecutionContext(
        context,
        request as ApiRequest,
      );
      const result = await useCase.execute(input, executionContext);
      return toApiResponse(result, defaultApiErrorMapper, {
        ...(request.requestReference !== undefined
          ? { requestReference: request.requestReference }
          : {}),
        version: "v1",
      });
    },
  };
}
