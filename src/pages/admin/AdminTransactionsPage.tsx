import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Receipt, Search } from 'lucide-react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Pagination } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/States';
import { formatNumber, formatDate, formatCurrency } from '@/lib/sms';
import type { Transaction, QueryParams } from '@/types';

export function AdminTransactionsPage() {
  const [params, setParams] = useState<QueryParams>({ page: 1, per_page: 25 });
  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', params],
    queryFn: async () => { const res = await api.admin.transactions(params); return res.data; },
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Transactions</h1><p className="text-sm text-gray-500 mt-1">Complete financial ledger</p></div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search transactions..." value={params.search || ''} onChange={e => setParams(p => ({ ...p, search: e.target.value, page: 1 }))} className="pl-10" />
          </div>
          <Select value={params.type || ''} onChange={e => setParams(p => ({ ...p, type: e.target.value, page: 1 }))} className="sm:w-48">
            <option value="">All Types</option>
            <option value="PURCHASE">Purchase</option>
            <option value="SMS_DEBIT">SMS Debit</option>
            <option value="BONUS">Bonus</option>
            <option value="REFUND">Refund</option>
            <option value="ADMIN_ADJUSTMENT">Admin Adjustment</option>
          </Select>
        </div>
        {data?.data.length ? (
          <>
            <DataTable<Transaction>
              columns={[
                { key: 'created_at', header: 'Date', render: t => <span className="text-gray-400">{formatDate(t.created_at)}</span> },
                { key: 'user_name', header: 'Customer', render: t => <span className="text-gray-700">{t.user_name}</span> },
                { key: 'type', header: 'Type', render: t => <Badge color="gray">{t.type.replace(/_/g, ' ')}</Badge> },
                { key: 'description', header: 'Description' },
                { key: 'credits', header: 'Credits', render: t => <span className={`font-semibold ${t.credits > 0 ? 'text-blue-600' : 'text-gray-600'}`}>{t.credits > 0 ? '+' : ''}{formatNumber(t.credits)}</span> },
                { key: 'amount', header: 'Amount', render: t => <span className="text-gray-500">{t.amount > 0 ? formatCurrency(t.amount) : '—'}</span> },
                { key: 'status', header: 'Status', render: t => <Badge color={t.status === 'completed' ? 'blue' : 'amber'}>{t.status}</Badge> },
              ]}
              data={data.data}
              loading={isLoading}
            />
            {data.meta && <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} total={data.meta.total} perPage={data.meta.per_page} onPageChange={page => setParams(p => ({ ...p, page }))} />}
          </>
        ) : <EmptyState icon={<Receipt className="w-8 h-8" />} title="No transactions" message="Transaction records will appear here." />}
      </Card>
    </div>
  );
}
