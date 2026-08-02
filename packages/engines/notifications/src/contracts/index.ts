import type { NotificationChannel } from "../domain/channel";
import type {
  ConsumerReference,
  Notification,
  NotificationId,
  RecipientReference,
} from "../domain/notification";
import type { NotificationPreference } from "../domain/preference";
import type { NotificationStatus } from "../types";

/**
 * API-oriented TypeScript contracts for a future Notifications HTTP surface.
 * No route handlers or transport concerns live here.
 */

export interface CreateNotificationInput {
  recipientReference: RecipientReference;
  title: string;
  message: string;
  channel: NotificationChannel;
  status?: NotificationStatus;
  consumerReference?: ConsumerReference;
  scheduledFor?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateNotificationStatusInput {
  notificationId: NotificationId;
  status: NotificationStatus;
  metadata?: Record<string, unknown>;
}

export interface NotificationResult {
  notification: Notification;
}

export interface ListNotificationsQuery {
  recipientReference?: RecipientReference;
  status?: NotificationStatus | NotificationStatus[];
  channel?: NotificationChannel | NotificationChannel[];
  consumerKind?: string;
}

export interface NotificationPreferenceInput {
  recipientReference: RecipientReference;
  channel: NotificationChannel;
  enabled: boolean;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferenceResult {
  preference: NotificationPreference;
}

export interface GetPreferencesQuery {
  recipientReference: RecipientReference;
}
