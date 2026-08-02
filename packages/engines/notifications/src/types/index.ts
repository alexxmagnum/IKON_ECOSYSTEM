/**
 * NOTIFICATION lifecycle from docs/rules/state-machines.md §7
 * and docs/49_NOTIFICATION_ENGINE.md.
 */

/** Canonical NOTIFICATION machine statuses. */
export const NOTIFICATION_STATUSES = [
  "Pending",
  "Scheduled",
  "Sent",
  "Delivered",
  "Read",
  "Failed",
  "Expired",
] as const;

export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export const NOTIFICATION_FINAL_STATUSES = [
  "Read",
  "Failed",
  "Expired",
] as const satisfies readonly NotificationStatus[];

export type NotificationFinalStatus =
  (typeof NOTIFICATION_FINAL_STATUSES)[number];

/** Canonical NOTIFICATION transition events (state-machines.md). */
export const NOTIFICATION_EVENTS = [
  "notification.scheduled",
  "notification.sent",
  "notification.suppressed",
  "notification.send_failed",
  "notification.expired",
  "notification.cancelled",
  "notification.delivered",
  "notification.delivery_failed",
  "notification.read",
] as const;

export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number];

export const NOTIFICATION_TRANSITIONS: ReadonlyArray<{
  from: NotificationStatus;
  to: NotificationStatus;
  event: NotificationEvent;
}> = [
  { from: "Pending", to: "Scheduled", event: "notification.scheduled" },
  { from: "Pending", to: "Sent", event: "notification.sent" },
  { from: "Pending", to: "Expired", event: "notification.suppressed" },
  { from: "Pending", to: "Failed", event: "notification.send_failed" },
  { from: "Scheduled", to: "Sent", event: "notification.sent" },
  { from: "Scheduled", to: "Expired", event: "notification.expired" },
  { from: "Scheduled", to: "Expired", event: "notification.cancelled" },
  { from: "Scheduled", to: "Failed", event: "notification.send_failed" },
  { from: "Sent", to: "Delivered", event: "notification.delivered" },
  { from: "Sent", to: "Failed", event: "notification.delivery_failed" },
  { from: "Sent", to: "Expired", event: "notification.expired" },
  { from: "Delivered", to: "Read", event: "notification.read" },
  { from: "Delivered", to: "Expired", event: "notification.expired" },
];

export function isNotificationStatus(
  value: string,
): value is NotificationStatus {
  return (NOTIFICATION_STATUSES as readonly string[]).includes(value);
}

export function isNotificationFinal(status: NotificationStatus): boolean {
  return (NOTIFICATION_FINAL_STATUSES as readonly NotificationStatus[]).includes(
    status,
  );
}

export function canTransitionNotification(
  from: NotificationStatus,
  to: NotificationStatus,
  event: NotificationEvent,
): boolean {
  if (isNotificationFinal(from)) {
    return false;
  }
  return NOTIFICATION_TRANSITIONS.some(
    (edge) => edge.from === from && edge.to === to && edge.event === event,
  );
}
