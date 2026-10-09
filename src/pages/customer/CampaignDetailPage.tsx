import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Mail, Send, CheckCircle, XCircle, Clock, X, Trash2, Users } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { formatNumber, formatDateTime, formatCurrency } from '@/lib/sms';
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

export function CampaignDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCancel, setShowCancel] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => { const res = await api.campaigns.get(id!); return res.data; },
    refetchInterval: (data: any) => data?.status === 'PROCESSING' ? 3000 : false,
  });

  if (isLoading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />)}</div>;
  if (!campaign) return <EmptyState icon={<Mail className="w-8 h-8" />} title="Campaign not found" message="This campaign may have been deleted." action={<Link to="/app/campaigns"><Button>Back to Campaigns</Button></Link>} />;

  const pieData = [
    { name: 'Delivered', value: campaign.delivered },
    { name: 'Failed', value: campaign.failed },
    { name: 'Pending', value: campaign.pending },
  ].filter(d => d.value > 0);

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await api.campaigns.cancel(id!);
      if (res.success) { toast(res.message, 'success'); queryClient.invalidateQueries({ queryKey: ['campaign', id] }); queryClient.invalidateQueries({ queryKey: ['campaigns'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to cancel campaign', 'error'); }
    setActionLoading(false);
    setShowCancel(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const res = await api.campaigns.delete(id!);
      if (res.success) { toast(res.message, 'success'); navigate('/app/campaigns'); }
      else toast(res.message, 'error');
    } catch { toast('Failed to delete campaign', 'error'); }
    setActionLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/app/campaigns" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Created {formatDateTime(campaign.created_at)}</p>
        </div>
        <StatusBadge status={campaign.status} />
        {(campaign.status === 'PROCESSING' || campaign.status === 'SCHEDULED') && <Button variant="danger" size="sm" onClick={() => setShowCancel(true)}><X className="w-4 h-4" /> Cancel</Button>}
        {(campaign.status === 'COMPLETED' || campaign.status === 'CANCELLED' || campaign.status === 'FAILED') && <Button variant="outline" size="sm" onClick={() => setShowDelete(true)}><Trash2 className="w-4 h-4" /> Delete</Button>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Recipients" value={formatNumber(campaign.recipient_count)} icon={<Users />} color="blue" />
        <StatCard label="SMS Units" value={formatNumber(campaign.sms_units)} icon={<Send />} color="blue" />
        <StatCard label="Cost" value={formatCurrency(campaign.cost)} icon={<Mail />} color="green" />
        <StatCard label="Delivery Rate" value={campaign.sent > 0 ? `${((campaign.delivered / campaign.sent) * 100).toFixed(1)}%` : '—'} icon={<CheckCircle />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Message" icon={<Mail className="w-5 h-5" />} />
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.message}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Sender ID:</span> <span className="font-medium text-gray-900">{campaign.sender_id}</span></div>
              <div><span className="text-gray-500">Currency:</span> <span className="font-medium text-gray-900">{campaign.currency}</span></div>
              {campaign.scheduled_at && <div><span className="text-gray-500">Scheduled:</span> <span className="font-medium text-gray-900">{formatDateTime(campaign.scheduled_at)}</span></div>}
            </div>
          </Card>

          <Card>
            <CardHeader title="Delivery Report" icon={<CheckCircle className="w-5 h-5" />} />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Phone</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Time</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {campaign.recipients.slice(0, 20).map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{r.phone}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{r.name || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-sm text-gray-400">{r.delivered_at ? formatDateTime(r.delivered_at) : r.sent_at ? formatDateTime(r.sent_at) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {campaign.recipients.length === 0 && <EmptyState icon={<Send className="w-8 h-8" />} title="No recipients" message="Recipient data will appear here once processing starts." />}
            </div>
          </Card>

          <Card>
            <CardHeader title="Timeline" icon={<Clock className="w-5 h-5" />} />
            <div className="space-y-4">
              {campaign.timeline.map((event, i) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-semibold">{i + 1}</div>
                    {i < campaign.timeline.length - 1 && <div className="w-0.5 h-8 bg-gray-200" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-gray-900">{event.event}</p>
                    <p className="text-xs text-gray-500">{event.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Delivery Statistics" />
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>}
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-gray-600">Delivered</span></div>
                <span className="font-medium text-gray-900">{formatNumber(campaign.delivered)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-gray-600">Failed</span></div>
                <span className="font-medium text-gray-900">{formatNumber(campaign.failed)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-gray-600">Pending</span></div>
                <span className="font-medium text-gray-900">{formatNumber(campaign.pending)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog open={showCancel} onClose={() => setShowCancel(false)} onConfirm={handleCancel} loading={actionLoading} title="Cancel Campaign" message="Are you sure you want to cancel this campaign? SMS credits for unsent messages will be refunded." confirmText="Yes, Cancel" />
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} loading={actionLoading} title="Delete Campaign" message="This will permanently delete the campaign and all its data. This action cannot be undone." confirmText="Delete" />
    </div>
  );
}

