import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Radio, Plus, Clock, CheckCircle, XCircle, Upload, CreditCard } from 'lucide-react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Form';
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
  const [network, setNetwork] = useState('Safaricom');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [kraFile, setKraFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: senderIds, isLoading } = useQuery({ queryKey: ['sender-ids'], queryFn: async () => { const res = await api.senderIds.list(); return res.data; } });

  const handleRequest = async () => {
    if (!name) { toast('Sender ID name is required', 'error'); return; }
    if (!/^[A-Z0-9 ]{1,11}$/.test(name)) { toast('Use up to 11 letters or numbers only', 'error'); return; }
    if (!phone || !email || !kraFile || !certificateFile) { toast('Complete your details and upload both documents', 'error'); return; }
    setLoading(true);
    try {
      const res = await api.senderIds.request(name);
      if (res.success) { toast(`${res.message} ${network} STK Push requested for KES 7,500. Check your phone.`, 'success'); setShowRequest(false); setName(''); setPhone(''); setEmail(''); setKraFile(null); setCertificateFile(null); queryClient.invalidateQueries({ queryKey: ['sender-ids'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to request sender ID', 'error'); }
    setLoading(false);
  };

  return <div className="space-y-6">
    <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900">Sender IDs</h1><p className="text-sm text-gray-500 mt-1">Get a trusted business name across Kenyan networks</p></div><Button onClick={() => setShowRequest(true)}><Plus className="w-4 h-4" /> Buy Sender ID</Button></div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><PriceCard name="Safaricom" color="bg-sky-500" /><PriceCard name="Airtel" color="bg-red-500" /><PriceCard name="Telkom" color="bg-orange-500" /></div>
    {isLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />)}</div> : senderIds && senderIds.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{senderIds.map(sid => <Card key={sid.id}><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className={`w-12 h-12 rounded-lg flex items-center justify-center ${sid.status === 'APPROVED' ? 'bg-blue-50 text-blue-600' : sid.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}><Radio className="w-6 h-6" /></div><div><h3 className="font-semibold text-gray-900">{sid.name}</h3><p className="text-xs text-gray-400">{formatDate(sid.created_at)}</p></div></div><StatusBadge status={sid.status} /></div>{sid.status === 'PENDING' && <div className="mt-4 flex items-center gap-2 text-sm text-amber-600"><Clock className="w-4 h-4" /> Pending admin approval</div>}{sid.status === 'APPROVED' && <div className="mt-4 flex items-center gap-2 text-sm text-blue-600"><CheckCircle className="w-4 h-4" /> Ready to use</div>}{sid.status === 'REJECTED' && <div className="mt-4"><div className="flex items-center gap-2 text-sm text-red-600"><XCircle className="w-4 h-4" /> Rejected</div>{sid.rejection_reason && <p className="text-xs text-gray-500 mt-1">{sid.rejection_reason}</p>}</div>}</Card>)}</div> : <Card><EmptyState icon={<Radio className="w-8 h-8" />} title="No sender IDs" message="Buy a sender ID to start sending branded SMS campaigns." action={<Button size="sm" onClick={() => setShowRequest(true)}><Plus className="w-4 h-4" /> Buy Sender ID</Button>} /></Card>}
    <Modal open={showRequest} onClose={() => setShowRequest(false)} title="Buy a Sender ID" footer={<><Button variant="outline" onClick={() => setShowRequest(false)}>Cancel</Button><Button onClick={handleRequest} loading={loading}><CreditCard className="w-4 h-4" /> Pay KES 7,500</Button></>}><div className="space-y-4"><div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex items-start gap-3"><CreditCard className="w-5 h-5 text-blue-600 mt-0.5" /><div><p className="text-sm font-bold text-blue-900">M-Pesa Daraja STK Push</p><p className="text-xs text-blue-700 mt-1">A payment prompt will be sent to your phone after you submit.</p></div></div><Field label="Network" required><Select value={network} onChange={e => setNetwork(e.target.value)}><option>Safaricom</option><option>Airtel</option><option>Telkom</option></Select></Field><Field label="Sender ID name" required hint="Maximum 11 characters. Letters and numbers only."><Input value={name} onChange={e => setName(e.target.value.toUpperCase())} placeholder="ABANCOOL" maxLength={11} /></Field><div className="grid sm:grid-cols-2 gap-4"><Field label="M-Pesa phone" required><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712 345 678" /></Field><Field label="Approval email" required><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@business.co.ke" /></Field></div><div className="grid sm:grid-cols-2 gap-4"><DocumentUpload label="KRA PIN certificate" file={kraFile} onChange={setKraFile} /><DocumentUpload label="Business registration certificate" file={certificateFile} onChange={setCertificateFile} /></div><div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">After payment and document review, your sender ID will be approved within 48 hours. An invoice will be sent to your email.</div></div></Modal>
  </div>;
}

function PriceCard({ name, color }: { name: string; color: string }) { return <Card className="flex items-center gap-4"><div className={`w-10 h-10 rounded-xl ${color}`} /><div><p className="font-bold text-gray-900">{name}</p><p className="text-sm text-gray-500">KES 7,500 one-time</p></div></Card>; }
function DocumentUpload({ label, file, onChange }: { label: string; file: File | null; onChange: (file: File | null) => void }) { return <Field label={label} required><label className="flex min-h-[82px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 text-center hover:border-blue-400 hover:bg-blue-50 transition"><Upload className="w-5 h-5 text-gray-400" /><span className="text-xs font-medium text-gray-600">{file ? file.name : 'Upload PDF or image'}</span><input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={e => onChange(e.target.files?.[0] || null)} /></label></Field>; }
