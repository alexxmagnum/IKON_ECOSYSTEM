import {
  defaultApiErrorMapper,
  toApiResponse,
  toCancelBookingInput,
  toCancelBookingResponse,
  toCheckAvailabilityInput,
  toCheckAvailabilityResponse,
  toConfirmBookingInput,
  toConfirmBookingResponse,
  toCreateBookingInput,
  toCreateBookingResponse,
  toExecutionContext,
  type ApiRequest,
  type ApiService,
} from "@motanos/api";
import type {
  CancelBookingUseCase,
  CheckAvailabilityUseCase,
  ConfirmBookingUseCase,
  CreateBookingUseCase,
} from "@motanos/application";
import type {
  CancelBookingHandler,
  CheckAvailabilityHandler,
  ConfirmBookingHandler,
  CreateBookingHandler,
} from "../contracts/create-booking-handler";

function responseMeta(
  request: { requestReference?: string },
  context?: { requestReference?: string },
) {
  return {
    ...(request.requestReference !== undefined
      ? { requestReference: request.requestReference }
      : context?.requestReference !== undefined
        ? { requestReference: context.requestReference }
        : {}),
    version: "v1" as const,
  };
}

export function createCreateBookingHandler(deps: {
  useCase: CreateBookingUseCase;
}): CreateBookingHandler {
  return {
    async handle(request, context) {
      const input = toCreateBookingInput(request);
      const executionContext = toExecutionContext(context, request);
      const result = await deps.useCase.execute(input, executionContext);
      return toCreateBookingResponse(result, responseMeta(request, context));
    },
  };
}

export function createConfirmBookingHandler(deps: {
  useCase: ConfirmBookingUseCase;
}): ConfirmBookingHandler {
  return {
    async handle(request, context) {
      const input = toConfirmBookingInput(request);
      const executionContext = toExecutionContext(context, request);
      const result = await deps.useCase.execute(input, executionContext);
      return toConfirmBookingResponse(result, responseMeta(request, context));
    },
  };
}

export function createCancelBookingHandler(deps: {
  useCase: CancelBookingUseCase;
}): CancelBookingHandler {
  return {
    async handle(request, context) {
      const input = toCancelBookingInput(request);
      const executionContext = toExecutionContext(context, request);
      const result = await deps.useCase.execute(input, executionContext);
      return toCancelBookingResponse(result, responseMeta(request, context));
    },
  };
}

export function createCheckAvailabilityHandler(deps: {
  useCase: CheckAvailabilityUseCase;
}): CheckAvailabilityHandler {
  return {
    async handle(request, context) {
      const input = toCheckAvailabilityInput(request);
      const executionContext = toExecutionContext(context, request);
      const result = await deps.useCase.execute(input, executionContext);
      return toCheckAvailabilityResponse(
        result,
        responseMeta(request, context),
      );
    },
  };
}

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
