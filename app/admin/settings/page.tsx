import SettingsForm from '@/components/admin/SettingsForm';

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage platform settings and configurations</p>
      </div>

      <SettingsForm />
    </div>
  );
}

