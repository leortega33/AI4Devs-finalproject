export type NotificationType = 'payment_overdue' | 'payment_due_soon' | 'routine_expiring';

/** Records reminder sends to deduplicate per client, type, and reference key (US-024). */
export interface NotificationLogRepository {
  exists(clientId: number, type: NotificationType, referenceKey: string): Promise<boolean>;
  record(clientId: number, type: NotificationType, referenceKey: string): Promise<void>;
}
