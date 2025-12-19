'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalRevenue: number;
  platformFees: number;
  totalProviders: number;
  totalClients: number;
  pendingPayments: number;
}

export default function DashboardStats() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    platformFees: 0,
    totalProviders: 0,
    totalClients: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'blue',
      change: '+12%',
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: Clock,
      color: 'yellow',
      change: '+5%',
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings,
      icon: TrendingUp,
      color: 'green',
      change: '+8%',
    },
    {
      title: 'Completed',
      value: stats.completedBookings,
      icon: CheckCircle,
      color: 'purple',
      change: '+15%',
    },
    {
      title: 'Total Revenue',
      value: `RM ${stats.totalRevenue.toLocaleString('en-US')}`,
      icon: DollarSign,
      color: 'green',
      change: '+20%',
    },
    {
      title: 'Platform Fees',
      value: `RM ${stats.platformFees.toLocaleString('en-US')}`,
      icon: DollarSign,
      color: 'blue',
      change: '+20%',
    },
    {
      title: 'Total Providers',
      value: stats.totalProviders,
      icon: Users,
      color: 'indigo',
      change: '+3',
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'pink',
      change: '+10',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const colorConfig: { [key: string]: { gradient: string; iconBg: string; iconColor: string; changeBg: string } } = {
          blue: {
            gradient: 'from-blue-50 to-blue-100/50',
            iconBg: 'bg-blue-500',
            iconColor: 'text-white',
            changeBg: 'bg-blue-100',
          },
          yellow: {
            gradient: 'from-yellow-50 to-yellow-100/50',
            iconBg: 'bg-yellow-500',
            iconColor: 'text-white',
            changeBg: 'bg-yellow-100',
          },
          green: {
            gradient: 'from-green-50 to-green-100/50',
            iconBg: 'bg-green-500',
            iconColor: 'text-white',
            changeBg: 'bg-green-100',
          },
          purple: {
            gradient: 'from-purple-50 to-purple-100/50',
            iconBg: 'bg-purple-500',
            iconColor: 'text-white',
            changeBg: 'bg-purple-100',
          },
          indigo: {
            gradient: 'from-indigo-50 to-indigo-100/50',
            iconBg: 'bg-indigo-500',
            iconColor: 'text-white',
            changeBg: 'bg-indigo-100',
          },
          pink: {
            gradient: 'from-pink-50 to-pink-100/50',
            iconBg: 'bg-pink-500',
            iconColor: 'text-white',
            changeBg: 'bg-pink-100',
          },
        };

        const config = colorConfig[stat.color as keyof typeof colorConfig] || colorConfig.blue;

        return (
          <div
            key={index}
            className={`group relative bg-gradient-to-br ${config.gradient} rounded-xl shadow-sm border border-gray-200/50 p-5 sm:p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden`}
          >
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <div className={`w-full h-full ${config.iconBg} rounded-full blur-2xl`}></div>
            </div>
            
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </p>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-50">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <div className={`${config.iconBg} ${config.iconColor} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

