import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Radio, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/States';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/sms';

export function SenderIdsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRequest, setShowRequest] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: senderIds, isLoading } = useQuery({
    queryKey: ['sender-ids'],
    queryFn: async () => { const res = await api.senderIds.list(); return res.data; },
  });

  const handleRequest = async () => {
    if (!name) { toast('Sender ID name is required', 'error'); return; }
    if (name.length > 11) { toast('Sender ID must be 11 characters or less', 'error'); return; }
    setLoading(true);
    try {
      const res = await api.senderIds.request(name);
      if (res.success) { toast(res.message, 'success'); setShowRequest(false); setName(''); queryClient.invalidateQueries({ queryKey: ['sender-ids'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to request sender ID', 'error'); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Sender IDs</h1><p className="text-sm text-gray-500 mt-1">Manage your sender identifiers</p></div>
        <Button onClick={() => setShowRequest(true)}><Plus className="w-4 h-4" /> Request Sender ID</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />)}</div>
      ) : senderIds && senderIds.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {senderIds.map(sid => (
            <Card key={sid.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${sid.status === 'APPROVED' ? 'bg-green-50 text-green-600' : sid.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                    <Radio className="w-6 h-6" />
                  </div>
                  <div><h3 className="font-semibold text-gray-900">{sid.name}</h3><p className="text-xs text-gray-400">{formatDate(sid.created_at)}</p></div>
                </div>
                <StatusBadge status={sid.status} />
              </div>
              {sid.status === 'PENDING' && <div className="mt-4 flex items-center gap-2 text-sm text-amber-600"><Clock className="w-4 h-4" /> Pending admin approval</div>}
              {sid.status === 'APPROVED' && <div className="mt-4 flex items-center gap-2 text-sm text-green-600"><CheckCircle className="w-4 h-4" /> Ready to use</div>}
              {sid.status === 'REJECTED' && <div className="mt-4"><div className="flex items-center gap-2 text-sm text-red-600"><XCircle className="w-4 h-4" /> Rejected</div>{sid.rejection_reason && <p className="text-xs text-gray-500 mt-1">{sid.rejection_reason}</p>}</div>}
            </Card>
          ))}
        </div>
      ) : (
        <Card><EmptyState icon={<Radio className="w-8 h-8" />} title="No sender IDs" message="Request a sender ID to start sending SMS campaigns." action={<Button size="sm" onClick={() => setShowRequest(true)}><Plus className="w-4 h-4" /> Request Sender ID</Button>} /></Card>
      )}

      <Modal open={showRequest} onClose={() => setShowRequest(false)} title="Request Sender ID" footer={<><Button variant="outline" onClick={() => setShowRequest(false)}>Cancel</Button><Button onClick={handleRequest} loading={loading}>Submit Request</Button></>}>
        <div className="space-y-4">
          <Field label="Sender ID Name" required hint="Maximum 11 characters. Alphanumeric only.">
            <Input value={name} onChange={e => setName(e.target.value.toUpperCase())} placeholder="ABANCOOL" maxLength={11} />
          </Field>
          <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-600">Your sender ID will be reviewed by our team before approval. This usually takes 1-2 business days.</div>
        </div>
      </Modal>
    </div>
  );
}
