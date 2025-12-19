'use client';

import { memo } from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loader = memo(function Loader({ size = 'md', className = '' }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin text-blue-600 ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
});

interface PageLoaderProps {
  message?: string;
}

export const PageLoader = memo(function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader size="lg" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
});

interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
}

export const SkeletonLoader = memo(function SkeletonLoader({
  lines = 3,
  className = '',
}: SkeletonLoaderProps) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded"
          style={{ width: i === lines - 1 ? '75%' : '100%' }}
        />
      ))}
    </div>
  );
});

export const TableLoader = memo(function TableLoader({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
});

