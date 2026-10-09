import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, Field } from '@/components/ui/Form';
import { useToast } from '@/hooks/useToast';
import { normalizePhoneNumber, isValidKenyanPhone } from '@/lib/sms';

export function ImportPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'result'>('upload');
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [groupId, setGroupId] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; duplicates: number; invalid: number; total: number } | null>(null);

  const { data: groups } = useQuery({ queryKey: ['groups'], queryFn: async () => { const res = await api.groups.list(); return res.data; } });

  const contactFields = ['name', 'phone', 'email', 'company'];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const hdrs = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows = lines.slice(1).map(l => l.split(',').map(c => c.trim()));
      setHeaders(hdrs);
      setCsvData(rows);
      const autoMap: Record<string, string> = {};
      contactFields.forEach(field => {
        const match = hdrs.find(h => h.includes(field) || (field === 'phone' && (h.includes('mobile') || h.includes('number') || h.includes('tel'))));
        if (match) autoMap[match] = field;
      });
      setMapping(autoMap);
      setStep('map');
    };
    reader.readAsText(file);
  };

  const mappedContacts = csvData.map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { if (mapping[h]) obj[mapping[h]] = row[i] || ''; });
    return obj;
  }).filter(c => c.phone);

  const validContacts = mappedContacts.filter(c => isValidKenyanPhone(c.phone));
  const invalidCount = mappedContacts.length - validContacts.length;

  const handleImport = async () => {
    setImporting(true);
    try {
      const contacts = mappedContacts.map(c => ({ name: c.name || '', phone: c.phone, email: c.email || '', company: c.company || '', group_id: groupId || undefined }));
      const res = await api.contacts.import(contacts);
      if (res.success) {
        setResult(res.data);
        setStep('result');
        toast(res.message, 'success');
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        queryClient.invalidateQueries({ queryKey: ['groups'] });
      } else toast(res.message, 'error');
    } catch { toast('Import failed', 'error'); }
    setImporting(false);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Import Contacts</h1><p className="text-sm text-gray-500 mt-1">Bulk import contacts from a CSV file</p></div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-sm">
        {['Upload', 'Map', 'Preview', 'Result'].map((s, i) => {
          const stepMap = { upload: 0, map: 1, preview: 2, result: 3 };
          const current = stepMap[step];
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${i <= current ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</div>
              <span className={i <= current ? 'text-gray-900 font-medium' : 'text-gray-400'}>{s}</span>
              {i < 3 && <ArrowRight className="w-4 h-4 text-gray-300" />}
            </div>
          );
        })}
      </div>

      {step === 'upload' && (
        <Card>
          <CardHeader title="Upload CSV File" subtitle="Upload a CSV file with your contacts" icon={<Upload className="w-5 h-5" />} />
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
            <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">CSV files only, max 10MB</p>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">Expected columns:</p>
            <p className="text-xs text-blue-600 mt-1">name, phone, email, company</p>
            <p className="text-xs text-blue-500 mt-2">Phone numbers should be Kenyan format (07XXXXXXXX or 2547XXXXXXXX)</p>
          </div>
        </Card>
      )}

      {step === 'map' && (
        <Card>
          <CardHeader title="Map Columns" subtitle="Match CSV columns to contact fields" icon={<ArrowRight className="w-5 h-5" />} />
          <div className="space-y-3">
            {headers.map(h => (
              <div key={h} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-32 truncate">{h}</span>
                <ArrowRight className="w-4 h-4 text-gray-300" />
                <Select value={mapping[h] || ''} onChange={e => setMapping(m => ({ ...m, [h]: e.target.value }))} className="flex-1">
                  <option value="">Skip this column</option>
                  {contactFields.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                </Select>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Field label="Add to group (optional)">
              <Select value={groupId} onChange={e => setGroupId(e.target.value)}>
                <option value="">No group</option>
                {groups?.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
            <Button onClick={() => setStep('preview')}>Preview</Button>
          </div>
        </Card>
      )}

      {step === 'preview' && (
        <Card padding="none">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Preview</h3>
            <p className="text-sm text-gray-500 mt-1">{validContacts.length} valid contacts ready to import, {invalidCount} invalid</p>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead><tr className="border-b border-gray-200 bg-gray-50">
                {contactFields.map(f => <th key={f} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{f}</th>)}
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Valid</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {mappedContacts.slice(0, 50).map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-700">{c.name || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{c.phone || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{c.email || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{c.company || '—'}</td>
                    <td className="px-4 py-2">{isValidKenyanPhone(c.phone) ? <CheckCircle className="w-4 h-4 text-blue-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 flex justify-end gap-3 border-t border-gray-100">
            <Button variant="outline" onClick={() => setStep('map')}>Back</Button>
            <Button onClick={handleImport} loading={importing} disabled={validContacts.length === 0}>Import {validContacts.length} Contacts</Button>
          </div>
        </Card>
      )}

      {step === 'result' && result && (
        <Card>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4"><CheckCircle className="w-8 h-8 text-blue-500" /></div>
            <h2 className="text-xl font-bold text-gray-900">Import Complete</h2>
            <p className="text-sm text-gray-500 mt-1">Your contacts have been imported successfully</p>
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto">
              <div className="text-center"><p className="text-3xl font-bold text-blue-600">{result.imported}</p><p className="text-xs text-gray-500 mt-1">Imported</p></div>
              <div className="text-center"><p className="text-3xl font-bold text-amber-600">{result.duplicates}</p><p className="text-xs text-gray-500 mt-1">Duplicates</p></div>
              <div className="text-center"><p className="text-3xl font-bold text-red-500">{result.invalid}</p><p className="text-xs text-gray-500 mt-1">Invalid</p></div>
            </div>
            <div className="mt-8 flex justify-center gap-3">
              <Button variant="outline" onClick={() => { setStep('upload'); setCsvData([]); setHeaders([]); setResult(null); }}>Import Another</Button>
              <Button onClick={() => window.location.href = '/app/contacts'}>View Contacts</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
