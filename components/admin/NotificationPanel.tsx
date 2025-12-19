'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, X, Check, CheckCheck } from 'lucide-react';

const formatTime = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

// Client-only time formatter to avoid hydration mismatches
function ClientTimeFormatter({ dateString }: { dateString: string }) {
  const [formattedTime, setFormattedTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFormattedTime(formatTime(dateString));
    
    // Update every minute to keep relative time accurate
    const interval = setInterval(() => {
      setFormattedTime(formatTime(dateString));
    }, 60000);

    return () => clearInterval(interval);
  }, [dateString]);

  // Return empty string during SSR to avoid hydration mismatch
  if (!mounted) {
    return <span className="text-xs text-gray-500">...</span>;
  }

  return <span className="text-xs text-gray-500">{formattedTime}</span>;
}

const getNotificationTypeForUI = (dbType: string): 'info' | 'success' | 'warning' | 'error' => {
  switch (dbType) {
    case 'BOOKING_COMPLETED':
    case 'PAYMENT_PROCESSED':
      return 'success';
    case 'BOOKING_CANCELLED':
    case 'PAYMENT_REFUNDED':
      return 'warning';
    case 'SYSTEM':
      return 'info';
    default:
      return 'info';
  }
};

const mockNotifications: any[] = [
  {
    id: '1',
    title: 'New Booking Request',
    message: 'Sarah Johnson requested a booking for home care service',
    time: '5 minutes ago',
    type: 'info',
    read: false,
  },
  {
    id: '2',
    title: 'Payment Received',
    message: 'Payment of RM 150.00 has been received from booking #12345',
    time: '1 hour ago',
    type: 'success',
    read: false,
  },
  {
    id: '3',
    title: 'Provider Verification',
    message: 'Dr. Ahmed Ali has completed his profile verification',
    time: '2 hours ago',
    type: 'success',
    read: false,
  },
  {
    id: '4',
    title: 'Booking Cancelled',
    message: 'Booking #12340 has been cancelled by the client',
    time: '3 hours ago',
    type: 'warning',
    read: true,
  },
  {
    id: '5',
    title: 'New User Registration',
    message: 'A new provider has registered on the platform',
    time: '5 hours ago',
    type: 'info',
    read: true,
  },
];

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { theme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fetch notifications on mount
  useEffect(() => {
    // Notifications are automatically fetched via SSE hook
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-gray-100/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div
        ref={panelRef}
        className="fixed right-4 top-[72px] sm:right-6 sm:top-20 w-[90vw] sm:w-[400px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col transform transition-all duration-200 opacity-100 translate-y-0"
        style={{ borderColor: theme.border }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b" style={{ background: `linear-gradient(to right, ${theme.sidebar}, ${theme.primaryLight})`, borderColor: theme.border }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-900" />
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[#4FC3F7] text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4 text-gray-700" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/50 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-pink-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      !notification.read ? 'bg-[#4FC3F7]' : 'bg-transparent'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${getTypeColor(getNotificationTypeForUI(notification.type))}`}>
                          {getNotificationTypeForUI(notification.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <ClientTimeFormatter dateString={notification.createdAt} />
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 rounded hover:bg-pink-100 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3 text-gray-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <Link
              href="/admin/notifications"
              onClick={onClose}
              className="block w-full text-sm text-center text-[#4FC3F7] hover:text-[#81D4FA] font-medium transition-colors"
            >
              View All Notifications
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
