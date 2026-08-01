import type {
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
} from "../contracts";
import type { MenuId } from "../domain/menu";
import type { MenuItemId } from "../domain/product";
import type { RestaurantTableId } from "../domain/table";
import type { RestaurantVenueId } from "../domain/venue";

/**
 * Restaurant domain service contracts.
 * Implementations must call Booking / Payment engines for reservations and charges.
 * This package never owns those workflows.
 */

export interface RestaurantVenueService {
  create(input: CreateRestaurantVenueInput): Promise<RestaurantVenueResult>;
  getById(venueId: RestaurantVenueId): Promise<RestaurantVenueResult | null>;
  list(): Promise<RestaurantVenueResult[]>;
  createZone(input: CreateRestaurantZoneInput): Promise<RestaurantZoneResult>;
}

export interface RestaurantTableService {
  create(input: CreateRestaurantTableInput): Promise<RestaurantTableResult>;
  update(input: UpdateRestaurantTableInput): Promise<RestaurantTableResult>;
  attachBookingReference(
    input: AttachTableBookingReferenceInput,
  ): Promise<RestaurantTableResult>;
  attachPaymentReference(
    input: AttachTablePaymentReferenceInput,
  ): Promise<RestaurantTableResult>;
  getById(tableId: RestaurantTableId): Promise<RestaurantTableResult | null>;
  list(query: ListTablesQuery): Promise<RestaurantTableResult[]>;
}

export interface MenuService {
  create(input: CreateMenuInput): Promise<MenuResult>;
  createCategory(input: CreateMenuCategoryInput): Promise<MenuCategoryResult>;
  createItem(input: CreateMenuItemInput): Promise<MenuItemResult>;
  updateItem(input: UpdateMenuItemInput): Promise<MenuItemResult>;
  getMenuById(menuId: MenuId): Promise<MenuResult | null>;
  getItemById(itemId: MenuItemId): Promise<MenuItemResult | null>;
  listMenus(query: ListMenusQuery): Promise<MenuResult[]>;
}
