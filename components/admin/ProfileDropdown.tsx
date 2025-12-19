'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { User, Settings, LogOut } from 'lucide-react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export default function ProfileDropdown({ isOpen, onClose, user }: ProfileDropdownProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    // Handle logout logic here
    router.push('/login');
    onClose();
  };

  const menuItems = [
    {
      icon: User,
      label: 'My Profile',
      href: '/admin/profile',
      onClick: () => onClose(),
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/admin/settings',
      onClick: () => onClose(),
    },
    {
      icon: LogOut,
      label: 'Logout',
      href: '#',
      onClick: handleLogout,
      className: 'text-red-600 hover:bg-red-50',
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-gray-100/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className="fixed right-4 top-[72px] sm:right-6 sm:top-20 w-[90vw] sm:w-[280px] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 transform transition-all duration-200 opacity-100 translate-y-0"
        style={{ borderColor: theme.border }}
      >
        {/* User Info Header */}
        <div className="px-4 py-4 border-b" style={{ background: `linear-gradient(to right, ${theme.sidebar}, ${theme.primaryLight})`, borderColor: theme.border }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#4FC3F7] to-[#81D4FA] flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {user?.email || 'admin@myqare.com'}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-white/50 text-xs font-medium text-gray-700 rounded-full">
                {user?.role || 'Administrator'}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === menuItems.length - 1;

            return (
              <div key={item.label}>
                {item.href !== '#' ? (
                  <Link
                  href={item.href}
                  onClick={item.onClick}
                  className="flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-xl transition-all duration-200 text-gray-700"
                  onMouseEnter={(e) => {
                    if (!item.className?.includes('red')) {
                      e.currentTarget.style.backgroundColor = theme.primaryLight;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!item.className?.includes('red')) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: item.className?.includes('red') ? '#FEF2F2' : theme.primaryLight + '40' }}>
                      <Icon className={`w-5 h-5 ${
                        item.className?.includes('red') 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                  </Link>
                ) : (
                  <button
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-xl transition-all duration-200 text-gray-700"
                    style={item.className?.includes('red') ? {} : {
                      '--hover-bg': theme.primaryLight,
                      '--active-bg': theme.primary,
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      if (!item.className?.includes('red')) {
                        e.currentTarget.style.backgroundColor = theme.primaryLight;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!item.className?.includes('red')) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="p-2 rounded-lg" style={{ backgroundColor: item.className?.includes('red') ? '#FEF2F2' : theme.primaryLight + '40' }}>
                      <Icon className={`w-5 h-5 ${
                        item.className?.includes('red') 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
