/**
 * Delivery media for the Notification Engine (docs/49_NOTIFICATION_ENGINE).
 * No provider SDKs or transport implementations in this foundation.
 */
export const NOTIFICATION_CHANNELS = [
  "InApp",
  "Email",
  "Push",
  "SMS",
  "WhatsApp",
] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export function isNotificationChannel(
  value: string,
): value is NotificationChannel {
  return (NOTIFICATION_CHANNELS as readonly string[]).includes(value);
}
