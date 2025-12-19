'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface UsersFiltersProps {
  onRoleChange?: (role: string) => void;
  onStatusChange?: (status: string) => void;
  onSearchChange?: (search: string) => void;
}

const UsersFilters = memo(function UsersFilters({ 
  onRoleChange, 
  onStatusChange,
  onSearchChange 
}: UsersFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Notify parent of debounced search changes
  useEffect(() => {
    onSearchChange?.(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const handleRoleChange = useCallback((value: string) => {
    setRoleFilter(value);
    onRoleChange?.(value);
  }, [onRoleChange]);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    onStatusChange?.(value);
  }, [onStatusChange]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="all">All Roles</option>
            <option value="provider">Providers</option>
            <option value="client">Clients</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
});

export default UsersFilters;
