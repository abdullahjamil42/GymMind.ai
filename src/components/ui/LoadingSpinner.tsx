'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
};

export default function LoadingSpinner({
  size = 'md',
  className,
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full border-gray-300 border-t-primary-600 animate-spin',
          sizeClasses[size]
        )}
      />
      {text && <p className="text-gray-600 text-sm font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Page loading skeleton
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white p-8 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-4" />
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-8" />
        
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-40" />
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="bg-gray-100 rounded-xl h-96" />
      </div>
    </div>
  );
}

// Button loading state
export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin',
        className
      )}
    />
  );
}
