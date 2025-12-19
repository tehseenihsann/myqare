'use client';

import { useState, useCallback } from 'react';
import PaymentsTable from '@/components/admin/PaymentsTable';
import PaymentsSummary from '@/components/admin/PaymentsSummary';
import PaymentsFilters from '@/components/admin/PaymentsFilters';
import { usePagination } from '@/hooks/usePagination';

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const pagination = usePagination({ initialPage: 1, itemsPerPage: 10 });

  // Reset to page 1 when filters change
  const handleStatusChange = useCallback((status: string) => {
    setStatusFilter(status);
    pagination.setPage(1);
  }, [pagination]);

  const handleSearchChange = useCallback((search: string) => {
    setSearchQuery(search);
    pagination.setPage(1);
  }, [pagination]);

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payments Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Manage payments, platform fees, and provider payouts
        </p>
      </div>

      <PaymentsSummary />
      <PaymentsFilters 
        onStatusChange={handleStatusChange}
        onSearchChange={handleSearchChange}
      />
      <PaymentsTable 
        statusFilter={statusFilter}
        searchQuery={searchQuery}
      />
    </div>
  );
}

