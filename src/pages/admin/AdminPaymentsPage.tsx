import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Search } from 'lucide-react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Pagination } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/States';
import { formatCurrency, formatDateTime } from '@/lib/sms';
import type { Payment, QueryParams } from '@/types';

export function AdminPaymentsPage() {
  const [params, setParams] = useState<QueryParams>({ page: 1, per_page: 25 });
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', params],
    queryFn: async () => { const res = await api.admin.payments(params); return res.data; },
  });

  const payments = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Payments</h1><p className="text-sm text-gray-500 mt-1">All customer payments</p></div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search payments..." value={params.search || ''} onChange={e => setParams(p => ({ ...p, search: e.target.value, page: 1 }))} className="pl-10" />
          </div>
          <Select value={params.status || ''} onChange={e => setParams(p => ({ ...p, status: e.target.value, page: 1 }))} className="sm:w-48">
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </Select>
        </div>
        {payments.length ? (
          <>
            <DataTable<Payment>
              columns={[
                { key: 'receipt_number', header: 'Receipt', render: p => <span className="font-mono text-xs text-gray-700">{p.receipt_number}</span> },
                { key: 'user_name', header: 'Customer', render: p => <span className="text-gray-700">{p.user_name}</span> },
                { key: 'package_name', header: 'Package' },
                { key: 'sms_credits', header: 'SMS Credits', render: p => p.sms_credits.toLocaleString() },
                { key: 'amount', header: 'Amount', render: p => <span className="font-semibold text-gray-900">{formatCurrency(p.amount)}</span> },
                { key: 'payment_method', header: 'Method', render: p => <span className="uppercase text-xs">{p.payment_method}</span> },
                { key: 'status', header: 'Status', render: p => <Badge color={p.status === 'completed' ? 'blue' : p.status === 'pending' ? 'amber' : 'red'}>{p.status}</Badge> },
                { key: 'created_at', header: 'Date', render: p => <span className="text-gray-400">{formatDateTime(p.created_at)}</span> },
              ]}
              data={payments}
              loading={isLoading}
            />
            {meta && <Pagination currentPage={meta.current_page} lastPage={meta.last_page} total={meta.total} perPage={meta.per_page} onPageChange={page => setParams(p => ({ ...p, page }))} />}
          </>
        ) : <EmptyState icon={<DollarSign className="w-8 h-8" />} title="No payments" message="Payment records will appear here." />}
      </Card>
    </div>
  );
}
