'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Download, FileText, TrendingUp, DollarSign, Users, BookOpen, Activity } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PageLoader, Loader } from '@/components/ui/Loader';
import BookingActivityPage from './BookingActivityPage';
import dynamic from 'next/dynamic';

// Dynamically import RevenueChart to avoid SSR issues with recharts
const RevenueChart = dynamic(() => import('./RevenueChart'), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Loading chart...</div>
    </div>
  ),
});

type ReportType = 'overview' | 'bookings' | 'revenue' | 'users' | 'payments' | 'activity';

interface ReportData {
  [key: string]: any;
}

export default function ReportsPage() {
  const toast = useToast();
  const { theme } = useTheme();
  const [activeReport, setActiveReport] = useState<ReportType>('overview');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({});
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchReport = useCallback(async () => {
    // Skip API call for activity report as it has its own data fetching
    if (activeReport === 'activity') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: activeReport,
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
      });

      const response = await fetch(`/api/admin/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        toast.showError('Error', 'Failed to fetch report data');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.showError('Error', 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  }, [activeReport, dateRange, toast]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleDateRangeChange = (range: 'today' | 'week' | 'month' | 'all') => {
    const today = new Date();
    switch (range) {
      case 'today':
        setDateRange({
          startDate: format(today, 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd'),
        });
        break;
      case 'week':
        setDateRange({
          startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd'),
        });
        break;
      case 'month':
        setDateRange({
          startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
        });
        break;
      case 'all':
        setDateRange({
          startDate: '',
          endDate: '',
        });
        break;
    }
  };

  const handleExport = () => {
    toast.showInfo('Export', 'Export feature coming soon');
  };

  const reportTypes = [
    { id: 'overview' as ReportType, label: 'Overview', icon: FileText },
    { id: 'bookings' as ReportType, label: 'Bookings', icon: BookOpen },
    { id: 'revenue' as ReportType, label: 'Revenue', icon: DollarSign },
    { id: 'users' as ReportType, label: 'Users', icon: Users },
    { id: 'payments' as ReportType, label: 'Payments', icon: TrendingUp },
    { id: 'activity' as ReportType, label: 'Booking Activity', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div className="rounded-lg shadow-sm p-4 sm:p-6" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: '1px' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: theme.text }}>Reports & Analytics</h2>
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>View detailed reports and insights</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => handleDateRangeChange('today')}
                className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ 
                  borderColor: theme.border, 
                  borderWidth: '1px',
                  color: theme.text,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primaryLight}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Today
              </button>
              <button
                onClick={() => handleDateRangeChange('week')}
                className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ 
                  borderColor: theme.border, 
                  borderWidth: '1px',
                  color: theme.text,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primaryLight}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Week
              </button>
              <button
                onClick={() => handleDateRangeChange('month')}
                className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ 
                  borderColor: theme.border, 
                  borderWidth: '1px',
                  color: theme.text,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primaryLight}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Month
              </button>
              <button
                onClick={() => handleDateRangeChange('all')}
                className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ 
                  borderColor: theme.border, 
                  borderWidth: '1px',
                  color: theme.text,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primaryLight}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                All Time
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 text-gray-900"
                style={{ 
                  borderColor: theme.border, 
                  borderWidth: '1px',
                  '--tw-ring-color': theme.primary
                } as React.CSSProperties}
              />
              <span style={{ color: theme.textSecondary }}>to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 text-gray-900"
                style={{ 
                  borderColor: theme.border, 
                  borderWidth: '1px',
                  '--tw-ring-color': theme.primary
                } as React.CSSProperties}
              />
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-1.5 text-sm text-white rounded-lg flex items-center gap-2 transition-colors"
              style={{ 
                backgroundColor: theme.primary,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primaryHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.primary}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="rounded-lg shadow-sm p-2" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: '1px' }}>
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const isActive = activeReport === report.id;
            return (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                style={{
                  backgroundColor: isActive ? theme.primary : 'transparent',
                  color: isActive ? theme.text : theme.textSecondary,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = theme.primaryLight;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon className="w-4 h-4" />
                {report.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Content */}
      {activeReport === 'activity' ? (
        <BookingActivityPage />
      ) : loading ? (
        <PageLoader message="Loading report data..." />
      ) : (
        <div className="space-y-6">
          {activeReport === 'overview' && <OverviewReport data={reportData} />}
          {activeReport === 'bookings' && <BookingsReport data={reportData} />}
          {activeReport === 'revenue' && <RevenueReport data={reportData} />}
          {activeReport === 'users' && <UsersReport data={reportData} />}
          {activeReport === 'payments' && <PaymentsReport data={reportData} />}
        </div>
      )}
    </div>
  );
}

// Overview Report Component
function OverviewReport({ data }: { data: ReportData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Bookings"
        value={data.totalBookings || 0}
        icon={BookOpen}
        color="blue"
      />
      <StatCard
        title="Total Revenue"
        value={`RM ${(data.totalRevenue || 0).toLocaleString('en-US')}`}
        icon={DollarSign}
        color="green"
      />
      <StatCard
        title="Platform Fees"
        value={`RM ${(data.platformFees || 0).toLocaleString('en-US')}`}
        icon={TrendingUp}
        color="purple"
      />
      <StatCard
        title="Total Users"
        value={data.totalUsers || 0}
        icon={Users}
        color="indigo"
      />
    </div>
  );
}

// Bookings Report Component
function BookingsReport({ data }: { data: ReportData }) {
  const { theme } = useTheme();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Bookings"
          value={data.totalBookings || 0}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Average Booking Value"
          value={`RM ${(data.averageBookingValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Total Booking Value"
          value={`RM ${(data.totalBookingValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {data.bookingsByStatus && (
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: '1px' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>Bookings by Status</h3>
          <div className="space-y-3">
            {data.bookingsByStatus.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2" style={{ borderBottomColor: theme.border, borderBottomWidth: '1px' }}>
                <span className="text-sm font-medium capitalize" style={{ color: theme.text }}>
                  {item.status?.toLowerCase().replace('_', ' ')}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm" style={{ color: theme.textSecondary }}>{item.count || 0} bookings</span>
                  {item.averageValue && (
                    <span className="text-sm" style={{ color: theme.textSecondary }}>
                      Avg: RM {item.averageValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Revenue Report Component
function RevenueReport({ data }: { data: ReportData }) {
  const { theme } = useTheme();
  // Format time series data for the chart
  const chartData = useMemo(() => {
    // Generate sample data as fallback
    const generateSampleData = () => {
      const sampleData = [];
      const baseValues = [1500, 1800, 2200, 1900, 2500, 2800, 3000];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const baseValue = baseValues[6 - i] || 2000;
        sampleData.push({
          date: format(date, 'MMM dd'),
          fullDate: format(date, 'yyyy-MM-dd'),
          revenue: baseValue,
          fees: baseValue * 0.3, // 30% platform fee
          payouts: baseValue * 0.7, // 70% provider payout
        });
      }
      return sampleData;
    };

    // If we have real data, use it; otherwise use sample data
    if (data.revenueTimeSeries && data.revenueTimeSeries.length > 0) {
      const realData = data.revenueTimeSeries.map((item: any) => ({
        date: format(new Date(item.date), 'MMM dd'),
        fullDate: item.date,
        revenue: Number((item.revenue || 0).toFixed(2)),
        fees: Number((item.fees || 0).toFixed(2)),
        payouts: Number((item.payouts || 0).toFixed(2)),
      }));
      
      // Only use real data if it has non-zero values
      const hasRealData = realData.some((item: any) => item.revenue > 0 || item.fees > 0 || item.payouts > 0);
      return hasRealData ? realData : generateSampleData();
    }

    return generateSampleData();
  }, [data.revenueTimeSeries]);


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`RM ${(data.totalRevenue || 0).toLocaleString('en-US')}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Platform Fees"
          value={`RM ${(data.totalPlatformFees || 0).toLocaleString('en-US')}`}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Provider Payouts"
          value={`RM ${(data.totalProviderPayouts || 0).toLocaleString('en-US')}`}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Total Transactions"
          value={data.totalTransactions || 0}
          icon={FileText}
          color="indigo"
        />
      </div>

      {/* Revenue Chart */}
      <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: '1px' }}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>Revenue Overview</h3>
          <p className="text-sm" style={{ color: theme.textSecondary }}>Track revenue trends over time</p>
        </div>
        <RevenueChart data={chartData} />
      </div>

      {data.revenueByStatus && (
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: '1px' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>Revenue by Payment Status</h3>
          <div className="space-y-3">
            {data.revenueByStatus.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2" style={{ borderBottomColor: theme.border, borderBottomWidth: '1px' }}>
                <span className="text-sm font-medium capitalize" style={{ color: theme.text }}>
                  {item.status?.toLowerCase()}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm" style={{ color: theme.textSecondary }}>
                    RM {item.totalAmount.toLocaleString('en-US')}
                  </span>
                  <span className="text-sm" style={{ color: theme.textSecondary }}>{item.count} transactions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Users Report Component
function UsersReport({ data }: { data: ReportData }) {
  const { theme } = useTheme();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.usersByRole?.map((item: any, index: number) => (
          <StatCard
            key={index}
            title={`Total ${item.role}s`}
            value={item.count || 0}
            icon={Users}
            color={item.role === 'PROVIDER' ? 'blue' : 'green'}
          />
        ))}
      </div>

      {data.activeUsers && (
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: '1px' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>User Activity</h3>
          <div className="space-y-3">
            {data.activeUsers.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2" style={{ borderBottomColor: theme.border, borderBottomWidth: '1px' }}>
                <span className="text-sm font-medium capitalize" style={{ color: theme.text }}>
                  {item.role?.toLowerCase()} - {item.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-sm" style={{ color: theme.textSecondary }}>{item.count || 0} users</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Payments Report Component
function PaymentsReport({ data }: { data: ReportData }) {
  const { theme } = useTheme();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Payments"
          value={data.totalPayments || 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Total Amount"
          value={`RM ${(data.totalAmount || 0).toLocaleString('en-US')}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Total Fees"
          value={`RM ${(data.totalFees || 0).toLocaleString('en-US')}`}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Average Amount"
          value={`RM ${(data.averageAmount || 0).toFixed(2)}`}
          icon={DollarSign}
          color="indigo"
        />
      </div>

      {data.paymentsByStatus && (
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: '1px' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>Payments by Status</h3>
          <div className="space-y-3">
            {data.paymentsByStatus.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2" style={{ borderBottomColor: theme.border, borderBottomWidth: '1px' }}>
                <span className="text-sm font-medium capitalize" style={{ color: theme.text }}>
                  {item.status?.toLowerCase()}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm" style={{ color: theme.textSecondary }}>
                    RM {item.totalAmount.toLocaleString('en-US')}
                  </span>
                  <span className="text-sm" style={{ color: theme.textSecondary }}>{item.count} payments</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  const { theme } = useTheme();
  
  const colorClasses = {
    blue: { bg: theme.primaryLight, text: theme.primary },
    green: { bg: '#D1FAE5', text: '#059669' },
    purple: { bg: '#E9D5FF', text: '#7C3AED' },
    indigo: { bg: '#E0E7FF', text: '#4F46E5' },
    yellow: { bg: '#FEF3C7', text: '#D97706' },
  };

  const colorStyle = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: '1px' }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>{title}</p>
          <p className="text-2xl font-bold mt-2" style={{ color: theme.text }}>{value}</p>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: colorStyle.bg, color: colorStyle.text }}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

