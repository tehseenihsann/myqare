'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  Users,
  Settings,
  FileText,
  Tag,
} from 'lucide-react';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/payments', label: 'Payments', icon: DollarSign },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();

  return (
    <aside className="hidden lg:block w-64 min-h-screen sticky top-0 self-start" style={{ backgroundColor: theme.sidebar, borderColor: theme.border }}>
      <nav className="p-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative w-32 h-16">
              <Image
                src="/logo.png"
                alt="MyQare Logo"
                fill
                sizes="128px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname?.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
                  style={{
                    backgroundColor: isActive ? theme.primary : 'transparent',
                    color: isActive ? theme.text : undefined,
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
                  <Icon className="w-5 h-5" />
                  <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

