import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Code, Plus, Copy, Trash2, Key, AlertCircle, Check } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/States';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatNumber } from '@/lib/sms';
import type { ApiKey } from '@/types';

export function DeveloperPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showRevoke, setShowRevoke] = useState(false);
  const [selected, setSelected] = useState<ApiKey | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);

  const { data: keys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => { const res = await api.apiKeys.list(); return res.data; },
  });

  const handleCreate = async () => {
    if (!name) { toast('Key name is required', 'error'); return; }
    setLoading(true);
    try {
      const res = await api.apiKeys.create(name);
      if (res.success) { toast(res.message, 'success'); setShowCreate(false); setNewKey(res.data.key); setName(''); queryClient.invalidateQueries({ queryKey: ['api-keys'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to create API key', 'error'); }
    setLoading(false);
  };

  const handleRevoke = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await api.apiKeys.revoke(selected.id);
      if (res.success) { toast(res.message, 'success'); setShowRevoke(false); queryClient.invalidateQueries({ queryKey: ['api-keys'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to revoke key', 'error'); }
    setLoading(false);
  };

  const copyKey = (key: string) => { navigator.clipboard.writeText(key); setCopied(key); setTimeout(() => setCopied(null), 2000); toast('Copied to clipboard', 'success'); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Developer API</h1><p className="text-sm text-gray-500 mt-1">Manage your API keys and access</p></div>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Generate Key</Button>
      </div>

      {newKey && (
        <Card className="border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Save your API key now</p>
              <p className="text-xs text-amber-700 mt-1">This key will only be shown once. Copy it now and store it securely.</p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs text-gray-700 font-mono break-all">{newKey}</code>
                <Button size="sm" variant="outline" onClick={() => copyKey(newKey)}>{copied === newKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
              </div>
              <Button size="sm" variant="ghost" className="mt-2" onClick={() => setNewKey(null)}>I've saved my key</Button>
            </div>
          </div>
        </Card>
      )}

      <Card padding="none">
        {keys && keys.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {keys.map(k => (
              <div key={k.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Key className="w-5 h-5" /></div>
                  <div>
                    <div className="flex items-center gap-2"><p className="text-sm font-medium text-gray-900">{k.name}</p><Badge color={k.status === 'active' ? 'green' : 'gray'}>{k.status}</Badge></div>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{k.key_preview}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatNumber(k.requests_count)} requests · {k.last_used ? `Last used ${formatDate(k.last_used)}` : 'Never used'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => copyKey(k.key)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-50"><Copy className="w-4 h-4" /></button>
                  {k.status === 'active' && <button onClick={() => { setSelected(k); setShowRevoke(true); }} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>
            ))}
          </div>
        ) : !isLoading && <EmptyState icon={<Code className="w-8 h-8" />} title="No API keys" message="Generate an API key to integrate ABANCOOL SMS with your applications." action={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Generate Key</Button>} />}
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader title="API Documentation" icon={<Code className="w-5 h-5" />} />
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Send SMS</p>
            <code className="block mt-2 bg-gray-900 text-gray-100 rounded-lg p-3 text-xs font-mono overflow-x-auto">POST /api/v1/messages/send</code>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Request Body</p>
            <code className="block mt-2 bg-gray-900 text-gray-100 rounded-lg p-3 text-xs font-mono overflow-x-auto">{`{
  "sender_id": "ABANCOOL",
  "to": ["254712345678"],
  "message": "Hello from ABANCOOL"
}`}</code>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Headers</p>
            <code className="block mt-2 bg-gray-900 text-gray-100 rounded-lg p-3 text-xs font-mono overflow-x-auto">{`Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`}</code>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-xs text-blue-700">All API requests require authentication with your API key. Never share your API key publicly.</div>
        </div>
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Generate API Key" footer={<><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button onClick={handleCreate} loading={loading}>Generate</Button></>}>
        <Field label="Key Name" required hint="Give your key a descriptive name"><Input value={name} onChange={e => setName(e.target.value)} placeholder="Production API Key" /></Field>
      </Modal>

      <ConfirmDialog open={showRevoke} onClose={() => setShowRevoke(false)} onConfirm={handleRevoke} loading={loading} title="Revoke API Key" message={`Are you sure you want to revoke "${selected?.name}"? Any applications using this key will stop working immediately.`} confirmText="Revoke" />
    </div>
  );
}
