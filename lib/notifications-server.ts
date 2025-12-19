import { broadcastNotificationToUser } from '@/app/api/notifications/stream/route';
import { createNotification } from './notifications';

/**
 * Create a notification and broadcast it to connected clients via SSE
 */
export async function createAndBroadcastNotification(params: {
  userId: string;
  type: any;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}) {
  // Create notification in database
  const notification = await createNotification(params);

  // Broadcast to connected clients via SSE
  broadcastNotificationToUser(params.userId, notification);

  return notification;
}

