import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Search, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Form';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable, Pagination } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/States';
import { formatNumber, formatDate } from '@/lib/sms';
import type { Campaign, QueryParams } from '@/types';

export function AdminCampaignsPage() {
  const [params, setParams] = useState<QueryParams>({ page: 1, per_page: 25 });
  const { data, isLoading } = useQuery({
    queryKey: ['admin-campaigns', params],
    queryFn: async () => { const res = await api.admin.campaigns(params); return res.data; },
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">All Campaigns</h1><p className="text-sm text-gray-500 mt-1">Monitor all customer campaigns</p></div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search campaigns..." value={params.search || ''} onChange={e => setParams(p => ({ ...p, search: e.target.value, page: 1 }))} className="pl-10" />
          </div>
          <Select value={params.status || ''} onChange={e => setParams(p => ({ ...p, status: e.target.value, page: 1 }))} className="sm:w-48">
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="FAILED">Failed</option>
          </Select>
        </div>
        {data?.data.length ? (
          <>
            <DataTable<Campaign>
              columns={[
                { key: 'name', header: 'Campaign', render: c => <span className="font-medium text-gray-900">{c.name}</span> },
                { key: 'user_name', header: 'Customer', render: c => <span className="text-gray-600">{c.user_name}</span> },
                { key: 'sender_id', header: 'Sender' },
                { key: 'recipient_count', header: 'Recipients', render: c => formatNumber(c.recipient_count) },
                { key: 'sms_units', header: 'Units', render: c => formatNumber(c.sms_units) },
                { key: 'status', header: 'Status', render: c => <StatusBadge status={c.status} /> },
                { key: 'delivered', header: 'Delivered', render: c => <span className="text-blue-600">{formatNumber(c.delivered)}</span> },
                { key: 'created_at', header: 'Date', render: c => <span className="text-gray-400">{formatDate(c.created_at)}</span> },
                { key: 'actions', header: '', render: c => <Link to={`/admin/campaigns/${c.id}`} className="text-blue-600 hover:text-blue-700"><Eye className="w-4 h-4" /></Link> },
              ]}
              data={data.data}
              loading={isLoading}
            />
            {data.meta && <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} total={data.meta.total} perPage={data.meta.per_page} onPageChange={page => setParams(p => ({ ...p, page }))} />}
          </>
        ) : <EmptyState icon={<Mail className="w-8 h-8" />} title="No campaigns" message="Campaigns will appear here." />}
      </Card>
    </div>
  );
}
