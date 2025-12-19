'use client';

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { format } from 'date-fns';
import { Eye, UserCheck, UserX, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { User } from '@/types';
import { usePagination } from '@/hooks/usePagination';
import Pagination from './Pagination';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useToast } from '@/contexts/ToastContext';
import { TableLoader } from '@/components/ui/Loader';

interface UsersTableProps {
  roleFilter?: string;
  statusFilter?: string;
  searchQuery?: string;
}

const UsersTable = memo(function UsersTable({ 
  roleFilter = 'all', 
  statusFilter = 'all',
  searchQuery = ''
}: UsersTableProps) {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    userId: string;
    isActive: boolean;
  }>({
    isOpen: false,
    userId: '',
    isActive: true,
  });

  const pagination = usePagination({
    initialPage: 1,
    itemsPerPage: 10,
    totalItems,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const result = await response.json();
        setUsers(result.data || []);
        setTotalItems(result.pagination?.total || 0);
        pagination.setTotalItems(result.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, roleFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Real-time updates: Poll every 15 seconds (users change less frequently)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchUsers]);

  const handleToggleStatusClick = useCallback((userId: string, currentStatus: boolean) => {
    setConfirmDialog({
      isOpen: true,
      userId,
      isActive: currentStatus,
    });
  }, []);

  const handleToggleStatus = useCallback(async () => {
    if (!confirmDialog.userId) return;
    
    setActionLoading(confirmDialog.userId);
    try {
      const response = await fetch(`/api/admin/users/${confirmDialog.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !confirmDialog.isActive }),
      });
      if (response.ok) {
        toast.showSuccess(
          `User ${!confirmDialog.isActive ? 'activated' : 'deactivated'}`,
          `The user has been ${!confirmDialog.isActive ? 'activated' : 'deactivated'} successfully.`
        );
        setConfirmDialog({ isOpen: false, userId: '', isActive: true });
        fetchUsers();
      } else {
        const error = await response.json();
        toast.showError('Failed to update user', error.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.showError('Error', 'Failed to update user status. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }, [confirmDialog, fetchUsers, toast]);

  const handlePageChange = useCallback((page: number) => {
    pagination.setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pagination]);

  if (loading && users.length === 0) {
    return <TableLoader rows={5} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onToggleStatus={handleToggleStatusClick}
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
        onClose={() => setConfirmDialog({ isOpen: false, userId: '', isActive: true })}
        onConfirm={handleToggleStatus}
        title={confirmDialog.isActive ? 'Deactivate User' : 'Activate User'}
        message={
          confirmDialog.isActive
            ? 'Are you sure you want to deactivate this user? They will not be able to access the platform.'
            : 'Are you sure you want to activate this user? They will be able to access the platform.'
        }
        type={confirmDialog.isActive ? 'warning' : 'info'}
        confirmText={confirmDialog.isActive ? 'Deactivate' : 'Activate'}
        isLoading={actionLoading === confirmDialog.userId}
      />
    </div>
  );
});

interface UserRowProps {
  user: User;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  actionLoading?: string | null;
}

const UserRow = memo(function UserRow({ user, onToggleStatus, actionLoading }: UserRowProps) {
  const roleStyle = useMemo(() => {
    return user.role === 'provider'
      ? { backgroundColor: '#B3E5FC', color: '#4FC3F7' }
      : { backgroundColor: '#C8E6C9', color: '#66BB6A' };
  }, [user.role]);

  const createdAtDate = useMemo(() => new Date(user.createdAt), [user.createdAt]);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="shrink-0 h-10 w-10">
            {user.profileImage ? (
              <Image
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
                src={user.profileImage}
                alt={user.name || 'User'}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.name || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 flex items-center gap-1">
          <Mail className="w-4 h-4" />
          {user.email}
        </div>
        {user.phone && (
          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <Phone className="w-4 h-4" />
            {user.phone}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className="px-2 py-1 text-xs font-medium rounded-full"
          style={roleStyle}
        >
          {user.role?.toLowerCase() || 'client'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            user.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {format(createdAtDate, 'MMM dd, yyyy')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onToggleStatus(user.id, user.isActive)}
            disabled={actionLoading === user.id}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              user.isActive
                ? 'text-red-600 hover:bg-red-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
          >
            {user.isActive ? (
              <UserX className="w-5 h-5" />
            ) : (
              <UserCheck className="w-5 h-5" />
            )}
          </button>
          <Link
            href={`/admin/users/${user.id}`}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="w-5 h-5" />
          </Link>
        </div>
      </td>
    </tr>
  );
});

export default UsersTable;
