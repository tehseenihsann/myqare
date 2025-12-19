import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatNotificationForSSE } from '@/lib/notifications';

// Store active SSE connections
const connections = new Map<string, ReadableStreamDefaultController[]>();

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to the map
      if (!connections.has(userId)) {
        connections.set(userId, []);
      }
      connections.get(userId)!.push(controller);

      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: 'connected', message: 'Connected to notification stream' })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));

      // Send any unread notifications immediately
      prisma.notification.findMany({
        where: {
          userId,
          read: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }).then((notifications) => {
        notifications.forEach((notification) => {
          const formatted = formatNotificationForSSE(notification);
          const data = `data: ${JSON.stringify({ type: 'notification', notification: formatted })}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));
        });
      });

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        const userConnections = connections.get(userId);
        if (userConnections) {
          const index = userConnections.indexOf(controller);
          if (index > -1) {
            userConnections.splice(index, 1);
          }
          if (userConnections.length === 0) {
            connections.delete(userId);
          }
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
    },
  });
}

// Helper function to broadcast notification to a user's connections
export function broadcastNotificationToUser(userId: string, notification: any) {
  const userConnections = connections.get(userId);
  if (userConnections) {
    const formatted = formatNotificationForSSE(notification);
    const data = `data: ${JSON.stringify({ type: 'notification', notification: formatted })}\n\n`;
    const encoded = new TextEncoder().encode(data);

    // Send to all connections for this user
    userConnections.forEach((controller) => {
      try {
        controller.enqueue(encoded);
      } catch (error) {
        console.error('Error sending notification to client:', error);
      }
    });
  }
}

