import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/hooks/useToast';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/layouts/AppLayout';

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

// Customer pages
import { CustomerDashboard } from '@/pages/customer/CustomerDashboard';
import { SendSmsPage } from '@/pages/customer/SendSmsPage';
import { CampaignsPage } from '@/pages/customer/CampaignsPage';
import { CampaignDetailPage } from '@/pages/customer/CampaignDetailPage';
import { ScheduledPage } from '@/pages/customer/ScheduledPage';
import { DeliveryReportsPage } from '@/pages/customer/DeliveryReportsPage';
import { ContactsPage } from '@/pages/customer/ContactsPage';
import { GroupsPage } from '@/pages/customer/GroupsPage';
import { ImportPage } from '@/pages/customer/ImportPage';
import { BuySmsPage } from '@/pages/customer/BuySmsPage';
import { TransactionsPage } from '@/pages/customer/TransactionsPage';
import { SenderIdsPage } from '@/pages/customer/SenderIdsPage';
import { DeveloperPage } from '@/pages/customer/DeveloperPage';
import { ReportsPage } from '@/pages/customer/ReportsPage';
import { SettingsPage } from '@/pages/customer/SettingsPage';

// Admin pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminCustomersPage } from '@/pages/admin/AdminCustomersPage';
import { AdminCustomerDetailPage } from '@/pages/admin/AdminCustomerDetailPage';
import { AdminCampaignsPage } from '@/pages/admin/AdminCampaignsPage';
import { AdminDeliveryReportsPage } from '@/pages/admin/AdminDeliveryReportsPage';
import { AdminPricingPage } from '@/pages/admin/AdminPricingPage';
import { AdminPackagesPage } from '@/pages/admin/AdminPackagesPage';
import { AdminSenderIdsPage } from '@/pages/admin/AdminSenderIdsPage';
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage';
import { AdminTransactionsPage } from '@/pages/admin/AdminTransactionsPage';
import { AdminApiPage } from '@/pages/admin/AdminApiPage';
import { AdminAuditLogsPage } from '@/pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Customer routes */}
              <Route path="/app" element={<ProtectedRoute role="customer"><AppLayout role="customer" /></ProtectedRoute>}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="send-sms" element={<SendSmsPage />} />
                <Route path="campaigns" element={<CampaignsPage />} />
                <Route path="campaigns/:id" element={<CampaignDetailPage />} />
                <Route path="scheduled" element={<ScheduledPage />} />
                <Route path="delivery-reports" element={<DeliveryReportsPage />} />
                <Route path="contacts" element={<ContactsPage />} />
                <Route path="groups" element={<GroupsPage />} />
                <Route path="import" element={<ImportPage />} />
                <Route path="buy-sms" element={<BuySmsPage />} />
                <Route path="buy-sms/:receipt" element={<BuySmsPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="sender-ids" element={<SenderIdsPage />} />
                <Route path="developer" element={<DeveloperPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute role="admin"><AppLayout role="admin" /></ProtectedRoute>}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="customers/:id" element={<AdminCustomerDetailPage />} />
                <Route path="campaigns" element={<AdminCampaignsPage />} />
                <Route path="delivery-reports" element={<AdminDeliveryReportsPage />} />
                <Route path="pricing" element={<AdminPricingPage />} />
                <Route path="packages" element={<AdminPackagesPage />} />
                <Route path="sender-ids" element={<AdminSenderIdsPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="transactions" element={<AdminTransactionsPage />} />
                <Route path="api" element={<AdminApiPage />} />
                <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
