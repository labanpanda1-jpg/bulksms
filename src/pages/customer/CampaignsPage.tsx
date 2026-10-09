import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Mail, Plus, Search, Eye } from 'lucide-react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Form';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable, Pagination } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/States';
import { formatNumber, formatDate } from '@/lib/sms';
import type { Campaign, QueryParams } from '@/types';

export function CampaignsPage() {
  const [params, setParams] = useState<QueryParams>({ page: 1, per_page: 10 });
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', params],
    queryFn: async () => { const res = await api.campaigns.list(params); return res.data; },
  });

  const campaigns = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your SMS campaigns</p>
        </div>
        <Link to="/app/send-sms"><Button><Plus className="w-4 h-4" /> New Campaign</Button></Link>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search campaigns..."
              value={params.search || ''}
              onChange={e => setParams(p => ({ ...p, search: e.target.value, page: 1 }))}
              className="pl-10"
            />
          </div>
          <Select
            value={params.status || ''}
            onChange={e => setParams(p => ({ ...p, status: e.target.value, page: 1 }))}
            className="sm:w-48"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="DRAFT">Draft</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>

        <DataTable<Campaign>
          columns={[
            { key: 'name', header: 'Campaign', render: c => <span className="font-medium text-gray-900">{c.name}</span> },
            { key: 'sender_id', header: 'Sender ID' },
            { key: 'recipient_count', header: 'Recipients', render: c => formatNumber(c.recipient_count) },
            { key: 'sms_units', header: 'SMS Units', render: c => formatNumber(c.sms_units) },
            { key: 'status', header: 'Status', render: c => <StatusBadge status={c.status} /> },
            { key: 'delivered', header: 'Delivered', render: c => <span className="text-green-600">{formatNumber(c.delivered)}</span> },
            { key: 'failed', header: 'Failed', render: c => <span className="text-red-500">{formatNumber(c.failed)}</span> },
            { key: 'created_at', header: 'Created', render: c => <span className="text-gray-400">{formatDate(c.created_at)}</span> },
            { key: 'actions', header: '', render: c => <Link to={`/app/campaigns/${c.id}`} className="text-blue-600 hover:text-blue-700"><Eye className="w-4 h-4" /></Link> },
          ]}
          data={campaigns}
          loading={isLoading}
          onRowClick={c => window.location.href = `/app/campaigns/${c.id}`}
          emptyState={
            <EmptyState
              icon={<Mail className="w-8 h-8" />}
              title="No campaigns yet"
              message="Send your first SMS campaign and start reaching your customers."
              action={<Link to="/app/send-sms"><Button size="sm"><Plus className="w-4 h-4" /> Send SMS</Button></Link>}
            />
          }
        />
        {meta && (
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            total={meta.total}
            perPage={meta.per_page}
            onPageChange={page => setParams(p => ({ ...p, page }))}
          />
        )}
      </Card>
    </div>
  );
}
