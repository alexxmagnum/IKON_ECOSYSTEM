export type EventCategoryId = string;

/**
 * Classification for events.
 * Names are free-form (e.g. sport, gastronomy, social) — not a fixed enum.
 */
export interface EventCategory {
  id: EventCategoryId;
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
}
