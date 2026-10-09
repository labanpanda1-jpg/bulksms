import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Eye } from 'lucide-react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Pagination } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/States';
import { formatNumber, formatCurrency, formatDate } from '@/lib/sms';
import type { AdminCustomer, QueryParams } from '@/types';

export function AdminCustomersPage() {
  const [params, setParams] = useState<QueryParams>({ page: 1, per_page: 25 });
  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', params],
    queryFn: async () => { const res = await api.admin.customers(params); return res.data; },
  });

  const customers = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Customers</h1><p className="text-sm text-gray-500 mt-1">Manage all platform customers</p></div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by name, email, phone..." value={params.search || ''} onChange={e => setParams(p => ({ ...p, search: e.target.value, page: 1 }))} className="pl-10" />
          </div>
          <Select value={params.status || ''} onChange={e => setParams(p => ({ ...p, status: e.target.value, page: 1 }))} className="sm:w-48">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </Select>
        </div>

        {customers.length === 0 && !isLoading ? (
          <EmptyState icon={<Users className="w-8 h-8" />} title="No customers" message="Customers will appear here after registration." />
        ) : (
          <>
            <DataTable<AdminCustomer>
              columns={[
                { key: 'name', header: 'Customer', render: c => (
                  <Link to={`/admin/customers/${c.id}`} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white text-xs font-semibold">{c.name.charAt(0)}</div>
                    <div><p className="font-medium text-gray-900 hover:text-blue-600">{c.name}</p><p className="text-xs text-gray-400">{c.email}</p></div>
                  </Link>
                ) },
                { key: 'business_name', header: 'Business', render: c => <span className="text-gray-600">{c.business_name || '—'}</span> },
                { key: 'sms_balance', header: 'SMS Balance', render: c => <span className="font-semibold text-blue-600">{formatNumber(c.sms_balance)}</span> },
                { key: 'total_sent', header: 'Sent', render: c => formatNumber(c.total_sent) },
                { key: 'total_spent', header: 'Spent', render: c => formatCurrency(c.total_spent) },
                { key: 'status', header: 'Status', render: c => <Badge color={c.status === 'active' ? 'blue' : 'red'}>{c.status}</Badge> },
                { key: 'created_at', header: 'Joined', render: c => <span className="text-gray-400">{formatDate(c.created_at)}</span> },
                { key: 'actions', header: '', render: c => <Link to={`/admin/customers/${c.id}`} className="text-blue-600 hover:text-blue-700"><Eye className="w-4 h-4" /></Link> },
              ]}
              data={customers}
              loading={isLoading}
              onRowClick={c => window.location.href = `/admin/customers/${c.id}`}
            />
            {meta && <Pagination currentPage={meta.current_page} lastPage={meta.last_page} total={meta.total} perPage={meta.per_page} onPageChange={page => setParams(p => ({ ...p, page }))} />}
          </>
        )}
      </Card>
    </div>
  );
}
