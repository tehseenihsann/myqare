'use client';

import { useTheme } from '@/contexts/ThemeContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import MobileBottomNav from './MobileBottomNav';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: theme.background }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <AdminHeader />
          <main className="p-4 sm:p-6 lg:p-8 rounded-tl-3xl w-full min-h-[calc(100vh-70px)] " style={{ backgroundColor: theme.card }}>
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
