import type {
  CreateNotificationInput,
  GetPreferencesQuery,
  ListNotificationsQuery,
  NotificationPreferenceInput,
  NotificationPreferenceResult,
  NotificationResult,
  UpdateNotificationStatusInput,
} from "../contracts";
import type { NotificationId } from "../domain/notification";

/**
 * Service contracts for the Notifications Engine.
 * Implementations (providers, queues, persistence) arrive in later phases.
 */

export interface NotificationService {
  create(input: CreateNotificationInput): Promise<NotificationResult>;
  updateStatus(input: UpdateNotificationStatusInput): Promise<NotificationResult>;
  get(notificationId: NotificationId): Promise<NotificationResult | null>;
  list(query: ListNotificationsQuery): Promise<NotificationResult[]>;
}

export interface PreferenceService {
  updatePreference(
    input: NotificationPreferenceInput,
  ): Promise<NotificationPreferenceResult>;
  getPreferences(
    query: GetPreferencesQuery,
  ): Promise<NotificationPreferenceResult[]>;
}
