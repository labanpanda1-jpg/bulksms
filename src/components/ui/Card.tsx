import { type ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  none: '',
};

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div className={clsx('bg-white rounded-xl border border-gray-200 shadow-sm', paddingClasses[padding], className)}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, icon, className }: CardHeaderProps) {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)}>
      <div className="flex items-center gap-3">
        {icon && <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">{icon}</div>}
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  color?: 'blue' | 'amber' | 'red' | 'slate';
}

const statColors = {
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  slate: 'bg-slate-100 text-slate-600',
};

export function StatCard({ label, value, icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={clsx('text-xs font-medium mt-2', trend.positive ? 'text-blue-600' : 'text-red-600')}>
              {trend.value}
            </p>
          )}
        </div>
        <div className={clsx('w-12 h-12 rounded-lg flex items-center justify-center', statColors[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
