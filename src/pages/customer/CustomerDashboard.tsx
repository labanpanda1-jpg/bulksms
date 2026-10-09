import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MessageSquare, Send, Mail, CheckCircle, TrendingUp, Users, Plus, Upload, Wallet, FileText, Clock, ArrowRight } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader, StatCard } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton, EmptyState, ErrorState } from '@/components/ui/States';
import { formatNumber, formatDate, formatCurrency } from '@/lib/sms';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function CustomerDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.dashboard.stats();
      return res.data;
    },
  });

  if (isError) return <ErrorState message="Failed to load dashboard data" onRetry={refetch} />;

  const stats = data;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's your SMS overview.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/app/send-sms"><Button size="md"><Send className="w-4 h-4" /> Send SMS</Button></Link>
          <Link to="/app/buy-sms"><Button variant="outline" size="md"><Wallet className="w-4 h-4" /> Buy SMS</Button></Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-28" />
              <div className="h-8 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-100 rounded w-20" />
            </div>
          ))
        ) : (
          <>
            <StatCard label="SMS Balance" value={formatNumber(stats?.balance || 0)} icon={<MessageSquare className="w-6 h-6" />} color="teal" />
            <StatCard label="Total Sent" value={formatNumber(stats?.total_sent || 0)} icon={<Send className="w-6 h-6" />} color="blue" />
            <StatCard label="Delivered" value={formatNumber(stats?.total_delivered || 0)} icon={<CheckCircle className="w-6 h-6" />} color="green" />
            <StatCard label="Delivery Rate" value={`${(stats?.delivery_rate || 0).toFixed(1)}%`} icon={<TrendingUp className="w-6 h-6" />} color="amber" />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Send SMS', icon: Send, path: '/app/send-sms', color: 'text-teal-600 bg-teal-50' },
          { label: 'Create Campaign', icon: Mail, path: '/app/campaigns', color: 'text-blue-600 bg-blue-50' },
          { label: 'Import Contacts', icon: Upload, path: '/app/import', color: 'text-purple-600 bg-purple-50' },
          { label: 'Buy SMS', icon: Wallet, path: '/app/buy-sms', color: 'text-green-600 bg-green-50' },
        ].map(action => (
          <Link key={action.label} to={action.path}>
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color} mb-3`}>
                <action.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-gray-900">{action.label}</p>
              <ArrowRight className="w-4 h-4 text-gray-400 mt-2 group-hover:text-teal-600 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="SMS Usage" subtitle="Last 30 days" icon={<TrendingUp className="w-5 h-5" />} />
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={stats?.usage_data || []}>
                  <defs>
                    <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="deliveredGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} interval={4} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Area type="monotone" dataKey="sent" stroke="#0d9488" fill="url(#sentGrad)" strokeWidth={2} name="Sent" />
                  <Area type="monotone" dataKey="delivered" stroke="#22c55e" fill="url(#deliveredGrad)" strokeWidth={2} name="Delivered" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Recent transactions */}
        <Card>
          <CardHeader title="Recent Transactions" action={<Link to="/app/transactions" className="text-xs text-teal-600 hover:underline">View all</Link>} icon={<Wallet className="w-5 h-5" />} />
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : stats?.recent_transactions?.length ? (
            <div className="space-y-2">
              {stats.recent_transactions.slice(0, 5).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                    <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.credits > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {tx.credits > 0 ? '+' : ''}{tx.credits} SMS
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<FileText className="w-8 h-8" />} title="No transactions" message="Your transactions will appear here" />
          )}
        </Card>
      </div>

      {/* Recent campaigns */}
      <Card>
        <CardHeader title="Recent Campaigns" action={<Link to="/app/campaigns" className="text-xs text-teal-600 hover:underline">View all</Link>} icon={<Mail className="w-5 h-5" />} />
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : stats?.recent_campaigns?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Campaign</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Sender</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Recipients</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recent_campaigns.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium max-w-xs truncate">
                      <Link to={`/app/campaigns/${c.id}`} className="hover:text-teal-600">{c.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.sender_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatNumber(c.recipient_count)}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-400">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<Mail className="w-8 h-8" />}
            title="No campaigns yet"
            message="Send your first SMS campaign and start reaching your customers."
            action={<Link to="/app/send-sms"><Button size="sm"><Plus className="w-4 h-4" /> Send SMS</Button></Link>}
          />
        )}
      </Card>
    </div>
  );
}
