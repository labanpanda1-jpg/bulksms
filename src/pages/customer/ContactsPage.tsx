import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, Edit2, Trash2, Mail, Upload as UploadIcon } from 'lucide-react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Field } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Pagination } from '@/components/ui/Table';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/States';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/sms';
import type { Contact, ContactGroup, QueryParams } from '@/types';

export function ContactsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [params, setParams] = useState<QueryParams>({ page: 1, per_page: 25 });
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '', group_id: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', params],
    queryFn: async () => { const res = await api.contacts.list(params); return res.data; },
  });
  const { data: groupsData } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => { const res = await api.groups.list(); return res.data; },
  });
  const groups: ContactGroup[] = groupsData || [];
  const contacts = data?.data || [];
  const meta = data?.meta;

  const openAdd = () => { setForm({ name: '', phone: '', email: '', company: '', group_id: '' }); setShowAdd(true); };
  const openEdit = (c: Contact) => { setSelected(c); setForm({ name: c.name, phone: c.phone, email: c.email || '', company: c.company || '', group_id: c.group_id || '' }); setShowEdit(true); };
  const openDelete = (c: Contact) => { setSelected(c); setShowDelete(true); };

  const handleAdd = async () => {
    setLoading(true);
    try {
      const res = await api.contacts.create({ name: form.name, phone: form.phone, email: form.email, company: form.company, group_id: form.group_id || undefined });
      if (res.success) { toast(res.message, 'success'); setShowAdd(false); queryClient.invalidateQueries({ queryKey: ['contacts'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to add contact', 'error'); }
    setLoading(false);
  };

  const handleEdit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await api.contacts.update(selected.id, { name: form.name, phone: form.phone, email: form.email, company: form.company, group_id: form.group_id || undefined });
      if (res.success) { toast(res.message, 'success'); setShowEdit(false); queryClient.invalidateQueries({ queryKey: ['contacts'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to update contact', 'error'); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await api.contacts.delete(selected.id);
      if (res.success) { toast(res.message, 'success'); setShowDelete(false); queryClient.invalidateQueries({ queryKey: ['contacts'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to delete contact', 'error'); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Contacts</h1><p className="text-sm text-gray-500 mt-1">Manage your contact list</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/app/import'}><UploadIcon className="w-4 h-4" /> Import</Button>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Contact</Button>
        </div>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search contacts..." value={params.search || ''} onChange={e => setParams(p => ({ ...p, search: e.target.value, page: 1 }))} className="pl-10" />
          </div>
          <Select value={params.group_id || ''} onChange={e => setParams(p => ({ ...p, group_id: e.target.value, page: 1 }))} className="sm:w-48">
            <option value="">All Groups</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </Select>
        </div>

        {contacts.length === 0 && !isLoading ? (
          <EmptyState icon={<Users className="w-8 h-8" />} title="No contacts yet" message="Add your first contact or import a CSV file to get started." action={<Button size="sm" onClick={openAdd}><Plus className="w-4 h-4" /> Add Contact</Button>} />
        ) : (
          <>
            <DataTable<Contact>
              columns={[
                { key: 'name', header: 'Name', render: c => <span className="font-medium text-gray-900">{c.name}</span> },
                { key: 'phone', header: 'Phone' },
                { key: 'email', header: 'Email', render: c => <span className="text-gray-500">{c.email || '—'}</span> },
                { key: 'company', header: 'Company', render: c => <span className="text-gray-500">{c.company || '—'}</span> },
                { key: 'group_name', header: 'Group', render: c => c.group_name ? <Badge color="blue">{c.group_name}</Badge> : <span className="text-gray-400">—</span> },
                { key: 'status', header: 'Status', render: c => <Badge color={c.status === 'active' ? 'blue' : 'gray'}>{c.status}</Badge> },
                { key: 'created_at', header: 'Added', render: c => <span className="text-gray-400">{formatDate(c.created_at)}</span> },
                { key: 'actions', header: '', render: c => (
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); openDelete(c); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ) },
              ]}
              data={contacts}
              loading={isLoading}
            />
            {meta && <Pagination currentPage={meta.current_page} lastPage={meta.last_page} total={meta.total} perPage={meta.per_page} onPageChange={page => setParams(p => ({ ...p, page }))} />}
          </>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        open={showAdd || showEdit}
        onClose={() => { setShowAdd(false); setShowEdit(false); }}
        title={showEdit ? 'Edit Contact' : 'Add Contact'}
        footer={<>
          <Button variant="outline" onClick={() => { setShowAdd(false); setShowEdit(false); }}>Cancel</Button>
          <Button onClick={showEdit ? handleEdit : handleAdd} loading={loading}>{showEdit ? 'Update' : 'Add Contact'}</Button>
        </>}
      >
        <div className="space-y-4">
          <Field label="Full Name" required><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Mwangi" /></Field>
          <Field label="Phone Number" required hint="Format: 0712345678 or 254712345678"><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0712345678" /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" /></Field>
          <Field label="Company"><Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Company Ltd" /></Field>
          <Field label="Group">
            <Select value={form.group_id} onChange={e => setForm(f => ({ ...f, group_id: e.target.value }))}>
              <option value="">No group</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </Select>
          </Field>
        </div>
      </Modal>

      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} loading={loading} title="Delete Contact" message={`Are you sure you want to delete ${selected?.name}? This cannot be undone.`} confirmText="Delete" />
    </div>
  );
}
