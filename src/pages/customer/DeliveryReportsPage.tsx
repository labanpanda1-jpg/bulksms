import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Search, Download } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader, StatCard } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/States';
import { formatNumber, formatDateTime } from '@/lib/sms';
import type { QueryParams } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DeliveryReportsPage() {
  const [params, setParams] = useState<QueryParams>({ page: 1, per_page: 10 });
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['reports-overview', params],
    queryFn: async () => { const res = await api.reports.overview(params); return res.data; },
  });
  const { data: campaignData, isLoading: campLoading } = useQuery({
    queryKey: ['campaigns', params],
    queryFn: async () => { const res = await api.campaigns.list(params); return res.data; },
  });

  const r = reportData;
  const campaigns = campaignData?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Delivery Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Track SMS delivery performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Messages" value={formatNumber(r?.total_sent || 0)} icon={<FileText className="w-6 h-6" />} color="blue" />
        <StatCard label="Delivery Rate" value={`${(r?.delivery_rate || 0).toFixed(1)}%`} icon={<FileText className="w-6 h-6" />} color="green" />
        <StatCard label="Failed Rate" value={`${(r?.failed_rate || 0).toFixed(1)}%`} icon={<FileText className="w-6 h-6" />} color="red" />
        <StatCard label="Total SMS Units" value={formatNumber(r?.total_sms_units || 0)} icon={<FileText className="w-6 h-6" />} color="blue" />
      </div>

      <Card>
        <CardHeader title="Delivery Trend" subtitle="Last 30 days" />
        {reportLoading ? <div className="h-64 bg-gray-100 rounded animate-pulse" /> : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={r?.by_date || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} interval={4} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Bar dataKey="delivered" fill="#22c55e" name="Delivered" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search..." value={params.search || ''} onChange={e => setParams(p => ({ ...p, search: e.target.value, page: 1 }))} className="pl-10" />
          </div>
          <Select value={params.status || ''} onChange={e => setParams(p => ({ ...p, status: e.target.value, page: 1 }))} className="sm:w-48">
            <option value="">All Statuses</option>
            <option value="DELIVERED">Delivered</option>
            <option value="SENT">Sent</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </Select>
          <Button variant="outline" size="md"><Download className="w-4 h-4" /> Export</Button>
        </div>

        {campaigns.length === 0 && !campLoading ? (
          <EmptyState icon={<FileText className="w-8 h-8" />} title="No delivery reports" message="Delivery reports will appear here after you send campaigns." />
        ) : (
          <DataTable
            columns={[
              { key: 'name', header: 'Campaign', render: (c: any) => <span className="font-medium text-gray-900">{c.name}</span> },
              { key: 'sender_id', header: 'Sender' },
              { key: 'sent', header: 'Sent', render: (c: any) => formatNumber(c.sent) },
              { key: 'delivered', header: 'Delivered', render: (c: any) => <span className="text-green-600">{formatNumber(c.delivered)}</span> },
              { key: 'failed', header: 'Failed', render: (c: any) => <span className="text-red-500">{formatNumber(c.failed)}</span> },
              { key: 'status', header: 'Status', render: (c: any) => <StatusBadge status={c.status} /> },
              { key: 'created_at', header: 'Date', render: (c: any) => <span className="text-gray-400">{formatDateTime(c.created_at)}</span> },
            ]}
            data={campaigns}
            loading={campLoading}
          />
        )}
      </Card>
    </div>
  );
}
