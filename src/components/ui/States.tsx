import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse bg-gray-200 rounded', className)} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto" />
        <p className="mt-4 text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        {message && <p className="mt-2 text-sm text-gray-500">{message}</p>}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-400 mb-4">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-6 px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
          Try again
        </button>
      )}
    </div>
  );
}
