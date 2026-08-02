/**
 * @motanos/notification — Notification Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/notification
 *
 * Notification = communication intent, business context, and lifecycle state.
 * Domain facts may trigger intents; delivery rails live elsewhere.
 *
 * Must not depend on booking, payment, commerce, community, experience,
 * identity, messaging vendors, or persistence vendors.
 *
 * Distinct from legacy `@motanos/notifications` package scaffolding
 * and from Booking Notification Boundary (opaque intent inside Booking).
 *
 * @see DEC-NOTIFICATION-BOUNDARY-001
 */

export const NOTIFICATION_ENGINE = "@motanos/notification" as const;

export type {
  CreateNotificationInput,
  CreateNotificationOptions,
  Notification,
  NotificationKind,
  NotificationPort,
  NotificationStatus,
} from "./notifications";
export {
  NOTIFICATION_KINDS,
  NOTIFICATION_KIND_VALUES,
  NOTIFICATION_STATUSES,
  NOTIFICATION_STATUS_VALUES,
  createNotification,
  isNotification,
  isNotificationKind,
  isNotificationPort,
  isNotificationStatus,
  resetNotificationReferenceSequence,
} from "./notifications";
