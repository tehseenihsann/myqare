/**
 * Theme utility functions and constants
 */

export const themeColors = {
  primary: '#79BBE3',
  primaryLight: '#A8D4F0',
  primaryDark: '#5A9BC8',
  primaryHover: '#8CC8E8',
  background: '#F5F9FC',
  sidebar: '#E8F4FA',
  card: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#D1E7F5',
} as const;

/**
 * Get Tailwind classes that correspond to theme colors
 */
export const themeClasses = {
  primary: 'bg-[#79BBE3] hover:bg-[#8CC8E8]',
  primaryLight: 'bg-[#A8D4F0]',
  primaryDark: 'bg-[#5A9BC8]',
  background: 'bg-[#F5F9FC]',
  sidebar: 'bg-[#E8F4FA]',
  card: 'bg-white',
  border: 'border-[#D1E7F5]',
  text: 'text-[#1F2937]',
  textSecondary: 'text-[#6B7280]',
} as const;
