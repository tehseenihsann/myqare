'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function DashboardBanner() {
  const { theme, themeName } = useTheme();

  // Define gradient colors based on theme
  const getGradientColors = () => {
    if (themeName === 'pink') {
      return {
        from: '#F8BBD0',
        via: '#FCE7F3',
        to: '#FCE7F3',
      };
    } else {
      // Blue theme
      return {
        from: theme.primary,
        via: theme.primaryLight,
        to: '#B3E5FC',
      };
    }
  };

  const gradient = getGradientColors();

  return (
    <div 
      className="rounded-2xl p-6 sm:p-8 shadow-lg"
      style={{
        background: `linear-gradient(to right, ${gradient.from}, ${gradient.via}, ${gradient.to})`,
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/90 text-sm sm:text-base">
            Welcome back! Here&apos;s what&apos;s happening with your platform today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-black/80 text-xs">Today</p>
            <p className="text-black font-semibold text-lg">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



