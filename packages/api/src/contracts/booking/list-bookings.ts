import type {
  BookingOutput,
  ListBookingsInput,
  ListBookingsOutput,
} from "@motanos/application";
import type { ApiRequest } from "../request";
import type { ApiResponse } from "../response";

export interface ListBookingsRequest extends ApiRequest {
  tenantReference: string;
  resourceReference?: string;
  customerReference?: string;
  startAt?: string;
  endAt?: string;
  status?: BookingOutput["status"] | Array<BookingOutput["status"]>;
  metadata?: Record<string, unknown>;
}

export type ListBookingsResponseData = ListBookingsOutput;
export type ListBookingsResponse = ApiResponse<ListBookingsResponseData>;

function trimOptional(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function toListBookingsInput(
  request: ListBookingsRequest,
): ListBookingsInput {
  const resourceReference = trimOptional(request.resourceReference);
  const customerReference = trimOptional(request.customerReference);
  const startAt = trimOptional(request.startAt);
  const endAt = trimOptional(request.endAt);

  return {
    tenantReference: request.tenantReference.trim(),
    ...(resourceReference !== undefined ? { resourceReference } : {}),
    ...(customerReference !== undefined ? { customerReference } : {}),
    ...(startAt !== undefined ? { startAt } : {}),
    ...(endAt !== undefined ? { endAt } : {}),
    ...(request.status !== undefined ? { status: request.status } : {}),
    ...(request.metadata !== undefined ? { metadata: request.metadata } : {}),
  };
}
