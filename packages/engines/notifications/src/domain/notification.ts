import type { NotificationChannel } from "./channel";
import type { NotificationStatus } from "../types";

export type NotificationId = string;

/**
 * Opaque recipient identity (not an auth user model).
 */
export type RecipientReference = string;

/**
 * Opaque link to a consuming aggregate (e.g. a reservation or payment).
 * Notifications never imports consumer domains or engines.
 */
export interface ConsumerReference {
  kind: string;
  id: string;
}

/**
 * Future delivery attempt record — types only, no workers or queues.
 */
export interface NotificationDelivery {
  id: string;
  notificationId: NotificationId;
  channel: NotificationChannel;
  status: NotificationStatus;
  attemptedAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Individual communication in the NOTIFICATION machine.
 */
export interface Notification {
  id: NotificationId;
  recipientReference: RecipientReference;
  title: string;
  message: string;
  status: NotificationStatus;
  channel: NotificationChannel;
  createdAt: string;
  consumerReference?: ConsumerReference;
  /** Optional schedule hint (ISO-8601) when status is Scheduled. */
  scheduledFor?: string;
  metadata?: Record<string, unknown>;
  updatedAt?: string;
}
