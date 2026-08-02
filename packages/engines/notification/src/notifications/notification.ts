/**
 * Notification Engine Boundary — communication intent / business context / lifecycle
 * (not messaging vendors, delivery rails, templates, or physical delivery).
 *
 * Distinct from legacy `@motanos/notifications` package scaffolding.
 *
 * @see DEC-NOTIFICATION-BOUNDARY-001
 * @see DEC-PAYMENT-BOUNDARY-001
 */

/** Internal notification kinds — not channel catalogs. */
export const NOTIFICATION_KINDS = {
  /** Important business alert. */
  Alert: "notification.alert",
  /** Activity / time reminder. */
  Reminder: "notification.reminder",
  /** Confirmation of a business action. */
  Confirmation: "notification.confirmation",
  /** Invitation into a community or experience. */
  Invitation: "notification.invitation",
  /** Informational update. */
  Update: "notification.update",
  /**
   * Notification initiated by a Notification system operation.
   * Not a technical infrastructure error.
   */
  Operational: "notification.operational",
} as const;

export type NotificationKind =
  (typeof NOTIFICATION_KINDS)[keyof typeof NOTIFICATION_KINDS];

export const NOTIFICATION_KIND_VALUES = Object.values(
  NOTIFICATION_KINDS,
) as readonly NotificationKind[];

/** Notification intent status — not vendor delivery state. */
export const NOTIFICATION_STATUSES = {
  Draft: "draft",
  Pending: "pending",
  Scheduled: "scheduled",
  Sent: "sent",
  Failed: "failed",
  Cancelled: "cancelled",
} as const;

export type NotificationStatus =
  (typeof NOTIFICATION_STATUSES)[keyof typeof NOTIFICATION_STATUSES];

export const NOTIFICATION_STATUS_VALUES = Object.values(
  NOTIFICATION_STATUSES,
) as readonly NotificationStatus[];

/**
 * Opaque notification intent — need to communicate and lifecycle only.
 * No recipient addresses, credential material, or vendor session fields.
 */
export interface Notification {
  /** Opaque unique notification reference. */
  notificationReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal notification kind. */
  notificationKind: NotificationKind;
  /** Notification intent status. */
  notificationStatus: NotificationStatus;
  /** Opaque actor when known — not a live identity profile. */
  actorReference?: string;
  /** Opaque booking pointer — not a live reservation graph. */
  bookingReference?: string;
  /** Opaque payment pointer — not a live payment graph. */
  paymentReference?: string;
  /** Opaque membership pointer — not a live membership graph. */
  membershipReference?: string;
  /** Opaque community pointer — not a live group graph. */
  communityReference?: string;
  /** Opaque experience pointer — not a live offering graph. */
  experienceReference?: string;
  /** Opaque channel pointer — not a live delivery rail. */
  channelReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future notification adapters (Runtime).
 * Not wired in this foundation — no deliver, dispatch, or vendor sends.
 */
export interface NotificationPort {
  createNotification(input: CreateNotificationInput): Promise<Notification>;
  resolveNotification(notification: Notification): Promise<Notification>;
}

export interface CreateNotificationInput {
  tenantReference: string;
  notificationKind: NotificationKind;
  notificationStatus?: NotificationStatus;
  notificationReference?: string;
  actorReference?: string;
  bookingReference?: string;
  paymentReference?: string;
  membershipReference?: string;
  communityReference?: string;
  experienceReference?: string;
  channelReference?: string;
  metadata?: Record<string, unknown>;
}

export function isNotificationKind(value: string): value is NotificationKind {
  return (NOTIFICATION_KIND_VALUES as readonly string[]).includes(value);
}

export function isNotificationStatus(
  value: string,
): value is NotificationStatus {
  return (NOTIFICATION_STATUS_VALUES as readonly string[]).includes(value);
}

export function isNotification(value: unknown): value is Notification {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const bookingOk =
    candidate.bookingReference === undefined ||
    (typeof candidate.bookingReference === "string" &&
      candidate.bookingReference.length > 0);
  const paymentOk =
    candidate.paymentReference === undefined ||
    (typeof candidate.paymentReference === "string" &&
      candidate.paymentReference.length > 0);
  const membershipOk =
    candidate.membershipReference === undefined ||
    (typeof candidate.membershipReference === "string" &&
      candidate.membershipReference.length > 0);
  const communityOk =
    candidate.communityReference === undefined ||
    (typeof candidate.communityReference === "string" &&
      candidate.communityReference.length > 0);
  const experienceOk =
    candidate.experienceReference === undefined ||
    (typeof candidate.experienceReference === "string" &&
      candidate.experienceReference.length > 0);
  const channelOk =
    candidate.channelReference === undefined ||
    (typeof candidate.channelReference === "string" &&
      candidate.channelReference.length > 0);
  return (
    typeof candidate.notificationReference === "string" &&
    candidate.notificationReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    actorOk &&
    bookingOk &&
    paymentOk &&
    membershipOk &&
    communityOk &&
    experienceOk &&
    channelOk &&
    typeof candidate.notificationKind === "string" &&
    isNotificationKind(candidate.notificationKind) &&
    typeof candidate.notificationStatus === "string" &&
    isNotificationStatus(candidate.notificationStatus)
  );
}

export function isNotificationPort(value: unknown): value is NotificationPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as NotificationPort).createNotification === "function" &&
    typeof (value as NotificationPort).resolveNotification === "function"
  );
}
