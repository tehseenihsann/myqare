'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, User, X, Calendar, DollarSign, Tag, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useDebounce } from '@/hooks/useDebounce';
import NotificationPanel from './NotificationPanel';
import ProfileDropdown from './ProfileDropdown';
import ThemeToggle from './ThemeToggle';

interface SearchResult {
  id: string;
  type: 'booking' | 'user' | 'payment' | 'category';
  title: string;
  subtitle?: string;
  status?: string;
  amount?: number;
  role?: string;
  url: string;
}

interface SearchResponse {
  bookings: SearchResult[];
  users: SearchResult[];
  payments: SearchResult[];
  categories: SearchResult[];
}

export default function AdminHeader() {
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { unreadCount } = useNotifications();

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.length < 2) {
        setSearchResults(null);
        setIsSearchOpen(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(debouncedSearch)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
          setIsSearchOpen(true);
        }
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length >= 2) {
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
      setSearchResults(null);
    }
  };

  const handleResultClick = (url: string) => {
    router.push(url);
    setSearchQuery('');
    setIsSearchOpen(false);
    setSearchResults(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return Calendar;
      case 'payment':
        return DollarSign;
      case 'category':
        return Tag;
      case 'user':
        return User;
      default:
        return Search;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'text-blue-600 bg-blue-100';
      case 'payment':
        return 'text-green-600 bg-green-100';
      case 'category':
        return 'text-purple-600 bg-purple-100';
      case 'user':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const allResults = searchResults
    ? [
        ...searchResults.bookings,
        ...searchResults.users,
        ...searchResults.payments,
        ...searchResults.categories,
      ]
    : [];

  return (
    <>
      <header className="relative z-10" style={{ backgroundColor: theme.sidebar, borderColor: theme.border }}>
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          <div className="flex-1 hidden md:block"></div>
          <div className="flex-1 flex items-center justify-center">
            <div ref={searchRef} className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <input
                type="text"
                placeholder="Search bookings, users, payments..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchQuery.length >= 2 && searchResults) {
                    setIsSearchOpen(true);
                  }
                }}
                className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm text-gray-900 bg-white"
                style={{ '--tw-ring-color': theme.primary } as React.CSSProperties}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                    setSearchResults(null);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-4 flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Searching...</span>
                    </div>
                  ) : allResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults?.bookings && searchResults.bookings.length > 0 && (
                        <div className="px-3 py-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Bookings</p>
                          {searchResults.bookings.map((result) => {
                            const Icon = getTypeIcon(result.type);
                            return (
                              <button
                                key={result.id}
                                onClick={() => handleResultClick(result.url)}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                              >
                                <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                                  <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {searchResults?.users && searchResults.users.length > 0 && (
                        <div className="px-3 py-2 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Users</p>
                          {searchResults.users.map((result) => {
                            const Icon = getTypeIcon(result.type);
                            return (
                              <button
                                key={result.id}
                                onClick={() => handleResultClick(result.url)}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                              >
                                <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                                  <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {searchResults?.payments && searchResults.payments.length > 0 && (
                        <div className="px-3 py-2 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Payments</p>
                          {searchResults.payments.map((result) => {
                            const Icon = getTypeIcon(result.type);
                            return (
                              <button
                                key={result.id}
                                onClick={() => handleResultClick(result.url)}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                              >
                                <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {result.subtitle} {result.amount && `• RM ${result.amount.toLocaleString()}`}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {searchResults?.categories && searchResults.categories.length > 0 && (
                        <div className="px-3 py-2 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Categories</p>
                          {searchResults.categories.map((result) => {
                            const Icon = getTypeIcon(result.type);
                            return (
                              <button
                                key={result.id}
                                onClick={() => handleResultClick(result.url)}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                              >
                                <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                                  {result.subtitle && (
                                    <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : debouncedSearch.length >= 2 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No results found for &quot;{debouncedSearch}&quot;
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Notification Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsProfileOpen(false);
                }}
                className="p-2 rounded-lg relative transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Bell className="w-5 h-5" />
                {mounted && unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#4FC3F7] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationOpen(false);
                }}
                className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[#4FC3F7] to-[#81D4FA]">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-700">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Profile Dropdown */}
      <ProfileDropdown
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={{
          name: 'Admin User',
          email: 'admin@myqare.com',
          role: 'Administrator',
        }}
      />
    </>
  );
}

