'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Clock, User, Activity } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { TableLoader } from '@/components/ui/Loader';
import Link from 'next/link';

interface BookingActivity {
  id: string;
  bookingId: string;
  userId: string;
  action: string;
  description?: string;
  metadata?: any;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
}

interface BookingActivityPageProps {
  bookingId?: string;
}

export default function BookingActivityPage({ bookingId }: BookingActivityPageProps) {
  const toast = useToast();
  const [activities, setActivities] = useState<BookingActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const url = bookingId
        ? `/api/admin/bookings/${bookingId}/activity`
        : '/api/admin/bookings/activity';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      } else {
        toast.showError('Error', 'Failed to fetch booking activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.showError('Error', 'Failed to fetch booking activities');
    } finally {
      setLoading(false);
    }
  }, [bookingId, toast]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('created')) return 'bg-[#E1F5FE] text-[#0277BD]';
    if (actionLower.includes('accepted')) return 'bg-[#C8E6C9] text-[#2E7D32]';
    if (actionLower.includes('cancelled')) return 'bg-[#FFCDD2] text-[#C62828]';
    if (actionLower.includes('completed')) return 'bg-[#E1BEE7] text-[#7B1FA2]';
    if (actionLower.includes('status')) return 'bg-[#FFF9C4] text-[#F57F17]';
    return 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (role: string) => {
    const roleColors: { [key: string]: string } = {
      ADMIN: 'bg-[#E1BEE7] text-[#7B1FA2]',
      PROVIDER: 'bg-[#E1F5FE] text-[#0277BD]',
      CLIENT: 'bg-[#C8E6C9] text-[#2E7D32]',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  const formatMetadata = (metadata: any) => {
    if (!metadata || typeof metadata !== 'object') return null;

    const formatKey = (key: string) => {
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    };

    const formatValue = (value: any): string => {
      if (value === null || value === undefined) return 'N/A';
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'string') {
        // Capitalize status values
        return value
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
      return String(value);
    };

    return Object.entries(metadata).map(([key, value]) => ({
      label: formatKey(key),
      value: formatValue(value),
    }));
  };

  if (loading) {
    return <TableLoader rows={5} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#E1F5FE' }}>
            <Activity className="w-5 h-5" style={{ color: '#4FC3F7' }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Booking Activity</h3>
            <p className="text-sm text-gray-600">Track all activities related to bookings</p>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No activities found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(
                          activity.action
                        )}`}
                      >
                        {activity.action.replace('_', ' ').toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(
                          activity.user.role
                        )}`}
                      >
                        {activity.user.role}
                      </span>
                    </div>

                    {activity.description && (
                      <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{activity.user.name || activity.user.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                      {!bookingId && (
                        <Link
                          href={`/admin/bookings/${activity.bookingId}`}
                          className="transition-colors"
                          style={{ color: '#4FC3F7' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#0277BD'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#4FC3F7'}
                        >
                          View Booking
                        </Link>
                      )}
                    </div>

                    {(() => {
                      const formattedMetadata = formatMetadata(activity.metadata);
                      return formattedMetadata && formattedMetadata.length > 0 ? (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="space-y-2">
                            {formattedMetadata.map((item, index) => (
                              <div key={index} className="flex items-center gap-2 text-xs">
                                <span className="font-medium text-gray-700 min-w-[100px]">
                                  {item.label}:
                                </span>
                                <span className="text-gray-600">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

