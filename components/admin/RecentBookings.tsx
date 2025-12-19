'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Booking } from '@/types';

export default function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentBookings();
  }, []);

  const fetchRecentBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings?page=1&limit=5');
      if (response.ok) {
        const result = await response.json();
        setBookings(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || '';
    switch (normalizedStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || '';
    switch (normalizedStatus) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Ensure bookings is always an array
  const bookingsArray = Array.isArray(bookings) ? bookings : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">Latest booking activities</p>
        </div>
        <Link
          href="/admin/bookings"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="space-y-4">
        {bookingsArray.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bookings found</p>
        ) : (
          bookingsArray.map((booking) => (
            <Link
              key={booking.id}
              href={`/admin/bookings/${booking.id}`}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatusColor(booking.status)}`}
                  >
                    {getStatusIcon(booking.status)}
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  Booking #{booking.id.slice(0, 8)}
                </p>
                <p className="text-xs text-gray-500">
                  {booking.fromTime ? format(new Date(booking.fromTime), 'MMM dd, yyyy') : 'N/A'} • RM{' '}
                  <span className="font-medium text-gray-700">
                    {booking.quotation ? booking.quotation.toLocaleString('en-US') : '0'}
                  </span>
                </p>
              </div>
              <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

