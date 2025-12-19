'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { ArrowLeft, User, Mail, Phone, MapPin, UserCheck, UserX, Calendar } from 'lucide-react';
import type { User as UserType, Provider } from '@/types';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useToast } from '@/contexts/ToastContext';
import { PageLoader } from '@/components/ui/Loader';

export default function UserDetail({ userId }: { userId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<(UserType | Provider) | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatusClick = () => {
    setShowConfirmDialog(true);
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (response.ok) {
        toast.showSuccess(
          `User ${!user.isActive ? 'activated' : 'deactivated'}`,
          `The user has been ${!user.isActive ? 'activated' : 'deactivated'} successfully.`
        );
        setShowConfirmDialog(false);
        fetchUser();
      } else {
        const error = await response.json();
        toast.showError('Failed to update user', error.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.showError('Error', 'Failed to update user status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
        <PageLoader message="Loading user details..." />
      </div>
    );
  }

  if (!user) {
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
          <p className="text-sm sm:text-base text-gray-500">User not found</p>
        </div>
      </div>
    );
  }

  const isProvider = user.role === 'provider';
  const provider = isProvider ? (user as Provider) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Users
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-4">
            {user.profileImage ? (
              <Image
                width={64}
                height={64}
                src={user.profileImage}
                alt={user.name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-medium text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <button
            onClick={handleToggleStatusClick}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              user.isActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {user.isActive ? (
              <>
                <UserX className="w-4 h-4" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                Activate
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Role
              </h3>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'provider'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {user.role}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </h3>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </h3>
              <p className="text-gray-900">{user.phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Joined
              </h3>
              <p className="text-gray-900">
                {format(new Date(user.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          {isProvider && provider && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.specialties?.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Rating</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {provider.rating?.toFixed(1) || 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Jobs</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {provider.totalJobs || 0}
                </p>
              </div>
              {provider.location && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </h3>
                  <p className="text-gray-900">{provider.location.address}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleToggleStatus}
        title={user?.isActive ? 'Deactivate User' : 'Activate User'}
        message={
          user?.isActive
            ? 'Are you sure you want to deactivate this user? They will not be able to access the platform.'
            : 'Are you sure you want to activate this user? They will be able to access the platform.'
        }
        type={user?.isActive ? 'warning' : 'info'}
        confirmText={user?.isActive ? 'Deactivate' : 'Activate'}
        isLoading={actionLoading}
      />
    </div>
  );
}

