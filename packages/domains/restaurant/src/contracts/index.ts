import type { BookingId, ResourceId } from "@motanos/booking";
import type { Money, PaymentId } from "@motanos/payments";
import type {
  Menu,
  MenuCategory,
  MenuCategoryId,
  MenuId,
} from "../domain/menu";
import type { MenuItem, MenuItemId } from "../domain/product";
import type {
  RestaurantTable,
  RestaurantTableId,
} from "../domain/table";
import type {
  RestaurantVenue,
  RestaurantVenueId,
  RestaurantZone,
  RestaurantZoneId,
} from "../domain/venue";
import type { MenuStatus, RestaurantTableStatus } from "../types";

/**
 * API-oriented TypeScript contracts for a future Restaurant domain surface.
 * No route handlers. Reservation/payment mutations belong to their engines.
 */

export interface CreateRestaurantVenueInput {
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateRestaurantZoneInput {
  venueId: RestaurantVenueId;
  name: string;
  metadata?: Record<string, unknown>;
}

export interface CreateRestaurantTableInput {
  venueId: RestaurantVenueId;
  name: string;
  capacity: number;
  zoneId?: RestaurantZoneId;
  resourceId?: ResourceId;
  status?: RestaurantTableStatus;
  metadata?: Record<string, unknown>;
}

export interface UpdateRestaurantTableInput {
  tableId: RestaurantTableId;
  name?: string;
  capacity?: number;
  zoneId?: RestaurantZoneId;
  resourceId?: ResourceId;
  status?: RestaurantTableStatus;
  metadata?: Record<string, unknown>;
}

export interface AttachTableBookingReferenceInput {
  tableId: RestaurantTableId;
  bookingReference: BookingId;
}

export interface AttachTablePaymentReferenceInput {
  tableId: RestaurantTableId;
  paymentReference: PaymentId;
}

export interface CreateMenuInput {
  venueId: RestaurantVenueId;
  name: string;
  status?: MenuStatus;
  validFrom?: string;
  validTo?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateMenuCategoryInput {
  menuId: MenuId;
  name: string;
  sortOrder?: number;
  metadata?: Record<string, unknown>;
}

export interface CreateMenuItemInput {
  categoryId: MenuCategoryId;
  name: string;
  description?: string;
  price: Money;
  available?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateMenuItemInput {
  itemId: MenuItemId;
  name?: string;
  description?: string;
  price?: Money;
  available?: boolean;
  metadata?: Record<string, unknown>;
}

export interface RestaurantVenueResult {
  venue: RestaurantVenue;
}

export interface RestaurantZoneResult {
  zone: RestaurantZone;
}

export interface RestaurantTableResult {
  table: RestaurantTable;
}

export interface MenuResult {
  menu: Menu;
}

export interface MenuCategoryResult {
  category: MenuCategory;
}

export interface MenuItemResult {
  item: MenuItem;
}

export interface ListMenusQuery {
  venueId?: RestaurantVenueId;
  status?: MenuStatus | MenuStatus[];
}

export interface ListTablesQuery {
  venueId?: RestaurantVenueId;
  zoneId?: RestaurantZoneId;
  status?: RestaurantTableStatus | RestaurantTableStatus[];
  resourceId?: ResourceId;
}
