import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Plus, Clock, Mail } from 'lucide-react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { formatDateTime } from '@/lib/sms';
import type { Campaign } from '@/types';

export function ScheduledPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', { status: 'SCHEDULED' }],
    queryFn: async () => { const res = await api.campaigns.list({ status: 'SCHEDULED', per_page: 50 }); return res.data; },
  });

  const campaigns = (data?.data || []).filter((c: Campaign) => c.status === 'SCHEDULED');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scheduled SMS</h1>
          <p className="text-sm text-gray-500 mt-1">Your scheduled campaigns</p>
        </div>
        <Link to="/app/send-sms"><Button><Plus className="w-4 h-4" /> Schedule SMS</Button></Link>
      </div>

      <Card padding="none">
        {campaigns.length === 0 && !isLoading ? (
          <EmptyState icon={<Calendar className="w-8 h-8" />} title="No scheduled SMS" message="Schedule SMS campaigns to be sent at a later time." action={<Link to="/app/send-sms"><Button size="sm">Schedule SMS</Button></Link>} />
        ) : (
          <div className="divide-y divide-gray-100">
            {campaigns.map(c => (
              <Link key={c.id} to={`/app/campaigns/${c.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><Clock className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.sender_id} · {c.recipient_count} recipients · {c.sms_units} SMS</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">{c.scheduled_at ? formatDateTime(c.scheduled_at) : '—'}</p>
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
