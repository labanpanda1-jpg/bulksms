import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowLeft, Users, Send, Wallet, Mail, Ban, CheckCircle, Plus, Minus, Settings as SettingsIcon, Receipt } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Field, Input, Textarea } from '@/components/ui/Form';
import { DataTable } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/States';
import { useToast } from '@/hooks/useToast';
import { formatNumber, formatCurrency, formatDate, formatDateTime } from '@/lib/sms';

export function AdminCustomerDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'campaigns' | 'transactions'>('overview');
  const [showSuspend, setShowSuspend] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: customer } = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: async () => { const res = await api.admin.customer(id!); return res.data; },
  });
  const { data: campaignsData } = useQuery({
    queryKey: ['admin-customer-campaigns', id],
    queryFn: async () => { const res = await api.admin.campaigns({ search: customer?.name, per_page: 100 }); return res.data; },
    enabled: !!customer,
  });
  const { data: txData } = useQuery({
    queryKey: ['admin-customer-transactions', id],
    queryFn: async () => { const res = await api.admin.transactions({ search: customer?.name, per_page: 100 }); return res.data; },
    enabled: !!customer,
  });

  if (!customer) return <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />;

  const handleSuspend = async () => {
    setLoading(true);
    try {
      const res = await api.admin.suspendCustomer(id!, suspendReason);
      if (res.success) { toast(res.message, 'success'); setShowSuspend(false); queryClient.invalidateQueries({ queryKey: ['admin-customer', id] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to suspend customer', 'error'); }
    setLoading(false);
  };

  const handleActivate = async () => {
    setLoading(true);
    try {
      const res = await api.admin.activateCustomer(id!);
      if (res.success) { toast(res.message, 'success'); queryClient.invalidateQueries({ queryKey: ['admin-customer', id] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to activate customer', 'error'); }
    setLoading(false);
  };

  const handleAdjust = async () => {
    if (!adjustReason) { toast('Reason is required', 'error'); return; }
    setLoading(true);
    try {
      const res = await api.admin.adjustBalance(id!, adjustAmount, adjustReason);
      if (res.success) { toast(res.message, 'success'); setShowAdjust(false); setAdjustAmount(0); setAdjustReason(''); queryClient.invalidateQueries({ queryKey: ['admin-customer', id] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to adjust balance', 'error'); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/customers" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-sm text-gray-500">{customer.email} · {customer.business_name}</p>
        </div>
        <Badge color={customer.status === 'active' ? 'green' : 'red'}>{customer.status}</Badge>
        {customer.status === 'active' ? (
          <Button variant="danger" size="sm" onClick={() => setShowSuspend(true)}><Ban className="w-4 h-4" /> Suspend</Button>
        ) : (
          <Button variant="success" size="sm" onClick={handleActivate} loading={loading}><CheckCircle className="w-4 h-4" /> Activate</Button>
        )}
        <Button variant="outline" size="sm" onClick={() => setShowAdjust(true)}><Wallet className="w-4 h-4" /> Adjust Balance</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="SMS Balance" value={formatNumber(customer.sms_balance)} icon={<Wallet className="w-6 h-6" />} color="teal" />
        <StatCard label="Total Sent" value={formatNumber(customer.total_sent)} icon={<Send className="w-6 h-6" />} color="blue" />
        <StatCard label="Total Spent" value={formatCurrency(customer.total_spent)} icon={<Receipt className="w-6 h-6" />} color="green" />
        <StatCard label="Campaigns" value={formatNumber(customer.campaigns_count)} icon={<Mail className="w-6 h-6" />} color="amber" />
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {[{ id: 'overview', label: 'Overview' }, { id: 'campaigns', label: 'Campaigns' }, { id: 'transactions', label: 'Transactions' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <Card>
          <CardHeader title="Customer Details" icon={<SettingsIcon className="w-5 h-5" />} />
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Full Name" value={customer.name} />
            <DetailRow label="Business" value={customer.business_name || '—'} />
            <DetailRow label="Email" value={customer.email} />
            <DetailRow label="Phone" value={customer.phone} />
            <DetailRow label="Contacts" value={formatNumber(customer.contacts_count)} />
            <DetailRow label="Delivery Rate" value={customer.total_sent > 0 ? `${((customer.total_delivered / customer.total_sent) * 100).toFixed(1)}%` : '—'} />
            <DetailRow label="Joined" value={formatDate(customer.created_at)} />
            <DetailRow label="Status" value={<Badge color={customer.status === 'active' ? 'green' : 'red'}>{customer.status}</Badge>} />
          </div>
        </Card>
      )}

      {tab === 'campaigns' && (
        <Card padding="none">
          {campaignsData?.data?.length ? (
            <DataTable
              columns={[
                { key: 'name', header: 'Campaign', render: (c: any) => <span className="font-medium">{c.name}</span> },
                { key: 'sender_id', header: 'Sender' },
                { key: 'recipient_count', header: 'Recipients', render: (c: any) => formatNumber(c.recipient_count) },
                { key: 'status', header: 'Status', render: (c: any) => <StatusBadge status={c.status} /> },
                { key: 'created_at', header: 'Date', render: (c: any) => formatDate(c.created_at) },
              ]}
              data={campaignsData.data.filter((c: any) => c.user_id === id)}
            />
          ) : <EmptyState icon={<Mail className="w-8 h-8" />} title="No campaigns" message="This customer hasn't sent any campaigns yet." />}
        </Card>
      )}

      {tab === 'transactions' && (
        <Card padding="none">
          {txData?.data?.length ? (
            <DataTable
              columns={[
                { key: 'created_at', header: 'Date', render: (t: any) => <span className="text-gray-400">{formatDate(t.created_at)}</span> },
                { key: 'type', header: 'Type', render: (t: any) => <Badge color="gray">{t.type.replace(/_/g, ' ')}</Badge> },
                { key: 'description', header: 'Description' },
                { key: 'credits', header: 'Credits', render: (t: any) => <span className={t.credits > 0 ? 'text-green-600 font-semibold' : 'text-gray-600'}>{t.credits > 0 ? '+' : ''}{t.credits}</span> },
                { key: 'balance_after', header: 'Balance', render: (t: any) => formatNumber(t.balance_after) },
              ]}
              data={txData.data.filter((t: any) => t.user_id === id)}
            />
          ) : <EmptyState icon={<Receipt className="w-8 h-8" />} title="No transactions" message="This customer has no transactions." />}
        </Card>
      )}

      <ConfirmDialog open={showSuspend} onClose={() => setShowSuspend(false)} onConfirm={handleSuspend} loading={loading} title="Suspend Customer" message={`Are you sure you want to suspend ${customer.name}? They will lose access to the platform.`} confirmText="Suspend" variant="danger" />

      <Modal open={showAdjust} onClose={() => setShowAdjust(false)} title="Adjust SMS Balance" footer={<><Button variant="outline" onClick={() => setShowAdjust(false)}>Cancel</Button><Button onClick={handleAdjust} loading={loading}>Adjust Balance</Button></>}>
        <div className="space-y-4">
          <div className="p-3 bg-teal-50 rounded-lg text-sm text-teal-700">Current balance: <span className="font-bold">{formatNumber(customer.sms_balance)} SMS</span></div>
          <Field label="Adjustment Amount" required hint="Use positive to add, negative to remove">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setAdjustAmount(a => a + 100)}><Plus className="w-4 h-4" /></Button>
              <Input type="number" value={adjustAmount} onChange={e => setAdjustAmount(parseInt(e.target.value) || 0)} className="flex-1" />
              <Button variant="outline" size="icon" onClick={() => setAdjustAmount(a => a - 100)}><Minus className="w-4 h-4" /></Button>
            </div>
          </Field>
          <Field label="Reason" required><Textarea value={adjustReason} onChange={e => setAdjustReason(e.target.value)} rows={3} placeholder="e.g. Promotional bonus, correction, etc." /></Field>
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">New balance will be: <span className="font-bold text-teal-600">{formatNumber(customer.sms_balance + adjustAmount)} SMS</span></div>
        </div>
      </Modal>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><p className="text-xs text-gray-400 font-medium">{label}</p><p className="text-sm text-gray-900 mt-1">{value}</p></div>;
}
