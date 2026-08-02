export type {
  CreateBookingRequest,
  CreateBookingResponse,
  CreateBookingResponseData,
} from "./create-booking";
export { toCreateBookingInput } from "./create-booking";

export type {
  ConfirmBookingRequest,
  ConfirmBookingResponse,
  ConfirmBookingResponseData,
} from "./confirm-booking";
export { toConfirmBookingInput } from "./confirm-booking";

export type {
  CancelBookingRequest,
  CancelBookingResponse,
  CancelBookingResponseData,
} from "./cancel-booking";
export { toCancelBookingInput } from "./cancel-booking";

export {
  toCancelBookingResponse,
  toConfirmBookingResponse,
  toCreateBookingResponse,
} from "./map-response";
