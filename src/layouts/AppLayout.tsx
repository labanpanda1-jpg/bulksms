import { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Send, Mail, Calendar, FileText, Users, UserPlus,
  Upload, Wallet, Receipt, Radio, Code, BarChart3, Settings, Bell,
  MessageSquare, Menu, X, LogOut, Search, CreditCard, Shield,
  DollarSign, Package, ScrollText, type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { api } from '@/services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const customerNav: NavSection[] = [
  {
    title: '',
    items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' }],
  },
  {
    title: 'Messaging',
    items: [
      { label: 'Send SMS', icon: Send, path: '/app/send-sms' },
      { label: 'Campaigns', icon: Mail, path: '/app/campaigns' },
      { label: 'Scheduled', icon: Calendar, path: '/app/scheduled' },
      { label: 'Delivery Reports', icon: FileText, path: '/app/delivery-reports' },
    ],
  },
  {
    title: 'Contacts',
    items: [
      { label: 'Contacts', icon: Users, path: '/app/contacts' },
      { label: 'Groups', icon: UserPlus, path: '/app/groups' },
      { label: 'Import', icon: Upload, path: '/app/import' },
    ],
  },
  {
    title: 'SMS Account',
    items: [
      { label: 'Buy SMS', icon: Wallet, path: '/app/buy-sms' },
      { label: 'Transactions', icon: Receipt, path: '/app/transactions' },
    ],
  },
  {
    title: 'Other',
    items: [
      { label: 'Sender IDs', icon: Radio, path: '/app/sender-ids' },
      { label: 'Developer API', icon: Code, path: '/app/developer' },
      { label: 'Reports', icon: BarChart3, path: '/app/reports' },
      { label: 'Settings', icon: Settings, path: '/app/settings' },
    ],
  },
];

const adminNav: NavSection[] = [
  {
    title: '',
    items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' }],
  },
  {
    title: 'Management',
    items: [
      { label: 'Customers', icon: Users, path: '/admin/customers' },
    ],
  },
  {
    title: 'Messaging',
    items: [
      { label: 'Campaigns', icon: Mail, path: '/admin/campaigns' },
      { label: 'Delivery Reports', icon: FileText, path: '/admin/delivery-reports' },
    ],
  },
  {
    title: 'SMS Management',
    items: [
      { label: 'Pricing', icon: CreditCard, path: '/admin/pricing' },
      { label: 'Packages', icon: Package, path: '/admin/packages' },
      { label: 'Sender IDs', icon: Radio, path: '/admin/sender-ids' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Payments', icon: DollarSign, path: '/admin/payments' },
      { label: 'Transactions', icon: Receipt, path: '/admin/transactions' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'API', icon: Code, path: '/admin/api' },
      { label: 'Audit Logs', icon: ScrollText, path: '/admin/audit-logs' },
      { label: 'Settings', icon: Settings, path: '/admin/settings' },
    ],
  },
];

export function AppLayout({ role }: { role: 'customer' | 'admin' }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const nav = role === 'admin' ? adminNav : customerNav;
  const basePath = role === 'admin' ? '/admin' : '/app';

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.notifications.list();
      return res.data;
    },
    refetchInterval: 10000,
  });

  const notifications = notifData || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast('You have been logged out.', 'info');
    navigate('/login');
  };

  const markAllRead = async () => {
    await api.notifications.markAllRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40 transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-gray-200 flex-shrink-0">
          <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-gray-900">ABANCOOL</span>
            <p className="text-[10px] text-gray-400 font-medium leading-none">Bulk SMS</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {nav.map((section, si) => (
            <div key={si}>
              {section.title && (
                <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{section.title}</p>
              )}
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const active = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        active ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <Icon className="w-[18px] h-[18px]" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 p-3 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {role === 'admin' && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-lg">
                <Shield className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-medium text-teal-700">{user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</span>
              </div>
            )}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-40 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-900">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
                      ) : (
                        notifications.slice(0, 10).map(n => (
                          <div key={n.id} className={clsx('px-4 py-3 border-b border-gray-50', !n.read && 'bg-teal-50/30')}>
                            <div className="flex items-start gap-2">
                              {!n.read && <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />}
                              <div className={clsx('flex-1', n.read && 'pl-4')}>
                                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-sm font-semibold lg:hidden">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
