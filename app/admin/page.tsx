import DashboardStats from '@/components/admin/DashboardStats';
import RecentBookings from '@/components/admin/RecentBookings';
import RevenueChart from '@/components/admin/RevenueChart';
import QuickActions from '@/components/admin/QuickActions';
import DashboardBanner from '@/components/admin/DashboardBanner';

export default async function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 w-full">
      {/* Enhanced Header */}
      <DashboardBanner />

      {/* Statistics and Analytics First */}
      <DashboardStats />
      
      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Revenue Overview</h3>
          <p className="text-sm text-gray-600">Track revenue trends over time</p>
        </div>
        <RevenueChart data={[]} />
      </div>
      
      {/* Recent Bookings and Quick Actions Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentBookings />
        </div>
        
        {/* Quick Actions - Takes 1 column */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

