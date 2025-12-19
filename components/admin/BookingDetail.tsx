'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Clock, DollarSign, User, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import type { Booking } from '@/types';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useToast } from '@/contexts/ToastContext';
import { PageLoader } from '@/components/ui/Loader';
import BookingActivityPage from './BookingActivityPage';

export default function BookingDetail({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    action: '',
    title: '',
    message: '',
  });

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    const actions = {
      accept: {
        title: 'Accept Booking',
        message: 'Are you sure you want to accept this booking? Payment will be held until service completion.',
      },
      start: {
        title: 'Start Service',
        message: 'Mark this booking as in progress?',
      },
      complete: {
        title: 'Complete Service',
        message: 'Mark this service as completed? Payment will be ready for processing.',
      },
      cancel: {
        title: 'Cancel Booking',
        message: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      },
    };

    setConfirmDialog({
      isOpen: true,
      action,
      title: actions[action as keyof typeof actions]?.title || 'Confirm Action',
      message: actions[action as keyof typeof actions]?.message || 'Are you sure?',
    });
  };

  const handleConfirmAction = async () => {
    if (!session?.user?.id) {
      toast.showError('Error', 'User session not found');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: confirmDialog.action,
          userId: session.user.id,
        }),
      });
      if (response.ok) {
        toast.showSuccess('Booking updated successfully', 'The booking status has been updated.');
        setConfirmDialog({ isOpen: false, action: '', title: '', message: '' });
        fetchBooking();
      } else {
        const error = await response.json();
        toast.showError('Failed to update booking', error.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.showError('Error', 'Failed to update booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
        <PageLoader message="Loading booking details..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <p className="text-sm sm:text-base text-gray-500">Booking not found</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const styles: { [key: string]: { bg: string; text: string } } = {
      pending: { bg: '#FEF3C7', text: '#92400E' },
      accepted: { bg: '#E9D5FF', text: '#6B21A8' },
      in_progress: { bg: '#DBEAFE', text: '#1E40AF' },
      completed: { bg: '#D1FAE5', text: '#065F46' },
      cancelled: { bg: '#FEE2E2', text: '#991B1B' },
    };
    const style = styles[status] || { bg: '#F3F4F6', text: '#6B7280' };
    return { backgroundColor: style.bg, color: style.text };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Bookings
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Booking #{booking.id.slice(0, 8)}
            </h1>
            <span
              className="inline-block mt-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
              style={getStatusColor(booking.status)}
            >
              {booking.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {booking.status === 'pending' && (
              <button
                onClick={() => handleActionClick('accept')}
                disabled={actionLoading}
                className="px-3 sm:px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#4FC3F7' }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#81D4FA')}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#4FC3F7')}
              >
                <CheckCircle className="w-4 h-4" />
                Accept
              </button>
            )}
            {booking.status === 'accepted' && (
              <button
                onClick={() => handleActionClick('start')}
                disabled={actionLoading}
                className="px-3 sm:px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#66BB6A' }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#81C784')}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#66BB6A')}
              >
                <Clock className="w-4 h-4" />
                Start Service
              </button>
            )}
            {booking.status === 'in_progress' && (
              <button
                onClick={() => handleActionClick('complete')}
                disabled={actionLoading}
                className="px-3 sm:px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#7B1FA2' }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#9C27B0')}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#7B1FA2')}
              >
                <CheckCircle className="w-4 h-4" />
                Complete Service
              </button>
            )}
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <button
                onClick={() => handleActionClick('cancel')}
                disabled={actionLoading}
                className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Client</h3>
              <Link
                href={`/admin/users/${booking.clientId}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <User className="w-4 h-4" />
                {booking.clientId.slice(0, 8)}
              </Link>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Provider</h3>
              <Link
                href={`/admin/users/${booking.providerId}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <User className="w-4 h-4" />
                {booking.providerId.slice(0, 8)}
              </Link>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Date & Time
              </h3>
              <p className="text-gray-900">
                {format(new Date(booking.fromTime), 'MMM dd, yyyy')}
              </p>
              <p className="text-gray-600 text-sm">
                {format(new Date(booking.fromTime), 'hh:mm a')} -{' '}
                {format(new Date(booking.toTime), 'hh:mm a')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h3>
              <p className="text-gray-900">{(booking.location as any)?.address || 'N/A'}</p>
              <p className="text-gray-600 text-sm">
                {(booking.location as any)?.latitude && (booking.location as any)?.longitude
                  ? `${(booking.location as any).latitude}, ${(booking.location as any).longitude}`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Amount
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                RM {booking.quotation.toLocaleString('en-US')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Status</h3>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  booking.paymentStatus === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : booking.paymentStatus === 'held'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {booking.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {booking.paymentId && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href={`/admin/payments/${booking.paymentId}`}
              className="text-blue-600 hover:text-blue-700"
            >
              View Payment Details →
            </Link>
          </div>
        )}
      </div>

      {/* Booking Activity */}
      <div className="mt-6">
        <BookingActivityPage bookingId={bookingId} />
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, action: '', title: '', message: '' })}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.action === 'cancel' ? 'danger' : confirmDialog.action === 'complete' ? 'success' : 'warning'}
        confirmText={
          confirmDialog.action === 'accept' ? 'Accept' :
          confirmDialog.action === 'start' ? 'Start Service' :
          confirmDialog.action === 'complete' ? 'Complete' :
          'Cancel Booking'
        }
        isLoading={actionLoading}
      />
    </div>
  );
}

