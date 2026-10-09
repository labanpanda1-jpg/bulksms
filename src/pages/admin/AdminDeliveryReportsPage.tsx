import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Search, Download } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader, StatCard } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable, Pagination } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/States';
import { formatNumber, formatDate, formatCurrency } from '@/lib/sms';
import type { Campaign, QueryParams } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AdminDeliveryReportsPage() {
  const [params, setParams] = useState<QueryParams>({ page: 1, per_page: 25 });
  const { data, isLoading } = useQuery({
    queryKey: ['admin-campaigns-delivery', params],
    queryFn: async () => { const res = await api.admin.campaigns(params); return res.data; },
  });

  const campaigns = data?.data || [];
  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalDelivered = campaigns.reduce((s, c) => s + c.delivered, 0);
  const totalFailed = campaigns.reduce((s, c) => s + c.failed, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Delivery Reports</h1><p className="text-sm text-gray-500 mt-1">Platform-wide SMS delivery tracking</p></div>
        <Button variant="outline"><Download className="w-4 h-4" /> Export</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sent" value={formatNumber(totalSent)} icon={<FileText className="w-6 h-6" />} color="teal" />
        <StatCard label="Delivered" value={formatNumber(totalDelivered)} icon={<FileText className="w-6 h-6" />} color="green" />
        <StatCard label="Failed" value={formatNumber(totalFailed)} icon={<FileText className="w-6 h-6" />} color="red" />
        <StatCard label="Delivery Rate" value={totalSent > 0 ? `${((totalDelivered / totalSent) * 100).toFixed(1)}%` : '—'} icon={<FileText className="w-6 h-6" />} color="blue" />
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search..." value={params.search || ''} onChange={e => setParams(p => ({ ...p, search: e.target.value, page: 1 }))} className="pl-10" />
          </div>
          <Select value={params.status || ''} onChange={e => setParams(p => ({ ...p, status: e.target.value, page: 1 }))} className="sm:w-48">
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="FAILED">Failed</option>
          </Select>
        </div>
        {campaigns.length ? (
          <>
            <DataTable<Campaign>
              columns={[
                { key: 'name', header: 'Campaign', render: c => <span className="font-medium">{c.name}</span> },
                { key: 'user_name', header: 'Customer', render: c => <span className="text-gray-600">{c.user_name}</span> },
                { key: 'sent', header: 'Sent', render: c => formatNumber(c.sent) },
                { key: 'delivered', header: 'Delivered', render: c => <span className="text-green-600">{formatNumber(c.delivered)}</span> },
                { key: 'failed', header: 'Failed', render: c => <span className="text-red-500">{formatNumber(c.failed)}</span> },
                { key: 'status', header: 'Status', render: c => <StatusBadge status={c.status} /> },
                { key: 'created_at', header: 'Date', render: c => <span className="text-gray-400">{formatDate(c.created_at)}</span> },
              ]}
              data={campaigns}
              loading={isLoading}
            />
            {data?.meta && <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} total={data.meta.total} perPage={data.meta.per_page} onPageChange={page => setParams(p => ({ ...p, page }))} />}
          </>
        ) : <EmptyState icon={<FileText className="w-8 h-8" />} title="No delivery data" message="Delivery reports will appear here." />}
      </Card>
    </div>
  );
}
