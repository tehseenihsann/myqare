'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Palette } from 'lucide-react';

export default function ThemeToggle() {
  const { themeName, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative group"
      title={`Switch to ${themeName === 'blue' ? 'pink' : 'blue'} theme`}
    >
      <Palette className="w-5 h-5" />
      <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
        style={{ 
          backgroundColor: themeName === 'blue' ? '#79BBE3' : '#F8BBD0' 
        }}
      />
    </button>
  );
}
