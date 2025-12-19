'use client';

import Link from 'next/link';
import { Plus, FileText, Users, Calendar, TrendingUp } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      label: 'New Booking',
      icon: Plus,
      href: '/admin/bookings',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
    },
    {
      label: 'View Reports',
      icon: FileText,
      href: '/admin/reports',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
    },
    {
      label: 'Manage Users',
      icon: Users,
      href: '/admin/users',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
    },
    {
      label: 'All Bookings',
      icon: Calendar,
      href: '/admin/bookings',
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
    },
    {
      label: 'Revenue',
      icon: TrendingUp,
      href: '/admin/reports?tab=revenue',
      color: 'from-pink-500 to-pink-600',
      hoverColor: 'hover:from-pink-600 hover:to-pink-700',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              href={action.href}
              className={`group relative bg-gradient-to-br ${action.color} ${action.hoverColor} rounded-lg p-4 text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-center">{action.label}</span>
              </div>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-lg transition-colors"></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

