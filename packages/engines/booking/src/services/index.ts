import type {
  AvailabilityQuery,
  AvailabilityResult,
  BookingResult,
  CancelBookingInput,
  ConfirmBookingInput,
  CreateBookingInput,
  JoinWaitlistInput,
  ListBookingsQuery,
  UpdateBookingInput,
  WaitlistResult,
} from "../contracts";
import type { BookingId } from "../domain/booking";
import type { Resource, ResourceId } from "../domain/resource";

/**
 * Service contracts for the Booking Engine.
 * Implementations (persistence adapters) arrive in later phases.
 */

export interface BookingService {
  create(input: CreateBookingInput): Promise<BookingResult>;
  confirm(input: ConfirmBookingInput): Promise<BookingResult>;
  update(input: UpdateBookingInput): Promise<BookingResult>;
  cancel(input: CancelBookingInput): Promise<BookingResult>;
  getById(bookingId: BookingId): Promise<BookingResult | null>;
  list(query: ListBookingsQuery): Promise<BookingResult[]>;
}

export interface AvailabilityService {
  query(query: AvailabilityQuery): Promise<AvailabilityResult>;
}

export interface ResourceService {
  getById(resourceId: ResourceId): Promise<Resource | null>;
  list(): Promise<Resource[]>;
}

export interface WaitlistService {
  join(input: JoinWaitlistInput): Promise<WaitlistResult>;
}
