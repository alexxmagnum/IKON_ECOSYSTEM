/**
 * Notification Engine Boundary — communication-existence / context / lifecycle
 * (not messaging vendors, outbound rails, reusable layouts, or transport runners).
 *
 * Distinct from legacy `@motanos/notifications` package scaffolding.
 *
 * @see DEC-NOTIFICATION-BOUNDARY-001
 */

/** Internal notification kinds — not channel or vendor catalogs. */
export const NOTIFICATION_KINDS = {
  /** General communication record. */
  Communication: "notification.communication",
  /** Platform / system communication. */
  System: "notification.system",
  /**
   * Notification initiated by a Notification system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "notification.operational",
  /** Commercial / business communication. */
  Business: "notification.business",
  /** Event-linked communication. */
  Event: "notification.event",
  /** Alert-style communication. */
  Alert: "notification.alert",
} as const;

export type NotificationKind =
  (typeof NOTIFICATION_KINDS)[keyof typeof NOTIFICATION_KINDS];

export const NOTIFICATION_KIND_VALUES = Object.values(
  NOTIFICATION_KINDS,
) as readonly NotificationKind[];

/** Notification status — not outbound-rail transport state. */
export const NOTIFICATION_STATUSES = {
  Draft: "draft",
  Pending: "pending",
  Active: "active",
  Dispatched: "sent",
  Failed: "failed",
  Cancelled: "cancelled",
  Archived: "archived",
} as const;

export type NotificationStatus =
  (typeof NOTIFICATION_STATUSES)[keyof typeof NOTIFICATION_STATUSES];

export const NOTIFICATION_STATUS_VALUES = Object.values(
  NOTIFICATION_STATUSES,
) as readonly NotificationStatus[];

/**
 * Opaque notification — communication existence only.
 * No recipient addresses, credential material, or vendor session fields.
 */
export type Notification = {
  /** Opaque unique notification reference. */
  notificationReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal notification kind. */
  notificationKind: NotificationKind;
  /** Notification status. */
  notificationStatus: NotificationStatus;
  /** Opaque actor pointer when known — not a live person profile. */
  actorReference?: string;
  /** Opaque customer pointer when known. */
  customerReference?: string;
  /** Opaque member pointer when known. */
  memberReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque content pointer when known. */
  contentReference?: string;
  /** Opaque template pointer when known — not a live render layout. */
  templateReference?: string;
  /** Opaque channel pointer when known — not a live outbound rail. */
  channelReference?: string;
  /** Opaque parent notification pointer when nested. */
  parentNotificationReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future notification adapters (Runtime).
 * Not wired in this foundation — no handoff, dispatch, or vendor rails.
 */
export interface NotificationPort {
  createNotification(input: CreateNotificationInput): Promise<Notification>;
  resolveNotification(notification: Notification): Promise<Notification>;
}

export type CreateNotificationInput = {
  tenantReference: string;
  notificationKind: NotificationKind;
  notificationStatus?: NotificationStatus;
  notificationReference?: string;
  actorReference?: string;
  customerReference?: string;
  memberReference?: string;
  contextReference?: string;
  contentReference?: string;
  templateReference?: string;
  channelReference?: string;
  parentNotificationReference?: string;
  metadata?: Record<string, unknown>;
};

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
  const customerOk =
    candidate.customerReference === undefined ||
    (typeof candidate.customerReference === "string" &&
      candidate.customerReference.length > 0);
  const memberOk =
    candidate.memberReference === undefined ||
    (typeof candidate.memberReference === "string" &&
      candidate.memberReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const contentOk =
    candidate.contentReference === undefined ||
    (typeof candidate.contentReference === "string" &&
      candidate.contentReference.length > 0);
  const templateOk =
    candidate.templateReference === undefined ||
    (typeof candidate.templateReference === "string" &&
      candidate.templateReference.length > 0);
  const channelOk =
    candidate.channelReference === undefined ||
    (typeof candidate.channelReference === "string" &&
      candidate.channelReference.length > 0);
  const parentOk =
    candidate.parentNotificationReference === undefined ||
    (typeof candidate.parentNotificationReference === "string" &&
      candidate.parentNotificationReference.length > 0);
  return (
    typeof candidate.notificationReference === "string" &&
    candidate.notificationReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    actorOk &&
    customerOk &&
    memberOk &&
    contextOk &&
    contentOk &&
    templateOk &&
    channelOk &&
    parentOk &&
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
