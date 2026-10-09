import { type ReactNode } from 'react';
import clsx from 'clsx';

type BadgeColor = 'blue' | 'green' | 'red' | 'amber' | 'gray' | 'slate';

const badgeColors: Record<BadgeColor, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function Badge({ children, color = 'gray', className }: { children: ReactNode; color?: BadgeColor; className?: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border', badgeColors[color], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, BadgeColor> = {
    COMPLETED: 'green',
    PROCESSING: 'blue',
    SCHEDULED: 'amber',
    DRAFT: 'gray',
    FAILED: 'red',
    CANCELLED: 'gray',
    DELIVERED: 'green',
    SENT: 'blue',
    PENDING: 'amber',
    APPROVED: 'green',
    REJECTED: 'red',
    active: 'green',
    suspended: 'red',
    completed: 'green',
    pending: 'amber',
    refunded: 'gray',
  };
  const color = statusMap[status] || 'gray';
  return <Badge color={color}>{status}</Badge>;
}
