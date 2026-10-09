import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/lib/sms';
import type { PricingTier } from '@/types';

export function AdminPricingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editTier, setEditTier] = useState<PricingTier | null>(null);
  const [showDelete, setShowDelete] = useState<PricingTier | null>(null);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({ default_price_per_sms: 0.50, free_registration_credits: 5, low_balance_threshold: 100, max_message_length: 918, minimum_purchase: 500 });
  const [tierForm, setTierForm] = useState({ min_quantity: 0, max_quantity: 0, price_per_sms: 0, label: '', active: true });
  const [savingConfig, setSavingConfig] = useState(false);

  const { data: pricing } = useQuery({
    queryKey: ['admin-pricing'],
    queryFn: async () => { const res = await api.admin.pricing(); return res.data; },
  });
  const { data: tiers } = useQuery({
    queryKey: ['admin-tiers'],
    queryFn: async () => { const res = await api.admin.tiers(); return res.data; },
  });

  // Sync config from server
  useState(() => {
    if (pricing) setConfig({
      default_price_per_sms: pricing.default_price_per_sms,
      free_registration_credits: pricing.free_registration_credits,
      low_balance_threshold: pricing.low_balance_threshold,
      max_message_length: pricing.max_message_length,
      minimum_purchase: pricing.minimum_purchase,
    });
  });

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await api.admin.updatePricing(config);
      if (res.success) { toast(res.message, 'success'); queryClient.invalidateQueries({ queryKey: ['admin-pricing'] }); queryClient.invalidateQueries({ queryKey: ['pricing'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to save pricing', 'error'); }
    setSavingConfig(false);
  };

  const handleSaveTier = async () => {
    setLoading(true);
    try {
      const data = { ...tierForm, max_quantity: tierForm.max_quantity || null };
      if (editTier) {
        const res = await api.admin.updateTier(editTier.id, data);
        if (res.success) { toast(res.message, 'success'); queryClient.invalidateQueries({ queryKey: ['admin-tiers'] }); }
        else toast(res.message, 'error');
      } else {
        const res = await api.admin.createTier(data);
        if (res.success) { toast(res.message, 'success'); queryClient.invalidateQueries({ queryKey: ['admin-tiers'] }); }
        else toast(res.message, 'error');
      }
      setShowAdd(false); setEditTier(null);
    } catch { toast('Failed to save tier', 'error'); }
    setLoading(false);
  };

  const handleDeleteTier = async () => {
    if (!showDelete) return;
    setLoading(true);
    try {
      const res = await api.admin.deleteTier(showDelete.id);
      if (res.success) { toast(res.message, 'success'); queryClient.invalidateQueries({ queryKey: ['admin-tiers'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to delete tier', 'error'); }
    setLoading(false); setShowDelete(null);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Pricing Management</h1><p className="text-sm text-gray-500 mt-1">Configure SMS pricing and volume tiers</p></div>

      <Card>
        <CardHeader title="General Pricing Configuration" icon={<CreditCard className="w-5 h-5" />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Default Price per SMS (KSh)"><Input type="number" step="0.01" value={config.default_price_per_sms} onChange={e => setConfig(c => ({ ...c, default_price_per_sms: parseFloat(e.target.value) || 0 }))} /></Field>
          <Field label="Free Registration Credits"><Input type="number" value={config.free_registration_credits} onChange={e => setConfig(c => ({ ...c, free_registration_credits: parseInt(e.target.value) || 0 }))} /></Field>
          <Field label="Low Balance Threshold"><Input type="number" value={config.low_balance_threshold} onChange={e => setConfig(c => ({ ...c, low_balance_threshold: parseInt(e.target.value) || 0 }))} /></Field>
          <Field label="Max Message Length"><Input type="number" value={config.max_message_length} onChange={e => setConfig(c => ({ ...c, max_message_length: parseInt(e.target.value) || 0 }))} /></Field>
          <Field label="Minimum Purchase"><Input type="number" value={config.minimum_purchase} onChange={e => setConfig(c => ({ ...c, minimum_purchase: parseInt(e.target.value) || 0 }))} /></Field>
        </div>
        <div className="mt-4"><Button onClick={handleSaveConfig} loading={savingConfig}><Save className="w-4 h-4" /> Save Configuration</Button></div>
      </Card>

      <Card padding="none">
        <div className="flex items-center justify-between p-6">
          <div><h3 className="font-semibold text-gray-900">Volume Pricing Tiers</h3><p className="text-sm text-gray-500 mt-0.5">Set tiered pricing based on SMS volume</p></div>
          <Button onClick={() => { setEditTier(null); setTierForm({ min_quantity: 0, max_quantity: 0, price_per_sms: 0, label: '', active: true }); setShowAdd(true); }}><Plus className="w-4 h-4" /> Add Tier</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-y border-gray-200 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Label</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Min Qty</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Max Qty</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Price/SMS</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {(tiers || []).map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{t.label || '—'}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{t.min_quantity.toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{t.max_quantity ? t.max_quantity.toLocaleString() : 'Unlimited'}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-blue-600">{formatCurrency(t.price_per_sms)}</td>
                  <td className="px-6 py-3"><Badge color={t.active ? 'green' : 'gray'}>{t.active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-6 py-3"><div className="flex gap-1">
                    <button onClick={() => { setEditTier(t); setTierForm({ min_quantity: t.min_quantity, max_quantity: t.max_quantity || 0, price_per_sms: t.price_per_sms, label: t.label || '', active: t.active }); setShowAdd(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setShowDelete(t)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditTier(null); }} title={editTier ? 'Edit Tier' : 'Add Pricing Tier'} footer={<><Button variant="outline" onClick={() => { setShowAdd(false); setEditTier(null); }}>Cancel</Button><Button onClick={handleSaveTier} loading={loading}>Save Tier</Button></>}>
        <div className="space-y-4">
          <Field label="Label"><Input value={tierForm.label} onChange={e => setTierForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Business" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Min Quantity" required><Input type="number" value={tierForm.min_quantity} onChange={e => setTierForm(f => ({ ...f, min_quantity: parseInt(e.target.value) || 0 }))} /></Field>
            <Field label="Max Quantity" hint="0 = unlimited"><Input type="number" value={tierForm.max_quantity} onChange={e => setTierForm(f => ({ ...f, max_quantity: parseInt(e.target.value) || 0 }))} /></Field>
          </div>
          <Field label="Price per SMS (KSh)" required><Input type="number" step="0.01" value={tierForm.price_per_sms} onChange={e => setTierForm(f => ({ ...f, price_per_sms: parseFloat(e.target.value) || 0 }))} /></Field>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={tierForm.active} onChange={e => setTierForm(f => ({ ...f, active: e.target.checked }))} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> Active</label>
        </div>
      </Modal>

      <ConfirmDialog open={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDeleteTier} loading={loading} title="Delete Tier" message="Delete this pricing tier? This cannot be undone." confirmText="Delete" />
    </div>
  );
}
