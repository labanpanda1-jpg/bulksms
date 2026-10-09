import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Building2, MessageSquare, CreditCard, Bell } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Form';
import { useToast } from '@/hooks/useToast';
import type { SystemSettings } from '@/types';

export function AdminSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'general' | 'sms' | 'payments' | 'notifications'>('general');
  const [saving, setSaving] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => { const res = await api.admin.settings(); return res.data; },
  });

  const [form, setForm] = useState<Partial<SystemSettings>>({});

  // Sync form from loaded settings
  const currentForm = settings ? { ...settings, ...form } : form;

  const set = (key: keyof SystemSettings, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.admin.updateSettings(currentForm);
      if (res.success) { toast(res.message, 'success'); setForm({}); queryClient.invalidateQueries({ queryKey: ['admin-settings'] }); queryClient.invalidateQueries({ queryKey: ['admin-pricing'] }); queryClient.invalidateQueries({ queryKey: ['pricing'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to save settings', 'error'); }
    setSaving(false);
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Building2 },
    { id: 'sms' as const, label: 'SMS', icon: MessageSquare },
    { id: 'payments' as const, label: 'Payments', icon: CreditCard },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">System Settings</h1><p className="text-sm text-gray-500 mt-1">Configure platform-wide settings</p></div>

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <Card>
          <CardHeader title="General Settings" subtitle="Platform branding and contact" icon={<Building2 className="w-5 h-5" />} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Field label="Company Name"><Input value={currentForm.company_name || ''} onChange={e => set('company_name', e.target.value)} /></Field>
            <Field label="Support Email"><Input type="email" value={currentForm.support_email || ''} onChange={e => set('support_email', e.target.value)} /></Field>
            <Field label="Support Phone"><Input value={currentForm.support_phone || ''} onChange={e => set('support_phone', e.target.value)} /></Field>
            <Field label="Timezone">
              <Select value={currentForm.timezone || ''} onChange={e => set('timezone', e.target.value)}>
                <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                <option value="UTC">UTC</option>
              </Select>
            </Field>
          </div>
        </Card>
      )}

      {tab === 'sms' && (
        <Card>
          <CardHeader title="SMS Settings" subtitle="SMS defaults and limits" icon={<MessageSquare className="w-5 h-5" />} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Field label="Free Registration Credits"><Input type="number" value={currentForm.free_registration_credits || 0} onChange={e => set('free_registration_credits', parseInt(e.target.value) || 0)} /></Field>
            <Field label="Low Balance Threshold"><Input type="number" value={currentForm.low_balance_threshold || 0} onChange={e => set('low_balance_threshold', parseInt(e.target.value) || 0)} /></Field>
            <Field label="Default Price per SMS (KSh)"><Input type="number" step="0.01" value={currentForm.default_price_per_sms || 0} onChange={e => set('default_price_per_sms', parseFloat(e.target.value) || 0)} /></Field>
            <Field label="Max Message Length"><Input type="number" value={currentForm.max_message_length || 0} onChange={e => set('max_message_length', parseInt(e.target.value) || 0)} /></Field>
          </div>
        </Card>
      )}

      {tab === 'payments' && (
        <Card>
          <CardHeader title="Payment Settings" subtitle="Payment methods and limits" icon={<CreditCard className="w-5 h-5" />} />
          <div className="space-y-4 max-w-2xl">
            <Field label="Minimum Purchase (SMS)"><Input type="number" value={currentForm.minimum_purchase || 0} onChange={e => set('minimum_purchase', parseInt(e.target.value) || 0)} /></Field>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Accepted Payment Methods</p>
              <div className="flex gap-4">
                {['mpesa', 'card', 'bank_transfer'].map(m => (
                  <label key={m} className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={(currentForm.payment_methods || []).includes(m as any)} onChange={e => {
                      const methods = currentForm.payment_methods || [];
                      set('payment_methods', e.target.checked ? [...methods, m] : methods.filter(x => x !== m));
                    }} className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    {m === 'mpesa' ? 'M-Pesa' : m === 'card' ? 'Card' : 'Bank Transfer'}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card>
          <CardHeader title="Notification Settings" subtitle="Platform notification preferences" icon={<Bell className="w-5 h-5" />} />
          <div className="space-y-4 max-w-lg">
            {[
              { key: 'email_notifications', label: 'Email Notifications', desc: 'Send email notifications to customers' },
              { key: 'sms_notifications', label: 'SMS Notifications', desc: 'Send SMS notifications to customers' },
              { key: 'low_balance_alerts', label: 'Low Balance Alerts', desc: 'Automatically alert customers when balance is low' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div><p className="text-sm font-medium text-gray-900">{item.label}</p><p className="text-xs text-gray-500">{item.desc}</p></div>
                <button onClick={() => set(item.key as any, !currentForm[item.key as keyof SystemSettings])} className={`relative w-11 h-6 rounded-full transition-colors ${currentForm[item.key as keyof SystemSettings] ? 'bg-teal-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${currentForm[item.key as keyof SystemSettings] ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex justify-end"><Button onClick={handleSave} loading={saving}><Save className="w-4 h-4" /> Save Settings</Button></div>
    </div>
  );
}
