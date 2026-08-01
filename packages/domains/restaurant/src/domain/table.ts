import type { BookingId, ResourceId } from "@motanos/booking";
import type { PaymentId } from "@motanos/payments";
import type { RestaurantVenueId, RestaurantZoneId } from "./venue";
import type { RestaurantTableStatus } from "../types";

export type RestaurantTableId = string;

/**
 * Physical dining table.
 * Bookability is owned by Booking via `resourceId` (schema: dining_tables.resource_id).
 */
export interface RestaurantTable {
  id: RestaurantTableId;
  venueId: RestaurantVenueId;
  /** Human-readable identifier (e.g. "T12", "Terraza 3"). */
  name: string;
  capacity: number;
  status?: RestaurantTableStatus;
  zoneId?: RestaurantZoneId;
  /**
   * Bookable resource for this table in the Booking Engine.
   * Restaurant never owns reservation overlap rules.
   */
  resourceId?: ResourceId;
  /**
   * Optional active reservation link — Booking remains source of truth.
   */
  bookingReference?: BookingId;
  /**
   * Optional Payment Engine reference (deposit / check) — no charge logic here.
   */
  paymentReference?: PaymentId;
  metadata?: Record<string, unknown>;
}
