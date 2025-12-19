import ReportsPage from '@/components/admin/ReportsPage';

export default function Reports() {
  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">View detailed reports and analytics</p>
      </div>

      <ReportsPage />
    </div>
  );
}

