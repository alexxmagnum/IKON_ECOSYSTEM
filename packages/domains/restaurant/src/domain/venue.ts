export type RestaurantVenueId = string;
export type RestaurantZoneId = string;

/**
 * Gastronomic venue / space (maps to `restaurants` in the data model).
 * Reservation and payment state live in shared engines, not here.
 */
export interface RestaurantVenue {
  id: RestaurantVenueId;
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Optional zoning within a venue (terrace, private room, main floor, …).
 */
export interface RestaurantZone {
  id: RestaurantZoneId;
  venueId: RestaurantVenueId;
  name: string;
  metadata?: Record<string, unknown>;
}
