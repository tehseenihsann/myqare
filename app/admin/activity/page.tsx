import BookingActivityPage from '@/components/admin/BookingActivityPage';

export default function BookingActivity() {
  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Booking Activity</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Track all booking activities and changes</p>
      </div>

      <BookingActivityPage />
    </div>
  );
}

