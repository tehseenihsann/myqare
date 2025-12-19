import { prisma } from './prisma';
import { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        metadata: params.metadata || {},
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Helper to format notification for SSE
export function formatNotificationForSSE(notification: any) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    link: notification.link,
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
    metadata: notification.metadata,
  };
}
