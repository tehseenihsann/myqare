'use client';

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { format } from 'date-fns';
import { Eye, CheckCircle, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';
import type { Payment } from '@/types';
import { usePagination } from '@/hooks/usePagination';
import Pagination from './Pagination';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useToast } from '@/contexts/ToastContext';
import { TableLoader } from '@/components/ui/Loader';

interface PaymentsTableProps {
  statusFilter?: string;
  searchQuery?: string;
}

const PaymentsTable = memo(function PaymentsTable({ 
  statusFilter = 'all',
  searchQuery = ''
}: PaymentsTableProps) {
  const toast = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    paymentId: string;
  }>({
    isOpen: false,
    paymentId: '',
  });

  const pagination = usePagination({
    initialPage: 1,
    itemsPerPage: 10,
    totalItems,
  });

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/admin/payments?${params}`);
      if (response.ok) {
        const result = await response.json();
        setPayments(result.data || []);
        setTotalItems(result.pagination?.total || 0);
        pagination.setTotalItems(result.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, statusFilter, searchQuery]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Real-time updates: Poll every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPayments();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchPayments]);

  const handleProcessPayoutClick = useCallback((paymentId: string) => {
    setConfirmDialog({
      isOpen: true,
      paymentId,
    });
  }, []);

  const handleProcessPayout = useCallback(async () => {
    if (!confirmDialog.paymentId) return;
    
    setActionLoading(confirmDialog.paymentId);
    try {
      const response = await fetch(`/api/admin/payments/${confirmDialog.paymentId}/process`, {
        method: 'POST',
      });
      if (response.ok) {
        toast.showSuccess('Payout processed', 'The payout has been successfully processed.');
        setConfirmDialog({ isOpen: false, paymentId: '' });
        fetchPayments();
      } else {
        const error = await response.json();
        toast.showError('Failed to process payout', error.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      toast.showError('Error', 'Failed to process payout. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }, [confirmDialog, fetchPayments, toast]);

  const getStatusBadge = useCallback((status: string) => {
    const styles: { [key: string]: { bg: string; text: string } } = {
      held: { bg: '#FEF3C7', text: '#92400E' },
      processing: { bg: '#DBEAFE', text: '#1E40AF' },
      completed: { bg: '#D1FAE5', text: '#065F46' },
      refunded: { bg: '#FEE2E2', text: '#991B1B' },
    };
    const style = styles[status.toLowerCase()] || { bg: '#F3F4F6', text: '#6B7280' };
    return { backgroundColor: style.bg, color: style.text };
  }, []);

  const handlePageChange = useCallback((page: number) => {
    pagination.setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pagination]);

  if (loading && payments.length === 0) {
    return <TableLoader rows={5} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform Fee (30%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider Payout
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  onProcessPayout={handleProcessPayoutClick}
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
        onClose={() => setConfirmDialog({ isOpen: false, paymentId: '' })}
        onConfirm={handleProcessPayout}
        title="Process Payout"
        message="Are you sure you want to process this payout? The provider will receive their payment and this action cannot be undone."
        type="warning"
        confirmText="Process Payout"
        isLoading={actionLoading === confirmDialog.paymentId}
      />
    </div>
  );
});

interface PaymentRowProps {
  payment: Payment;
  onProcessPayout: (id: string) => void;
  getStatusBadge: (status: string) => { backgroundColor: string; color: string };
  actionLoading?: string | null;
}

const PaymentRow = memo(function PaymentRow({
  payment,
  onProcessPayout,
  getStatusBadge,
  actionLoading,
}: PaymentRowProps) {
  const statusStyle = useMemo(() => getStatusBadge(payment.status), [payment.status, getStatusBadge]);
  const heldAtDate = useMemo(() => payment.heldAt ? new Date(payment.heldAt) : new Date(), [payment.heldAt]);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">
          #{payment.id.slice(0, 8)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Link
          href={`/admin/bookings/${payment.bookingId}`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          #{payment.bookingId.slice(0, 8)}
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">
          RM {payment.amount.toLocaleString('en-US')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">
          RM {payment.platformFee.toLocaleString('en-US')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">
          RM {payment.providerPayout.toLocaleString('en-US')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className="px-2 py-1 text-xs font-medium rounded-full"
          style={statusStyle}
        >
          {payment.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {format(heldAtDate, 'MMM dd, yyyy')}
        </div>
        <div className="text-sm text-gray-500">
          {format(heldAtDate, 'hh:mm a')}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          {payment.status === 'held' && (
            <button
              onClick={() => onProcessPayout(payment.id)}
              disabled={actionLoading === payment.id}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              {actionLoading === payment.id ? 'Processing...' : 'Process Payout'}
            </button>
          )}
          {payment.status === 'processing' && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Processing
            </span>
          )}
          <Link
            href={`/admin/payments/${payment.id}`}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="w-5 h-5" />
          </Link>
        </div>
      </td>
    </tr>
  );
});

export default PaymentsTable;
