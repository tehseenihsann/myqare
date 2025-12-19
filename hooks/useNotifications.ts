'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  metadata?: any;
}

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Connect to SSE endpoint
    const eventSource = new EventSource('/api/notifications/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'notification') {
          const notification = data.notification;
          setNotifications((prev) => {
            // Avoid duplicates
            if (prev.some((n) => n.id === notification.id)) {
              return prev;
            }
            return [notification, ...prev];
          });

          if (!notification.read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      // EventSource will automatically reconnect
    };

    eventSourceRef.current = eventSource;

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [session]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}

