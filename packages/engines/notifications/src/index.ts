/**
 * @motanos/notifications — Shared Notifications Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/notifications → Domain Modules
 *
 * Independent of domains, auth, database, and external message providers.
 */

export const NOTIFICATION_ENGINE = "@motanos/notifications" as const;

export type {
  ConsumerReference,
  Notification,
  NotificationDelivery,
  NotificationId,
  RecipientReference,
} from "./domain/notification";

export type { NotificationChannel } from "./domain/channel";
export {
  isNotificationChannel,
  NOTIFICATION_CHANNELS,
} from "./domain/channel";

export type {
  NotificationPreference,
  NotificationPreferenceId,
} from "./domain/preference";

export type {
  NotificationEvent,
  NotificationFinalStatus,
  NotificationStatus,
} from "./types";
export {
  canTransitionNotification,
  isNotificationFinal,
  isNotificationStatus,
  NOTIFICATION_EVENTS,
  NOTIFICATION_FINAL_STATUSES,
  NOTIFICATION_STATUSES,
  NOTIFICATION_TRANSITIONS,
} from "./types";

export type {
  CreateNotificationInput,
  GetPreferencesQuery,
  ListNotificationsQuery,
  NotificationPreferenceInput,
  NotificationPreferenceResult,
  NotificationResult,
  UpdateNotificationStatusInput,
} from "./contracts";

export type { NotificationService, PreferenceService } from "./services";
