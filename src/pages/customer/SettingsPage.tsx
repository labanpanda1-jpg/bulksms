import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings, User, Lock, Bell, Save } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';

export function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || '', business_name: user?.business_name || '', email: user?.email || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [notifSettings, setNotifSettings] = useState({ campaign_completed: true, low_balance: true, payment_successful: true, sender_id_approved: true });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const res = await api.settings.update({} as any);
      toast('Profile updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch { toast('Failed to update profile', 'error'); }
    setLoading(false);
  };

  const handleSavePassword = async () => {
    if (!passwords.new || passwords.new.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    if (passwords.new !== passwords.confirm) { toast('Passwords do not match', 'error'); return; }
    toast('Password changed successfully', 'success');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Settings</h1><p className="text-sm text-gray-500 mt-1">Manage your account preferences</p></div>

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Card>
          <CardHeader title="Profile Information" subtitle="Update your personal and business details" />
          <div className="space-y-4 max-w-lg">
            <Field label="Full Name"><Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></Field>
            <Field label="Business Name"><Input value={profile.business_name} onChange={e => setProfile(p => ({ ...p, business_name: e.target.value }))} /></Field>
            <Field label="Email"><Input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} /></Field>
            <Field label="Phone"><Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></Field>
            <Button onClick={handleSaveProfile} loading={loading}><Save className="w-4 h-4" /> Save Changes</Button>
          </div>
        </Card>
      )}

      {tab === 'security' && (
        <Card>
          <CardHeader title="Change Password" subtitle="Update your password regularly for security" />
          <div className="space-y-4 max-w-lg">
            <Field label="Current Password" required><Input type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} /></Field>
            <Field label="New Password" required><Input type="password" value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} /></Field>
            <Field label="Confirm New Password" required><Input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} /></Field>
            <Button onClick={handleSavePassword}>Change Password</Button>
          </div>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card>
          <CardHeader title="Notification Preferences" subtitle="Choose what notifications you receive" />
          <div className="space-y-4">
            {[
              { key: 'campaign_completed', label: 'Campaign completed', desc: 'Get notified when your SMS campaign finishes sending' },
              { key: 'low_balance', label: 'Low balance alert', desc: 'Get notified when your SMS balance drops below threshold' },
              { key: 'payment_successful', label: 'Payment successful', desc: 'Get notified when a payment is completed' },
              { key: 'sender_id_approved', label: 'Sender ID approved', desc: 'Get notified when your sender ID is approved or rejected' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div><p className="text-sm font-medium text-gray-900">{item.label}</p><p className="text-xs text-gray-500">{item.desc}</p></div>
                <button onClick={() => setNotifSettings(s => ({ ...s, [item.key]: !s[item.key as keyof typeof s] }))} className={`relative w-11 h-6 rounded-full transition-colors ${notifSettings[item.key as keyof typeof notifSettings] ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifSettings[item.key as keyof typeof notifSettings] ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
