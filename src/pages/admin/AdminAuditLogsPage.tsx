import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollText, Search } from 'lucide-react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Pagination } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/States';
import { formatDateTime } from '@/lib/sms';
import type { AuditLog, QueryParams } from '@/types';

export function AdminAuditLogsPage() {
  const [params, setParams] = useState<QueryParams>({ page: 1, per_page: 25 });
  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', params],
    queryFn: async () => { const res = await api.admin.auditLogs(params); return res.data; },
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1><p className="text-sm text-gray-500 mt-1">Track all admin actions</p></div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search audit logs..." value={params.search || ''} onChange={e => setParams(p => ({ ...p, search: e.target.value, page: 1 }))} className="pl-10" />
          </div>
        </div>
        {data?.data.length ? (
          <>
            <DataTable<AuditLog>
              columns={[
                { key: 'created_at', header: 'Timestamp', render: l => <span className="text-gray-400 text-xs">{formatDateTime(l.created_at)}</span> },
                { key: 'admin_name', header: 'Admin', render: l => <span className="font-medium text-gray-900">{l.admin_name}</span> },
                { key: 'action', header: 'Action', render: l => <Badge color="blue">{l.action.replace(/_/g, ' ')}</Badge> },
                { key: 'target', header: 'Target', render: l => <span className="text-gray-700">{l.target}</span> },
                { key: 'target_type', header: 'Type', render: l => <span className="text-gray-500 text-xs">{l.target_type}</span> },
                { key: 'ip', header: 'IP', render: l => <span className="text-gray-400 font-mono text-xs">{l.ip}</span> },
                { key: 'reason', header: 'Reason', render: l => <span className="text-gray-500 text-xs">{l.reason || '—'}</span> },
              ]}
              data={data.data}
              loading={isLoading}
            />
            {data.meta && <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} total={data.meta.total} perPage={data.meta.per_page} onPageChange={page => setParams(p => ({ ...p, page }))} />}
          </>
        ) : <EmptyState icon={<ScrollText className="w-8 h-8" />} title="No audit logs" message="Admin actions will be tracked here." />}
      </Card>
    </div>
  );
}
