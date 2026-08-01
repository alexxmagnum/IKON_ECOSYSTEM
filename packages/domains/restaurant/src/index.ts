/**
 * @motanos/domain-restaurant — Restaurant Domain Module foundation.
 *
 * MotanOS Core → Shared Engines → Domain Modules → Restaurant
 *
 * Consumes Booking and Payments types. Does not implement those engines.
 * Must not depend on customer branding packages, auth, database, or gateways.
 */

export const RESTAURANT_DOMAIN = "@motanos/domain-restaurant" as const;

export type {
  RestaurantVenue,
  RestaurantVenueId,
  RestaurantZone,
  RestaurantZoneId,
} from "./domain/venue";

export type {
  RestaurantTable,
  RestaurantTableId,
} from "./domain/table";

export type {
  Menu,
  MenuCategory,
  MenuCategoryId,
  MenuId,
} from "./domain/menu";

export type { MenuItem, MenuItemId } from "./domain/product";

export type {
  MenuStatus,
  OrderStatus,
  RestaurantTableStatus,
} from "./types";
export {
  isMenuStatus,
  isOrderStatus,
  isRestaurantTableStatus,
  MENU_STATUSES,
  ORDER_STATUSES,
  RESTAURANT_TABLE_STATUSES,
} from "./types";

export type {
  AttachTableBookingReferenceInput,
  AttachTablePaymentReferenceInput,
  CreateMenuCategoryInput,
  CreateMenuInput,
  CreateMenuItemInput,
  CreateRestaurantTableInput,
  CreateRestaurantVenueInput,
  CreateRestaurantZoneInput,
  ListMenusQuery,
  ListTablesQuery,
  MenuCategoryResult,
  MenuItemResult,
  MenuResult,
  RestaurantTableResult,
  RestaurantVenueResult,
  RestaurantZoneResult,
  UpdateMenuItemInput,
  UpdateRestaurantTableInput,
} from "./contracts";

export type {
  MenuService,
  RestaurantTableService,
  RestaurantVenueService,
} from "./services";
