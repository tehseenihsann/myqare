'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, DollarSign, Percent, User, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import type { Payment } from '@/types';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useToast } from '@/contexts/ToastContext';
import { PageLoader } from '@/components/ui/Loader';

export default function PaymentDetail({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    fetchPayment();
  }, [paymentId]);

  const fetchPayment = async () => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`);
      if (response.ok) {
        const data = await response.json();
        setPayment(data);
      }
    } catch (error) {
      console.error('Error fetching payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayoutClick = () => {
    setShowConfirmDialog(true);
  };

  const handleProcessPayout = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/process`, {
        method: 'POST',
      });
      if (response.ok) {
        toast.showSuccess('Payout processed', 'The payout has been successfully processed.');
        setShowConfirmDialog(false);
        fetchPayment();
      } else {
        const error = await response.json();
        toast.showError('Failed to process payout', error.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      toast.showError('Error', 'Failed to process payout. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
        <PageLoader message="Loading payment details..." />
      </div>
    );
  }

  if (!payment) {
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
          <p className="text-sm sm:text-base text-gray-500">Payment not found</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const styles: { [key: string]: { bg: string; text: string } } = {
      held: { bg: '#FEF3C7', text: '#92400E' },
      processing: { bg: '#DBEAFE', text: '#1E40AF' },
      completed: { bg: '#D1FAE5', text: '#065F46' },
      refunded: { bg: '#FEE2E2', text: '#991B1B' },
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
        Back to Payments
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Payment #{payment.id.slice(0, 8)}
            </h1>
            <span
              className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium"
              style={getStatusColor(payment.status)}
            >
              {payment.status}
            </span>
          </div>
          {payment.status === 'held' && (
            <button
              onClick={handleProcessPayoutClick}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              Process Payout
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Booking</h3>
              <Link
                href={`/admin/bookings/${payment.bookingId}`}
                className="text-blue-600 hover:text-blue-700"
              >
                #{payment.bookingId.slice(0, 8)}
              </Link>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Client</h3>
              <Link
                href={`/admin/users/${payment.clientId}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <User className="w-4 h-4" />
                {payment.clientId.slice(0, 8)}
              </Link>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Provider</h3>
              <Link
                href={`/admin/users/${payment.providerId}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <User className="w-4 h-4" />
                {payment.providerId.slice(0, 8)}
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Amount
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                RM {payment.amount.toLocaleString('en-US')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Platform Fee (30%)
              </h3>
              <p className="text-xl font-semibold text-blue-600">
                RM {payment.platformFee.toLocaleString('en-US')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Provider Payout</h3>
              <p className="text-xl font-semibold text-green-600">
                RM {payment.providerPayout.toLocaleString('en-US')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Payment Held</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(payment.heldAt), 'MMM dd, yyyy hh:mm a')}
                </p>
              </div>
            </div>
            {payment.processedAt && (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Processing Started</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(payment.processedAt), 'MMM dd, yyyy hh:mm a')}
                  </p>
                </div>
              </div>
            )}
            {payment.completedAt && (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment Completed</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(payment.completedAt), 'MMM dd, yyyy hh:mm a')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleProcessPayout}
        title="Process Payout"
        message="Are you sure you want to process this payout? The provider will receive their payment and this action cannot be undone."
        type="warning"
        confirmText="Process Payout"
        isLoading={actionLoading}
      />
    </div>
  );
}

