import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Radio, Check, X } from 'lucide-react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Field, Textarea } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/States';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/sms';
import type { SenderId } from '@/types';

export function AdminSenderIdsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<SenderId | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: senderIds } = useQuery({
    queryKey: ['admin-sender-ids'],
    queryFn: async () => { const res = await api.admin.senderIds(); return res.data; },
  });

  const handleApprove = async (sid: SenderId) => {
    setLoading(true);
    try {
      const res = await api.admin.approveSenderId(sid.id);
      if (res.success) { toast(res.message, 'success'); queryClient.invalidateQueries({ queryKey: ['admin-sender-ids'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to approve', 'error'); }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason) { toast('Reason is required', 'error'); return; }
    setLoading(true);
    try {
      const res = await api.admin.rejectSenderId(rejectTarget.id, rejectReason);
      if (res.success) { toast(res.message, 'success'); setRejectTarget(null); setRejectReason(''); queryClient.invalidateQueries({ queryKey: ['admin-sender-ids'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to reject', 'error'); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Sender IDs</h1><p className="text-sm text-gray-500 mt-1">Review and approve sender ID requests</p></div>

      <Card padding="none">
        {senderIds && senderIds.length ? (
          <div className="divide-y divide-gray-100">
            {senderIds.map(sid => (
              <div key={sid.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sid.status === 'APPROVED' ? 'bg-blue-50 text-blue-600' : sid.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}><Radio className="w-5 h-5" /></div>
                  <div>
                    <p className="font-medium text-gray-900">{sid.name}</p>
                    <p className="text-xs text-gray-400">Requested {formatDate(sid.created_at)}{sid.rejection_reason && ` · ${sid.rejection_reason}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={sid.status} />
                  {sid.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="success" onClick={() => handleApprove(sid)} loading={loading}><Check className="w-4 h-4" /> Approve</Button>
                      <Button size="sm" variant="danger" onClick={() => { setRejectTarget(sid); setRejectReason(''); }}><X className="w-4 h-4" /> Reject</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={<Radio className="w-8 h-8" />} title="No sender IDs" message="Sender ID requests will appear here." />}
      </Card>

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject Sender ID" footer={<><Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button><Button variant="danger" onClick={handleReject} loading={loading}>Reject</Button></>}>
        <Field label="Rejection Reason" required><Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="e.g. Name does not match registered business" /></Field>
      </Modal>
    </div>
  );
}
