import { db } from '@/mocks/db';
import { uid } from '@/mocks/helpers';
import type { AppNotification } from '@/types/models';

/** Server-side side effect: push an in-app notification to a user. */
export function notify(userId: string, n: Omit<AppNotification, 'id' | 'userId' | 'read' | 'createdAt'>) {
  db.notifications.unshift({ ...n, id: uid('nt'), userId, read: false, createdAt: new Date().toISOString() });
}

export function providerUserId(providerId: string) {
  return db.providers.find((p) => p.id === providerId)?.userId;
}

export function adminIds() {
  return db.users.filter((u) => u.role === 'admin').map((u) => u.id);
}
