'use client';

import { useState, useCallback } from 'react';
import UsersTable from '@/components/admin/UsersTable';
import UsersFilters from '@/components/admin/UsersFilters';
import { usePagination } from '@/hooks/usePagination';

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const pagination = usePagination({ initialPage: 1, itemsPerPage: 10 });

  // Reset to page 1 when filters change
  const handleRoleChange = useCallback((role: string) => {
    setRoleFilter(role);
    pagination.setPage(1);
  }, [pagination]);

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage providers and clients</p>
      </div>

      <UsersFilters 
        onRoleChange={handleRoleChange} 
        onStatusChange={handleStatusChange}
        onSearchChange={handleSearchChange}
      />
      <UsersTable 
        roleFilter={roleFilter} 
        statusFilter={statusFilter}
        searchQuery={searchQuery}
      />
    </div>
  );
}
