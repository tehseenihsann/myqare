'use client';

import { useState } from 'react';
import { User, Mail, Phone, Camera, Save, Edit2, X } from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@myqare.com',
    phone: '+60 12-345 6789',
    role: 'Administrator',
    department: 'Operations',
    bio: 'System administrator responsible for managing the platform operations and user management.',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving profile:', formData);
    setIsEditing(false);
    // Show success message
  };

  const handleCancel = () => {
    // Reset form data
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage your profile information and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#4FC3F7] text-white rounded-lg hover:bg-[#81D4FA] transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#F8BBD0] text-gray-900 rounded-lg hover:bg-[#FCE7F3] transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#4FC3F7] to-[#81D4FA] flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Camera className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{formData.email}</p>
              <span className="mt-2 px-3 py-1 bg-[#FCE7F3] text-gray-900 text-xs font-medium rounded-full">
                {formData.role}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-medium text-gray-900">Jan 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm font-medium text-gray-900">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BBD0] focus:border-transparent text-gray-900"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="w-5 h-5 text-gray-400" />
                    <span>{formData.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BBD0] focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{formData.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BBD0] focus:border-transparent text-gray-900"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{formData.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BBD0] focus:border-transparent text-gray-900"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="w-5 h-5 text-gray-400" />
                    <span>{formData.department}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">About</h3>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BBD0] focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{formData.bio}</p>
            )}
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Security</h3>
            <div className="space-y-4">
              <button className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                Change Password
              </button>
              <button className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium sm:ml-3">
                Enable Two-Factor Authentication
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
