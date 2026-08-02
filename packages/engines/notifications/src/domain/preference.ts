import type { NotificationChannel } from "./channel";
import type { RecipientReference } from "./notification";

export type NotificationPreferenceId = string;

/**
 * Per-recipient channel preference.
 * Recipient remains opaque — no Member/Auth coupling.
 */
export interface NotificationPreference {
  id?: NotificationPreferenceId;
  recipientReference: RecipientReference;
  channel: NotificationChannel;
  enabled: boolean;
  metadata?: Record<string, unknown>;
  updatedAt?: string;
}
