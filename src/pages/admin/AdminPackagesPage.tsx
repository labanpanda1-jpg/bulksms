import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Edit2, Trash2, Star } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatNumber } from '@/lib/sms';
import type { Package as Pkg } from '@/types';

export function AdminPackagesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editPkg, setEditPkg] = useState<Pkg | null>(null);
  const [deletePkg, setDeletePkg] = useState<Pkg | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', sms_quantity: 0, price: 0, discount: 0, active: true, featured: false, sort_order: 0, description: '' });

  const { data: packages } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: async () => { const res = await api.admin.packages(); return res.data; },
  });

  const openAdd = () => { setEditPkg(null); setForm({ name: '', sms_quantity: 0, price: 0, discount: 0, active: true, featured: false, sort_order: 0, description: '' }); setShowAdd(true); };
  const openEdit = (p: Pkg) => { setEditPkg(p); setForm({ name: p.name, sms_quantity: p.sms_quantity, price: p.price, discount: p.discount, active: p.active, featured: p.featured, sort_order: p.sort_order, description: p.description || '' }); setShowAdd(true); };

  const handleSave = async () => {
    if (!form.name || form.sms_quantity <= 0) { toast('Name and SMS quantity are required', 'error'); return; }
    setLoading(true);
    try {
      if (editPkg) {
        const res = await api.admin.updatePackage(editPkg.id, form);
        if (res.success) { toast(res.message, 'success'); queryClient.invalidateQueries({ queryKey: ['admin-packages'] }); queryClient.invalidateQueries({ queryKey: ['packages'] }); }
        else toast(res.message, 'error');
      } else {
        const res = await api.admin.createPackage(form);
        if (res.success) { toast(res.message, 'success'); queryClient.invalidateQueries({ queryKey: ['admin-packages'] }); queryClient.invalidateQueries({ queryKey: ['packages'] }); }
        else toast(res.message, 'error');
      }
      setShowAdd(false);
    } catch { toast('Failed to save package', 'error'); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deletePkg) return;
    setLoading(true);
    try {
      const res = await api.admin.deletePackage(deletePkg.id);
      if (res.success) { toast(res.message, 'success'); queryClient.invalidateQueries({ queryKey: ['admin-packages'] }); queryClient.invalidateQueries({ queryKey: ['packages'] }); }
      else toast(res.message, 'error');
    } catch { toast('Failed to delete package', 'error'); }
    setLoading(false); setDeletePkg(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Packages</h1><p className="text-sm text-gray-500 mt-1">Manage SMS credit packages</p></div>
        <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Package</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(packages || []).map(p => (
          <Card key={p.id} className={`relative ${p.featured ? 'border-blue-300 border-2' : ''}`}>
            {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge color="blue"><Star className="w-3 h-3" /> Featured</Badge></div>}
            <div className="text-center pt-2">
              <p className="text-sm font-medium text-gray-500">{p.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(p.sms_quantity)}</p>
              <p className="text-xs text-gray-400">SMS</p>
              <p className="text-xl font-bold text-blue-600 mt-3">{formatCurrency(p.price)}</p>
              {p.discount > 0 && <Badge color="blue" className="mt-1">{p.discount}% off</Badge>}
              <div className="flex items-center justify-center gap-2 mt-3">
                <Badge color={p.active ? 'blue' : 'gray'}>{p.active ? 'Active' : 'Inactive'}</Badge>
              </div>
              {p.description && <p className="text-xs text-gray-500 mt-2">{p.description}</p>}
              <div className="flex gap-2 mt-4 justify-center">
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Edit2 className="w-3.5 h-3.5" /> Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => setDeletePkg(p)} className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditPkg(null); }} title={editPkg ? 'Edit Package' : 'Add Package'} footer={<><Button variant="outline" onClick={() => { setShowAdd(false); setEditPkg(null); }}>Cancel</Button><Button onClick={handleSave} loading={loading}>Save</Button></>}>
        <div className="space-y-4">
          <Field label="Package Name" required><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Starter" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="SMS Quantity" required><Input type="number" value={form.sms_quantity} onChange={e => setForm(f => ({ ...f, sms_quantity: parseInt(e.target.value) || 0 }))} /></Field>
            <Field label="Price (KSh)" required><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Discount %"><Input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: parseInt(e.target.value) || 0 }))} /></Field>
            <Field label="Sort Order"><Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} /></Field>
          </div>
          <Field label="Description"><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></Field>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> Active</label>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> Featured</label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deletePkg} onClose={() => setDeletePkg(null)} onConfirm={handleDelete} loading={loading} title="Delete Package" message={`Delete "${deletePkg?.name}"? This cannot be undone.`} confirmText="Delete" />
    </div>
  );
}
