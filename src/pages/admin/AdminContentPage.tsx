import { useEffect, useState } from 'react';
import { FileText, Plus, Save, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Form';
import { useToast } from '@/hooks/useToast';

type ContentItem = { id: string; title: string; category: string; excerpt: string; published: boolean };
const initial: ContentItem[] = [
  { id: '1', title: 'Why every Kenyan business needs a reliable SMS channel', category: 'Product updates', excerpt: 'Turn important customer moments into conversations with simple, trackable bulk messaging.', published: true },
  { id: '2', title: 'How to choose a memorable sender ID', category: 'Guides', excerpt: 'A practical guide to building recognition and trust across Safaricom, Airtel and Telkom.', published: true },
];

export function AdminContentPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<ContentItem[]>(() => { try { return JSON.parse(localStorage.getItem('abancool_content') || 'null') || initial; } catch { return initial; } });
  const [selected, setSelected] = useState<ContentItem | null>(items[0] || null);
  useEffect(() => { localStorage.setItem('abancool_content', JSON.stringify(items)); }, [items]);
  const save = () => { if (!selected?.title.trim()) return; setItems(items.map(item => item.id === selected.id ? selected : item)); toast('News article saved', 'success'); };
  const add = () => { const item = { id: crypto.randomUUID(), title: 'New ABANCOOL update', category: 'News', excerpt: 'Share an update with your customers.', published: false }; setItems([...items, item]); setSelected(item); };
  const remove = () => { if (!selected) return; const next = items.filter(item => item.id !== selected.id); setItems(next); setSelected(next[0] || null); toast('Article removed', 'success'); };
  return <div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900">Website Content</h1><p className="text-sm text-gray-500 mt-1">Manage the news and blog cards shown on your public website.</p></div><Button onClick={add}><Plus className="w-4 h-4" /> New article</Button></div><div className="grid lg:grid-cols-[.75fr_1.25fr] gap-6"><Card className="p-0 overflow-hidden"><div className="p-5 border-b border-gray-100"><p className="text-xs uppercase tracking-wider font-bold text-gray-400">Articles</p></div>{items.map(item => <button key={item.id} onClick={() => setSelected(item)} className={`w-full text-left p-5 border-b border-gray-100 hover:bg-gray-50 ${selected?.id === item.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}><div className="flex items-center justify-between gap-3"><span className="font-semibold text-gray-900 text-sm">{item.title}</span><span className={`text-[10px] uppercase font-bold ${item.published ? 'text-blue-600' : 'text-gray-400'}`}>{item.published ? 'Live' : 'Draft'}</span></div><p className="mt-1 text-xs text-gray-400">{item.category}</p></button>)}</Card>{selected ? <Card><CardHeader title="Edit article" icon={<FileText className="w-5 h-5" />} /><div className="space-y-4"><Field label="Title" required><Input value={selected.title} onChange={e => setSelected({ ...selected, title: e.target.value })} /></Field><Field label="Category"><Input value={selected.category} onChange={e => setSelected({ ...selected, category: e.target.value })} /></Field><Field label="Excerpt"><Textarea rows={5} value={selected.excerpt} onChange={e => setSelected({ ...selected, excerpt: e.target.value })} /></Field><label className="flex items-center gap-3 text-sm text-gray-700"><input type="checkbox" checked={selected.published} onChange={e => setSelected({ ...selected, published: e.target.checked })} className="rounded text-blue-600" /> Publish on public website</label><div className="flex justify-between pt-4 border-t border-gray-100"><Button variant="danger" onClick={remove}><Trash2 className="w-4 h-4" /> Delete</Button><Button onClick={save}><Save className="w-4 h-4" /> Save article</Button></div></div></Card> : <Card><p className="text-gray-500">Create an article to begin.</p></Card>}</div></div>;
}
