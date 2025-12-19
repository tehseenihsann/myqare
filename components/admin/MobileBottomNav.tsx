'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  Users,
  Settings,
  FileText,
  MoreVertical,
  X,
} from 'lucide-react';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/payments', label: 'Payments', icon: DollarSign },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const visibleItems = menuItems.slice(0, 4);
const moreItems = menuItems.slice(4);

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }

    if (isMoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Trigger animation after mount
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreOpen]);

  const handleMoreClick = () => {
    setIsMoreOpen(!isMoreOpen);
  };

  const handleLinkClick = () => {
    setIsMoreOpen(false);
  };

  const isItemActive = (href: string) => {
    return pathname === href || (href !== '/admin' && pathname?.startsWith(href));
  };

  const hasActiveInMore = moreItems.some(item => isItemActive(item.href));

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 shadow-lg border-t" style={{ backgroundColor: theme.sidebar, borderColor: theme.border }}>
        <div className="flex justify-around items-center px-1 py-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors flex-1 text-gray-600"
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
                <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
              </Link>
            );
          })}
          
          {/* More Button */}
          <div className="relative flex-1" ref={moreMenuRef}>
            <button
              onClick={handleMoreClick}
              className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors w-full text-gray-600"
              style={{
                backgroundColor: (hasActiveInMore || isMoreOpen) ? theme.primary : 'transparent',
                color: (hasActiveInMore || isMoreOpen) ? theme.text : undefined,
              }}
              onMouseEnter={(e) => {
                if (!hasActiveInMore && !isMoreOpen) {
                  e.currentTarget.style.backgroundColor = theme.primaryLight;
                }
              }}
              onMouseLeave={(e) => {
                if (!hasActiveInMore && !isMoreOpen) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <MoreVertical className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight text-center">More</span>
            </button>

            {/* More Menu Dropdown */}
            {isMoreOpen && (
              <div className={`absolute bottom-full right-0 mb-3 mr-1 w-[280px] max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-out ${
                isAnimating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
              }`}
              style={{ borderColor: theme.border }}
              >
                {/* Header */}
                <div className="px-4 py-3 border-b" style={{ background: `linear-gradient(to right, ${theme.sidebar}, ${theme.primaryLight})`, borderColor: theme.border }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">More Options</h3>
                    <button
                      onClick={handleMoreClick}
                      className="p-1 rounded-full hover:bg-white/50 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="py-2">
                  {moreItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = isItemActive(item.href);
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 px-4 py-3.5 mx-2 my-1 rounded-xl transition-all duration-200 text-gray-700"
                        style={{
                          backgroundColor: isActive ? theme.primary : 'transparent',
                          color: isActive ? theme.text : undefined,
                          fontWeight: isActive ? '600' : undefined,
                          boxShadow: isActive ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : undefined,
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
                        <div className="p-2 rounded-lg" style={{ backgroundColor: isActive ? 'rgba(255, 255, 255, 0.5)' : theme.primaryLight + '40' }}>
                          <Icon className={`w-5 h-5 ${
                            isActive ? 'text-gray-900' : 'text-gray-600'
                          }`} />
                        </div>
                        <span className="text-sm font-medium flex-1">{item.label}</span>
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#4FC3F7] to-[#81D4FA]"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {/* Overlay to darken background when more menu is open */}
      {isMoreOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-gray-100/30 backdrop-blur-sm z-[45] transition-opacity duration-200"
          onClick={() => setIsMoreOpen(false)}
        />
      )}
    </>
  );
}
