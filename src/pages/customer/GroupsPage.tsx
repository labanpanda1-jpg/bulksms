import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Users, Edit2, Trash2, Plus } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Field, Textarea } from '@/components/ui/Form';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/States';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/sms';
import type { ContactGroup } from '@/types';

export function GroupsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<ContactGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => { const res = await api.groups.list(); return res.data; },
  });

  const openAdd = () => { setForm({ name: '', description: '' }); setShowAdd(true); };
  const openEdit = (g: ContactGroup) => { setSelected(g); setForm({ name: g.name, description: g.description || '' }); setShowEdit(true); };
  const openDelete = (g: ContactGroup) => { setSelected(g); setShowDelete(true); };

  const handleAdd = async () => {
    if (!form.name) { toast('Group name is required', 'error'); return; }
    setLoading(true);
    try {
      const res = await api.groups.create(form.name, form.description);
      if (res.success) { toast(res.message, 'success'); setShowAdd(false); queryClient.invalidateQueries({ queryKey: ['groups'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to create group', 'error'); }
    setLoading(false);
  };

  const handleEdit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await api.groups.update(selected.id, form.name, form.description);
      if (res.success) { toast(res.message, 'success'); setShowEdit(false); queryClient.invalidateQueries({ queryKey: ['groups'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to update group', 'error'); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await api.groups.delete(selected.id);
      if (res.success) { toast(res.message, 'success'); setShowDelete(false); queryClient.invalidateQueries({ queryKey: ['groups'] }); queryClient.invalidateQueries({ queryKey: ['contacts'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to delete group', 'error'); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Groups</h1><p className="text-sm text-gray-500 mt-1">Organize contacts into groups</p></div>
        <Button onClick={openAdd}><Plus className="w-4 h-4" /> Create Group</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />)}</div>
      ) : groups && groups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(g => (
            <Card key={g.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Users className="w-6 h-6" /></div>
                  <div><h3 className="font-semibold text-gray-900">{g.name}</h3><p className="text-xs text-gray-400">{formatDate(g.created_at)}</p></div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(g)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => openDelete(g)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {g.description && <p className="text-sm text-gray-500 mt-3">{g.description}</p>}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Contacts</span>
                <span className="text-lg font-bold text-blue-600">{g.contact_count}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card><EmptyState icon={<UserPlus className="w-8 h-8" />} title="No groups yet" message="Create groups to organize your contacts for easier campaign targeting." action={<Button size="sm" onClick={openAdd}><Plus className="w-4 h-4" /> Create Group</Button>} /></Card>
      )}

      <Modal open={showAdd || showEdit} onClose={() => { setShowAdd(false); setShowEdit(false); }} title={showEdit ? 'Edit Group' : 'Create Group'} footer={<><Button variant="outline" onClick={() => { setShowAdd(false); setShowEdit(false); }}>Cancel</Button><Button onClick={showEdit ? handleEdit : handleAdd} loading={loading}>{showEdit ? 'Update' : 'Create'}</Button></>}>
        <div className="space-y-4">
          <Field label="Group Name" required><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Marketing" /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Optional description" /></Field>
        </div>
      </Modal>

      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} loading={loading} title="Delete Group" message={`Delete "${selected?.name}"? Contacts in this group will not be deleted but will lose their group association.`} confirmText="Delete" />
    </div>
  );
}
