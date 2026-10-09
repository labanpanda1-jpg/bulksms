import { type ReactNode } from 'react';
import clsx from 'clsx';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (item: T) => void;
  skeletonRows?: number;
}

export function DataTable<T extends { id: string }>({
  columns, data, loading, emptyState, onRowClick, skeletonRows = 5,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-6 bg-gray-100 rounded animate-pulse w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <div>{emptyState}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50">
            {columns.map(col => (
              <th
                key={col.key}
                className={clsx('px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map(item => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={clsx(
                'hover:bg-gray-50 transition-colors',
                onRowClick && 'cursor-pointer'
              )}
            >
              {columns.map(col => (
                <td key={col.key} className={clsx('px-4 py-3 text-sm text-gray-700 whitespace-nowrap', col.className)}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, lastPage, total, perPage, onPageChange }: PaginationProps) {
  if (total === 0) return null;
  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{from}</span> to{' '}
        <span className="font-medium text-gray-700">{to}</span> of{' '}
        <span className="font-medium text-gray-700">{total}</span> results
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <span className="text-sm text-gray-500 px-2">
          Page {currentPage} of {lastPage}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
