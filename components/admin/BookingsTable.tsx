'use client';

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { format } from 'date-fns';
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import type { Booking } from '@/types';
import { usePagination } from '@/hooks/usePagination';
import Pagination from './Pagination';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useToast } from '@/contexts/ToastContext';
import { TableLoader } from '@/components/ui/Loader';

interface BookingsTableProps {
  statusFilter?: string;
  searchQuery?: string;
  dateFilter?: string;
}

const BookingsTable = memo(function BookingsTable({ 
  statusFilter = 'all',
  searchQuery = '',
  dateFilter = 'all'
}: BookingsTableProps) {
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    bookingId: string;
    action: string;
  }>({
    isOpen: false,
    bookingId: '',
    action: '',
  });

  const pagination = usePagination({
    initialPage: 1,
    itemsPerPage: 10,
    totalItems,
  });

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
        ...(dateFilter !== 'all' && { dateFilter }),
      });

      const response = await fetch(`/api/admin/bookings?${params}`);
      if (response.ok) {
        const result = await response.json();
        setBookings(result.data || []);
        setTotalItems(result.pagination?.total || 0);
        pagination.setTotalItems(result.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, statusFilter, searchQuery, dateFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Real-time updates: Poll every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchBookings]);

  const handleActionClick = useCallback((bookingId: string, action: string) => {
    setConfirmDialog({
      isOpen: true,
      bookingId,
      action,
    });
    setSelectedBooking(null);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!confirmDialog.bookingId) return;
    
    setActionLoading(confirmDialog.bookingId);
    try {
      const response = await fetch(`/api/admin/bookings/${confirmDialog.bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: confirmDialog.action }),
      });
      if (response.ok) {
        const actionMessages: Record<string, string> = {
          accept: 'accepted',
          start: 'started',
          complete: 'completed',
          cancel: 'cancelled',
        };
        toast.showSuccess(
          'Booking updated',
          `Booking has been ${actionMessages[confirmDialog.action] || 'updated'} successfully.`
        );
        setConfirmDialog({ isOpen: false, bookingId: '', action: '' });
        fetchBookings();
      } else {
        const error = await response.json();
        toast.showError('Failed to update booking', error.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.showError('Error', 'Failed to update booking. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }, [confirmDialog, fetchBookings, toast]);

  const getStatusBadge = useCallback((status: string) => {
    const styles: { [key: string]: { bg: string; text: string } } = {
      pending: { bg: '#FEF3C7', text: '#92400E' },
      accepted: { bg: '#E9D5FF', text: '#6B21A8' },
      in_progress: { bg: '#DBEAFE', text: '#1E40AF' },
      completed: { bg: '#D1FAE5', text: '#065F46' },
      cancelled: { bg: '#FEE2E2', text: '#991B1B' },
    };
    const style = styles[status.toLowerCase()] || { bg: '#F3F4F6', text: '#6B7280' };
    return { backgroundColor: style.bg, color: style.text };
  }, []);

  const handlePageChange = useCallback((page: number) => {
    pagination.setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pagination]);

  if (loading && bookings.length === 0) {
    return <TableLoader rows={5} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client / Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  selectedBooking={selectedBooking}
                  onSelectBooking={setSelectedBooking}
                  onAction={handleActionClick}
                  getStatusBadge={getStatusBadge}
                  actionLoading={actionLoading}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={handlePageChange}
      />

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, bookingId: '', action: '' })}
        onConfirm={handleConfirmAction}
        title={
          confirmDialog.action === 'accept' ? 'Accept Booking' :
          confirmDialog.action === 'start' ? 'Start Service' :
          confirmDialog.action === 'complete' ? 'Complete Service' :
          'Cancel Booking'
        }
        message={
          confirmDialog.action === 'accept'
            ? 'Are you sure you want to accept this booking? Payment will be held until service completion.'
            : confirmDialog.action === 'start'
            ? 'Mark this booking as in progress?'
            : confirmDialog.action === 'complete'
            ? 'Mark this service as completed? Payment will be ready for processing.'
            : 'Are you sure you want to cancel this booking? This action cannot be undone.'
        }
        type={
          confirmDialog.action === 'cancel' ? 'danger' :
          confirmDialog.action === 'complete' ? 'success' :
          'warning'
        }
        confirmText={
          confirmDialog.action === 'accept' ? 'Accept' :
          confirmDialog.action === 'start' ? 'Start Service' :
          confirmDialog.action === 'complete' ? 'Complete' :
          'Cancel Booking'
        }
        isLoading={actionLoading === confirmDialog.bookingId}
      />
    </div>
  );
});

interface BookingRowProps {
  booking: Booking;
  selectedBooking: string | null;
  onSelectBooking: (id: string | null) => void;
  onAction: (id: string, action: string) => void;
  getStatusBadge: (status: string) => { backgroundColor: string; color: string };
  actionLoading?: string | null;
}

const BookingRow = memo(function BookingRow({
  booking,
  selectedBooking,
  onSelectBooking,
  onAction,
  getStatusBadge,
  actionLoading,
}: BookingRowProps) {
  const statusStyle = useMemo(() => getStatusBadge(booking.status || 'pending'), [booking.status, getStatusBadge]);
  const isSelected = selectedBooking === booking.id;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">
          #{booking.id ? booking.id.slice(0, 8) : 'N/A'}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          Client: {booking.client?.name || booking.clientId?.slice(0, 8) || 'N/A'}
        </div>
        <div className="text-sm text-gray-500">
          Provider: {booking.provider?.name || booking.providerId?.slice(0, 8) || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {booking.fromTime ? format(new Date(booking.fromTime), 'MMM dd, yyyy') : 'N/A'}
        </div>
        <div className="text-sm text-gray-500">
          {booking.fromTime && booking.toTime ? (
            <>
              {format(new Date(booking.fromTime), 'hh:mm a')} -{' '}
              {format(new Date(booking.toTime), 'hh:mm a')}
            </>
          ) : (
            'N/A'
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="truncate max-w-xs">
            {(booking.location as any)?.address || 'N/A'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">
          RM {booking.quotation ? booking.quotation.toLocaleString('en-US') : '0'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className="px-2 py-1 text-xs font-medium rounded-full"
          style={statusStyle}
        >
          {booking.status ? booking.status.replace('_', ' ') : 'pending'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            booking.paymentStatus === 'completed'
              ? 'bg-green-100 text-green-800'
              : booking.paymentStatus === 'held'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {booking.paymentStatus || 'pending'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/bookings/${booking.id}`}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="w-5 h-5" />
          </Link>
          <div className="relative">
            <button
              onClick={() =>
                onSelectBooking(isSelected ? null : booking.id)
              }
              className="text-gray-600 hover:text-gray-900"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {isSelected && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => onAction(booking.id, 'accept')}
                      disabled={actionLoading === booking.id}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </button>
                  )}
                  {booking.status === 'accepted' && (
                    <button
                      onClick={() => onAction(booking.id, 'start')}
                      disabled={actionLoading === booking.id}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Clock className="w-4 h-4" />
                      Start
                    </button>
                  )}
                  {booking.status === 'in_progress' && (
                    <button
                      onClick={() => onAction(booking.id, 'complete')}
                      disabled={actionLoading === booking.id}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </button>
                  )}
                  {booking.status !== 'cancelled' &&
                    booking.status !== 'completed' && (
                      <button
                        onClick={() => onAction(booking.id, 'cancel')}
                        disabled={actionLoading === booking.id}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
});

export default BookingsTable;
