'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Check, CheckCheck, Filter, Search } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  date: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Booking Request',
    message: 'Sarah Johnson requested a booking for home care service',
    time: '5 minutes ago',
    date: 'Today',
    type: 'info',
    read: false,
  },
  {
    id: '2',
    title: 'Payment Received',
    message: 'Payment of RM 150.00 has been received from booking #12345',
    time: '1 hour ago',
    date: 'Today',
    type: 'success',
    read: false,
  },
  {
    id: '3',
    title: 'Provider Verification',
    message: 'Dr. Ahmed Ali has completed his profile verification',
    time: '2 hours ago',
    date: 'Today',
    type: 'success',
    read: false,
  },
  {
    id: '4',
    title: 'Booking Cancelled',
    message: 'Booking #12340 has been cancelled by the client',
    time: '3 hours ago',
    date: 'Today',
    type: 'warning',
    read: true,
  },
  {
    id: '5',
    title: 'New User Registration',
    message: 'A new provider has registered on the platform',
    time: '5 hours ago',
    date: 'Today',
    type: 'info',
    read: true,
  },
  {
    id: '6',
    title: 'Payment Processing',
    message: 'Payment of RM 300.00 is being processed for booking #12338',
    time: 'Yesterday',
    date: 'Yesterday',
    type: 'info',
    read: true,
  },
  {
    id: '7',
    title: 'Service Completed',
    message: 'Booking #12335 has been marked as completed by the provider',
    time: 'Yesterday',
    date: 'Yesterday',
    type: 'success',
    read: true,
  },
  {
    id: '8',
    title: 'Dispute Reported',
    message: 'A dispute has been reported for booking #12330',
    time: '2 days ago',
    date: '2 days ago',
    type: 'error',
    read: true,
  },
  {
    id: '9',
    title: 'Review Submitted',
    message: 'A new review has been submitted for booking #12325',
    time: '3 days ago',
    date: '3 days ago',
    type: 'info',
    read: true,
  },
  {
    id: '10',
    title: 'Monthly Report Ready',
    message: 'Your monthly revenue report for December is ready',
    time: '1 week ago',
    date: '1 week ago',
    type: 'info',
    read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read);
    
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || notification.type === selectedType;

    return matchesFilter && matchesSearch && matchesType;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    const date = notification.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="w-6 h-6 sm:w-7 sm:h-7 text-[#4FC3F7]" />
              Notifications
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-[#4FC3F7] text-white rounded-lg hover:bg-[#81D4FA] transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BBD0] focus:border-transparent"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors relative ${
                filter === 'unread'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-[#4FC3F7] text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Read
            </button>
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F8BBD0] focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery || filter !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'You\'re all caught up! No notifications to display.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {date}
                  </h3>
                </div>

                {/* Notifications for this date */}
                {dateNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 sm:p-6 hover:bg-pink-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Indicator */}
                      <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
                        !notification.read ? 'bg-[#4FC3F7]' : 'bg-transparent'
                      }`} />

                      {/* Type Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${getTypeColor(notification.type)}`}>
                        <span className="text-sm font-bold">{getTypeIcon(notification.type)}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-gray-900 mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getTypeColor(notification.type)}`}>
                              {notification.type}
                            </span>
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-2 rounded-lg hover:bg-pink-100 transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4 text-gray-500" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
