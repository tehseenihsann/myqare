'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Save, Bell, Shield, Globe, Mail, CreditCard, Database } from 'lucide-react';

export default function SettingsForm() {
  const { theme } = useTheme();
  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'MyQare',
    platformEmail: 'support@myqare.com',
    platformPhone: '+60 12-345 6789',
    
    // Notification Settings
    pushNotifications: true,
    bookingNotifications: true,
    paymentNotifications: true,
    userNotifications: true,
    
    // Platform Settings
    enableRegistration: true,
    requireEmailVerification: true,
    enableReviews: true,
    autoApproveProviders: false,
    
    // Payment Settings
    platformFee: 15,
    paymentMethodStripe: true,
    paymentMethodPayPal: false,
    paymentMethodBankTransfer: true,
    
    // Security Settings
    sessionTimeout: 30,
    requireStrongPassword: true,
  });

  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'platform' | 'payments' | 'security'>('general');
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (name: string, value: any) => {
    setSettings(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving settings:', settings);
    setHasChanges(false);
    // Show success message
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'platform', label: 'Platform', icon: Database },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
  return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium text-gray-600"
                style={{
                  backgroundColor: activeTab === tab.id ? theme.primary : 'transparent',
                  color: activeTab === tab.id ? theme.text : undefined,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = theme.primaryLight;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#4FC3F7] text-white rounded-lg hover:bg-[#81D4FA] transition-colors flex items-center gap-2 font-medium"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      )}

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Name
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => handleChange('platformName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BBD0] focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Email
              </label>
              <input
                type="email"
                value={settings.platformEmail}
                onChange={(e) => handleChange('platformEmail', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BBD0] focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Phone
              </label>
              <input
                type="tel"
                value={settings.platformPhone}
                onChange={(e) => handleChange('platformPhone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BBD0] focus:border-transparent text-gray-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-500">Receive push notifications in browser</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F8BBD0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4FC3F7]"></div>
              </label>
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Notification Types</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Booking Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.bookingNotifications}
                      onChange={(e) => handleChange('bookingNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F8BBD0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4FC3F7]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Payment Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paymentNotifications}
                      onChange={(e) => handleChange('paymentNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F8BBD0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4FC3F7]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">User Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.userNotifications}
                      onChange={(e) => handleChange('userNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F8BBD0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4FC3F7]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Settings */}
      {activeTab === 'platform' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Platform Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Enable Registration</h4>
                <p className="text-sm text-gray-500">Allow new users to register on the platform</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableRegistration}
                  onChange={(e) => handleChange('enableRegistration', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F8BBD0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4FC3F7]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Require Email Verification</h4>
                <p className="text-sm text-gray-500">Users must verify their email before accessing the platform</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F8BBD0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4FC3F7]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Enable Reviews</h4>
                <p className="text-sm text-gray-500">Allow users to submit reviews and ratings</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableReviews}
                  onChange={(e) => handleChange('enableReviews', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F8BBD0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4FC3F7]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Auto-Approve Providers</h4>
                <p className="text-sm text-gray-500">Automatically approve provider registrations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoApproveProviders}
                  onChange={(e) => handleChange('autoApproveProviders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F8BBD0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4FC3F7]"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Fee (%)
          </label>
            <input
              type="number"
              min="0"
              max="100"
                value={settings.platformFee}
                onChange={(e) => handleChange('platformFee', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BBD0] focus:border-transparent text-gray-900"
            />
              <p className="text-xs text-gray-500 mt-1">Percentage charged on each transaction</p>
        </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Payment Methods</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Stripe</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paymentMethodStripe}
                      onChange={(e) => handleChange('paymentMethodStripe', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F8BBD0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4FC3F7]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">PayPal</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paymentMethodPayPal}
                      onChange={(e) => handleChange('paymentMethodPayPal', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F8BBD0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4FC3F7]"></div>
              </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Bank Transfer</span>
                  <label className="relative inline-flex items-center cursor-pointer">
              <input
                      type="checkbox"
                      checked={settings.paymentMethodBankTransfer}
                      onChange={(e) => handleChange('paymentMethodBankTransfer', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F8BBD0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4FC3F7]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BBD0] focus:border-transparent text-gray-900"
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Require Strong Password</h4>
                <p className="text-sm text-gray-500">Enforce password complexity requirements</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireStrongPassword}
                  onChange={(e) => handleChange('requireStrongPassword', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F8BBD0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4FC3F7]"></div>
              </label>
            </div>
      </div>
        </div>
      )}
    </div>
  );
}
