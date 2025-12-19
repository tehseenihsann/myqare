'use client';

import { useState, useCallback } from 'react';
import BookingsTable from '@/components/admin/BookingsTable';
import BookingsFilters from '@/components/admin/BookingsFilters';
import { usePagination } from '@/hooks/usePagination';

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
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

  const handleDateFilterChange = useCallback((date: string) => {
    setDateFilter(date);
    pagination.setPage(1);
  }, [pagination]);

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bookings Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all bookings and take actions</p>
      </div>

      <BookingsFilters 
        onStatusChange={handleStatusChange}
        onSearchChange={handleSearchChange}
        onDateFilterChange={handleDateFilterChange}
      />
      <BookingsTable 
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        dateFilter={dateFilter}
      />
    </div>
  );
}
