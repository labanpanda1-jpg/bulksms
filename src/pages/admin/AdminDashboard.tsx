import { useQuery } from '@tanstack/react-query';
import { Users, Send, Wallet, DollarSign, AlertCircle, TrendingUp, UserCircle, BarChart3 } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader, StatCard } from '@/components/ui/Card';
import { formatNumber, formatCurrency } from '@/lib/sms';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => { const res = await api.admin.dashboard(); return res.data; },
  });

  const s = data;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1><p className="text-sm text-gray-500 mt-1">Platform overview and statistics</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-white rounded-xl border border-gray-200 animate-pulse" />) : (
          <>
            <StatCard label="Total Customers" value={formatNumber(s?.total_customers || 0)} icon={<Users className="w-6 h-6" />} color="blue" />
            <StatCard label="SMS Sent (Month)" value={formatNumber(s?.sms_sent_this_month || 0)} icon={<Send className="w-6 h-6" />} color="blue" />
            <StatCard label="Revenue" value={formatCurrency(s?.revenue || 0)} icon={<DollarSign className="w-6 h-6" />} color="green" />
            <StatCard label="Failed Messages" value={formatNumber(s?.failed_messages || 0)} icon={<AlertCircle className="w-6 h-6" />} color="red" />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? null : (
          <>
            <StatCard label="Active Customers" value={formatNumber(s?.active_customers || 0)} icon={<UserCircle className="w-6 h-6" />} color="blue" />
            <StatCard label="SMS Sent Today" value={formatNumber(s?.sms_sent_today || 0)} icon={<Send className="w-6 h-6" />} color="blue" />
            <StatCard label="Total Credits" value={formatNumber(s?.total_sms_credits || 0)} icon={<Wallet className="w-6 h-6" />} color="green" />
            <StatCard label="Pending Payments" value={formatNumber(s?.pending_payments || 0)} icon={<DollarSign className="w-6 h-6" />} color="amber" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="SMS Usage" subtitle="Last 30 days" icon={<BarChart3 className="w-5 h-5" />} />
          {isLoading ? <div className="h-64 bg-gray-100 rounded animate-pulse" /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={s?.sms_usage || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} interval={4} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} name="SMS Units" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader title="Revenue" subtitle="Last 30 days" icon={<DollarSign className="w-5 h-5" />} />
          {isLoading ? <div className="h-64 bg-gray-100 rounded animate-pulse" /> : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={s?.revenue_chart || []}>
                <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} interval={4} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Area type="monotone" dataKey="amount" stroke="#22c55e" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader title="Customer Growth" subtitle="Last 30 days" icon={<TrendingUp className="w-5 h-5" />} />
          {isLoading ? <div className="h-64 bg-gray-100 rounded animate-pulse" /> : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={s?.customer_growth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} interval={4} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2} name="Customers" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader title="Delivery Rate Trend" subtitle="Last 7 days" icon={<TrendingUp className="w-5 h-5" />} />
          {isLoading ? <div className="h-64 bg-gray-100 rounded animate-pulse" /> : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={s?.delivery_rate_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} name="Delivery Rate %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
