import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form';
import { formatNumber } from '@/lib/sms';
import type { QueryParams } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const PIE_COLORS = ['#0d9488', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ReportsPage() {
  const [params, setParams] = useState<QueryParams>({});
  const { data, isLoading } = useQuery({
    queryKey: ['reports-overview-full', params],
    queryFn: async () => { const res = await api.reports.overview(params); return res.data; },
  });

  const r = data;
  const senderData = r?.by_sender || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Reports</h1><p className="text-sm text-gray-500 mt-1">Comprehensive SMS analytics</p></div>
        <Button variant="outline"><Download className="w-4 h-4" /> Export Report</Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input type="date" value={params.from || ''} onChange={e => setParams(p => ({ ...p, from: e.target.value }))} className="sm:w-48" />
          <Input type="date" value={params.to || ''} onChange={e => setParams(p => ({ ...p, to: e.target.value }))} className="sm:w-48" />
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sent" value={formatNumber(r?.total_sent || 0)} icon={<BarChart3 className="w-6 h-6" />} color="blue" />
        <StatCard label="Delivered" value={formatNumber(r?.total_delivered || 0)} icon={<BarChart3 className="w-6 h-6" />} color="blue" />
        <StatCard label="Failed" value={formatNumber(r?.total_failed || 0)} icon={<BarChart3 className="w-6 h-6" />} color="red" />
        <StatCard label="Total Cost" value={`KSh ${(r?.total_cost || 0).toLocaleString()}`} icon={<BarChart3 className="w-6 h-6" />} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Delivery Trend" subtitle="Sent vs Delivered vs Failed" />
          {isLoading ? <div className="h-64 bg-gray-100 rounded animate-pulse" /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={r?.by_date || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} interval={4} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="sent" fill="#0d9488" name="Sent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered" fill="#22c55e" name="Delivered" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader title="By Sender ID" subtitle="Message distribution" />
          {isLoading ? <div className="h-64 bg-gray-100 rounded animate-pulse" /> : senderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={senderData} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="sender_id">
                  {senderData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>}
        </Card>
      </div>
    </div>
  );
}
