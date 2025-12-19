'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    fees: number;
    payouts: number;
  }>;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  // This component is used in dashboard, so we'll use sample data
  // Ensure we have data, use sample data if empty
  const chartData = data && data.length > 0 ? data : [
    { date: 'Jan', revenue: 1500, fees: 450, payouts: 1050 },
    { date: 'Feb', revenue: 1800, fees: 540, payouts: 1260 },
    { date: 'Mar', revenue: 2200, fees: 660, payouts: 1540 },
    { date: 'Apr', revenue: 1900, fees: 570, payouts: 1330 },
    { date: 'May', revenue: 2500, fees: 750, payouts: 1750 },
    { date: 'Jun', revenue: 2800, fees: 840, payouts: 1960 },
    { date: 'Jul', revenue: 3000, fees: 900, payouts: 2100 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-medium">RM {entry.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Revenue Overview</h3>
          <p className="text-sm text-gray-600">Track revenue trends</p>
        </div>
        <div className="h-80 flex items-center justify-center text-gray-500">
          <p>No revenue data available</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPayouts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="date"
          stroke="#6B7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#6B7280' }}
        />
        <YAxis
          stroke="#6B7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#6B7280' }}
          tickFormatter={(value) => `RM ${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
          formatter={(value) => {
            const labels: { [key: string]: string } = {
              revenue: 'Total Revenue',
              fees: 'Platform Fees',
              payouts: 'Provider Payouts',
            };
            return labels[value] || value;
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#10B981"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorRevenue)"
          name="revenue"
        />
        <Area
          type="monotone"
          dataKey="fees"
          stroke="#3B82F6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorFees)"
          name="fees"
        />
        <Area
          type="monotone"
          dataKey="payouts"
          stroke="#8B5CF6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorPayouts)"
          name="payouts"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
