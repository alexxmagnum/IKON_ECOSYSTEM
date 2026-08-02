import type {
  CheckAvailabilityInput,
  CheckAvailabilityOutput,
} from "@motanos/application";
import type { ApiRequest } from "../request";
import type { ApiResponse } from "../response";

export interface CheckAvailabilityRequest extends ApiRequest {
  resourceReference: string;
  startAt: string;
  endAt: string;
  metadata?: Record<string, unknown>;
}

export type CheckAvailabilityResponseData = CheckAvailabilityOutput;
export type CheckAvailabilityResponse =
  ApiResponse<CheckAvailabilityResponseData>;

export function toCheckAvailabilityInput(
  request: CheckAvailabilityRequest,
): CheckAvailabilityInput {
  return {
    resourceReference: request.resourceReference,
    startAt: request.startAt,
    endAt: request.endAt,
    ...(request.metadata !== undefined ? { metadata: request.metadata } : {}),
  };
}
