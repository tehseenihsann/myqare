'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface BookingsFiltersProps {
  onStatusChange?: (status: string) => void;
  onSearchChange?: (search: string) => void;
  onDateFilterChange?: (dateFilter: string) => void;
}

const BookingsFilters = memo(function BookingsFilters({ 
  onStatusChange, 
  onSearchChange,
  onDateFilterChange 
}: BookingsFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Notify parent of debounced search changes
  useEffect(() => {
    onSearchChange?.(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    onStatusChange?.(value);
  }, [onStatusChange]);

  const handleDateFilterChange = useCallback((value: string) => {
    setDateFilter(value);
    onDateFilterChange?.(value);
  }, [onDateFilterChange]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search bookings by ID, client, or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => handleDateFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>
    </div>
  );
});

export default BookingsFilters;
