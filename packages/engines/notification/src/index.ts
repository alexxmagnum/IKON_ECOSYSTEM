/**
 * @motanos/notification — Notification Engine Boundary foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/notification
 *
 * Notification = communication existence for a business context.
 * Must not depend on messaging vendors, outbound rails, content packages,
 * template packages, process packages, or persistence vendors.
 *
 * Distinct from legacy `@motanos/notifications` package scaffolding.
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
