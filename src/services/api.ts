import * as mock from './mock';
import type {
  ApiResponse, User, AuthSession, RegisterRequest, LoginRequest,
  SmsBalance, SmsCalculateRequest, SmsCalculateResponse, SendSmsRequest,
  Campaign, CampaignDetail, Contact, ContactGroup, SenderId, PricingTier,
  Package, Payment, Transaction, ApiKey, AppNotification, AuditLog,
  SystemSettings, AdminDashboardStats, ReportOverview, QueryParams,
  PaginatedResponse, ImportResult, AdminCustomer,
} from '@/types';

const API_MODE = (import.meta.env.VITE_API_MODE || 'mock') as 'mock' | 'laravel';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

function getToken(): string {
  return localStorage.getItem('abancool_token') || '';
}

async function laravelFetch<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Something went wrong.');
  }
  return data;
}

// =========================
// Unified API - switches between mock and Laravel
// =========================
export const api = {
  mode: API_MODE,

  auth: {
    register: (req: RegisterRequest) =>
      API_MODE === 'laravel' ? laravelFetch<AuthSession>('/auth/register', { method: 'POST', body: JSON.stringify(req) }) : mockAuth_register(req),
    login: (req: LoginRequest) =>
      API_MODE === 'laravel' ? laravelFetch<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify(req) }) : mockAuth_login(req),
    me: () =>
      API_MODE === 'laravel' ? laravelFetch<User>('/auth/me') : mockAuth_me(getToken()),
    logout: () =>
      API_MODE === 'laravel' ? laravelFetch<null>('/auth/logout', { method: 'POST' }) : mockAuth_logout(getToken()),
    forgotPassword: (email: string) =>
      API_MODE === 'laravel' ? laravelFetch<null>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }) : mockAuth_forgotPassword(email),
  },

  dashboard: {
    stats: () =>
      API_MODE === 'laravel' ? laravelFetch<any>('/dashboard/stats') : mockDashboard_stats(getToken()),
  },

  sms: {
    balance: () =>
      API_MODE === 'laravel' ? laravelFetch<SmsBalance>('/sms/balance') : mockSms_balance(getToken()),
    calculate: (req: SmsCalculateRequest) =>
      API_MODE === 'laravel' ? laravelFetch<SmsCalculateResponse>('/sms/calculate', { method: 'POST', body: JSON.stringify(req) }) : mockSms_calculate(getToken(), req),
    send: (req: SendSmsRequest) =>
      API_MODE === 'laravel' ? laravelFetch<Campaign>('/sms/send', { method: 'POST', body: JSON.stringify(req) }) : mockSms_send(getToken(), req),
  },

  campaigns: {
    list: (params: QueryParams = {}) =>
      API_MODE === 'laravel' ? laravelFetch<PaginatedResponse<Campaign>>(`/campaigns?${new URLSearchParams(params as any)}`) : mockCampaigns_list(getToken(), params),
    get: (id: string) =>
      API_MODE === 'laravel' ? laravelFetch<CampaignDetail>(`/campaigns/${id}`) : mockCampaigns_get(getToken(), id),
    cancel: (id: string) =>
      API_MODE === 'laravel' ? laravelFetch<Campaign>(`/campaigns/${id}/cancel`, { method: 'POST' }) : mockCampaigns_cancel(getToken(), id),
    delete: (id: string) =>
      API_MODE === 'laravel' ? laravelFetch<null>(`/campaigns/${id}`, { method: 'DELETE' }) : mockCampaigns_delete(getToken(), id),
  },

  contacts: {
    list: (params: QueryParams = {}) =>
      API_MODE === 'laravel' ? laravelFetch<PaginatedResponse<Contact>>(`/contacts?${new URLSearchParams(params as any)}`) : mockContacts_list(getToken(), params),
    create: (data: Partial<Contact>) =>
      API_MODE === 'laravel' ? laravelFetch<Contact>('/contacts', { method: 'POST', body: JSON.stringify(data) }) : mockContacts_create(getToken(), data),
    update: (id: string, data: Partial<Contact>) =>
      API_MODE === 'laravel' ? laravelFetch<Contact>(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }) : mockContacts_update(getToken(), id, data),
    delete: (id: string) =>
      API_MODE === 'laravel' ? laravelFetch<null>(`/contacts/${id}`, { method: 'DELETE' }) : mockContacts_delete(getToken(), id),
    import: (contacts: Partial<Contact>[]) =>
      API_MODE === 'laravel' ? laravelFetch<ImportResult>('/contacts/import', { method: 'POST', body: JSON.stringify({ contacts }) }) : mockContacts_import(getToken(), contacts),
    export: () =>
      API_MODE === 'laravel' ? laravelFetch<Contact[]>('/contacts/export') : mockContacts_export(getToken()),
  },

  groups: {
    list: () =>
      API_MODE === 'laravel' ? laravelFetch<ContactGroup[]>('/groups') : mockGroups_list(getToken()),
    create: (name: string, description?: string) =>
      API_MODE === 'laravel' ? laravelFetch<ContactGroup>('/groups', { method: 'POST', body: JSON.stringify({ name, description }) }) : mockGroups_create(getToken(), name, description),
    update: (id: string, name: string, description?: string) =>
      API_MODE === 'laravel' ? laravelFetch<ContactGroup>(`/groups/${id}`, { method: 'PUT', body: JSON.stringify({ name, description }) }) : mockGroups_update(getToken(), id, name, description),
    delete: (id: string) =>
      API_MODE === 'laravel' ? laravelFetch<null>(`/groups/${id}`, { method: 'DELETE' }) : mockGroups_delete(getToken(), id),
  },

  senderIds: {
    list: () =>
      API_MODE === 'laravel' ? laravelFetch<SenderId[]>('/sender-ids') : mockSenderIds_list(getToken()),
    request: (name: string) =>
      API_MODE === 'laravel' ? laravelFetch<SenderId>('/sender-ids', { method: 'POST', body: JSON.stringify({ name }) }) : mockSenderIds_request(getToken(), name),
  },

  pricing: {
    get: () =>
      API_MODE === 'laravel' ? laravelFetch<any>('/pricing') : mockPricing_get(getToken()),
    packages: () =>
      API_MODE === 'laravel' ? laravelFetch<Package[]>('/packages') : mockPricing_packages(getToken()),
  },

  payments: {
    list: (params: QueryParams = {}) =>
      API_MODE === 'laravel' ? laravelFetch<PaginatedResponse<Payment>>(`/payments?${new URLSearchParams(params as any)}`) : mockPayments_list(getToken(), params),
    get: (id: string) =>
      API_MODE === 'laravel' ? laravelFetch<Payment>(`/payments/${id}`) : mockPayments_get(getToken(), id),
    create: (packageId: string, method: Payment['payment_method']) =>
      API_MODE === 'laravel' ? laravelFetch<Payment>('/payments', { method: 'POST', body: JSON.stringify({ package_id: packageId, payment_method: method }) }) : mockPayments_create(getToken(), packageId, method),
  },

  transactions: {
    list: (params: QueryParams = {}) =>
      API_MODE === 'laravel' ? laravelFetch<PaginatedResponse<Transaction>>(`/transactions?${new URLSearchParams(params as any)}`) : mockTransactions_list(getToken(), params),
    get: (id: string) =>
      API_MODE === 'laravel' ? laravelFetch<Transaction>(`/transactions/${id}`) : mockTransactions_get(getToken(), id),
  },

  apiKeys: {
    list: () =>
      API_MODE === 'laravel' ? laravelFetch<ApiKey[]>('/developer/api-keys') : mockApiKeys_list(getToken()),
    create: (name: string) =>
      API_MODE === 'laravel' ? laravelFetch<ApiKey>('/developer/api-keys', { method: 'POST', body: JSON.stringify({ name }) }) : mockApiKeys_create(getToken(), name),
    revoke: (id: string) =>
      API_MODE === 'laravel' ? laravelFetch<null>(`/developer/api-keys/${id}`, { method: 'DELETE' }) : mockApiKeys_revoke(getToken(), id),
  },

  notifications: {
    list: () =>
      API_MODE === 'laravel' ? laravelFetch<AppNotification[]>('/notifications') : mockNotifications_list(getToken()),
    markRead: (id: string) =>
      API_MODE === 'laravel' ? laravelFetch<null>(`/notifications/${id}/read`, { method: 'POST' }) : mockNotifications_markRead(getToken(), id),
    markAllRead: () =>
      API_MODE === 'laravel' ? laravelFetch<null>('/notifications/read-all', { method: 'POST' }) : mockNotifications_markAllRead(getToken()),
  },

  reports: {
    overview: (params: QueryParams = {}) =>
      API_MODE === 'laravel' ? laravelFetch<ReportOverview>(`/reports/overview?${new URLSearchParams(params as any)}`) : mockReports_overview(getToken(), params),
  },

  settings: {
    get: () =>
      API_MODE === 'laravel' ? laravelFetch<SystemSettings>('/settings') : mockSettings_get(getToken()),
    update: (data: Partial<SystemSettings>) =>
      API_MODE === 'laravel' ? laravelFetch<SystemSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) }) : mockSettings_update(getToken(), data),
  },

  admin: {
    dashboard: () =>
      API_MODE === 'laravel' ? laravelFetch<AdminDashboardStats>('/admin/dashboard') : mockAdmin_dashboard(getToken()),
    customers: (params: QueryParams = {}) =>
      API_MODE === 'laravel' ? laravelFetch<PaginatedResponse<AdminCustomer>>(`/admin/customers?${new URLSearchParams(params as any)}`) : mockAdmin_customers(getToken(), params),
    customer: (id: string) =>
      API_MODE === 'laravel' ? laravelFetch<AdminCustomer>(`/admin/customers/${id}`) : mockAdmin_customer(getToken(), id),
    updateCustomer: (id: string, data: Partial<User>) =>
      API_MODE === 'laravel' ? laravelFetch<User>(`/admin/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }) : mockAdmin_updateCustomer(getToken(), id, data),
    suspendCustomer: (id: string, reason: string) =>
      API_MODE === 'laravel' ? laravelFetch<User>(`/admin/customers/${id}/suspend`, { method: 'POST', body: JSON.stringify({ reason }) }) : mockAdmin_suspendCustomer(getToken(), id, reason),
    activateCustomer: (id: string) =>
      API_MODE === 'laravel' ? laravelFetch<User>(`/admin/customers/${id}/activate`, { method: 'POST' }) : mockAdmin_activateCustomer(getToken(), id),
    adjustBalance: (id: string, credits: number, reason: string) =>
      API_MODE === 'laravel' ? laravelFetch<any>(`/admin/customers/${id}/adjust-balance`, { method: 'POST', body: JSON.stringify({ credits, reason }) }) : mockAdmin_adjustBalance(getToken(), id, credits, reason),
    pricing: () =>
      API_MODE === 'laravel' ? laravelFetch<any>('/admin/pricing') : mockAdmin_pricing(getToken()),
    updatePricing: (data: any) =>
      API_MODE === 'laravel' ? laravelFetch<any>('/admin/pricing', { method: 'PUT', body: JSON.stringify(data) }) : mockAdmin_updatePricing(getToken(), data),
    tiers: () =>
      API_MODE === 'laravel' ? laravelFetch<PricingTier[]>('/admin/pricing/tiers') : mockAdmin_tiers(getToken()),
    createTier: (data: Partial<PricingTier>) =>
      API_MODE === 'laravel' ? laravelFetch<PricingTier>('/admin/pricing/tiers', { method: 'POST', body: JSON.stringify(data) }) : mockAdmin_createTier(getToken(), data),
    updateTier: (id: string, data: Partial<PricingTier>) =>
      API_MODE === 'laravel' ? laravelFetch<PricingTier>(`/admin/pricing/tiers/${id}`, { method: 'PUT', body: JSON.stringify(data) }) : mockAdmin_updateTier(getToken(), id, data),
    deleteTier: (id: string) =>
      API_MODE === 'laravel' ? laravelFetch<null>(`/admin/pricing/tiers/${id}`, { method: 'DELETE' }) : mockAdmin_deleteTier(getToken(), id),
    packages: () =>
      API_MODE === 'laravel' ? laravelFetch<Package[]>('/admin/packages') : mockAdmin_packages(getToken()),
    createPackage: (data: Partial<Package>) =>
      API_MODE === 'laravel' ? laravelFetch<Package>('/admin/packages', { method: 'POST', body: JSON.stringify(data) }) : mockAdmin_createPackage(getToken(), data),
    updatePackage: (id: string, data: Partial<Package>) =>
      API_MODE === 'laravel' ? laravelFetch<Package>(`/admin/packages/${id}`, { method: 'PUT', body: JSON.stringify(data) }) : mockAdmin_updatePackage(getToken(), id, data),
    deletePackage: (id: string) =>
      API_MODE === 'laravel' ? laravelFetch<null>(`/admin/packages/${id}`, { method: 'DELETE' }) : mockAdmin_deletePackage(getToken(), id),
    campaigns: (params: QueryParams = {}) =>
      API_MODE === 'laravel' ? laravelFetch<PaginatedResponse<Campaign>>(`/admin/campaigns?${new URLSearchParams(params as any)}`) : mockAdmin_campaigns(getToken(), params),
    campaign: (id: string) =>
      API_MODE === 'laravel' ? laravelFetch<CampaignDetail>(`/admin/campaigns/${id}`) : mockAdmin_campaign(getToken(), id),
    transactions: (params: QueryParams = {}) =>
      API_MODE === 'laravel' ? laravelFetch<PaginatedResponse<Transaction>>(`/admin/transactions?${new URLSearchParams(params as any)}`) : mockAdmin_transactions(getToken(), params),
    payments: (params: QueryParams = {}) =>
      API_MODE === 'laravel' ? laravelFetch<PaginatedResponse<Payment>>(`/admin/payments?${new URLSearchParams(params as any)}`) : mockAdmin_payments(getToken(), params),
    senderIds: () =>
      API_MODE === 'laravel' ? laravelFetch<SenderId[]>('/admin/sender-ids') : mockAdmin_senderIds(getToken()),
    approveSenderId: (id: string) =>
      API_MODE === 'laravel' ? laravelFetch<SenderId>(`/admin/sender-ids/${id}/approve`, { method: 'POST' }) : mockAdmin_approveSenderId(getToken(), id),
    rejectSenderId: (id: string, reason: string) =>
      API_MODE === 'laravel' ? laravelFetch<SenderId>(`/admin/sender-ids/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }) : mockAdmin_rejectSenderId(getToken(), id, reason),
    auditLogs: (params: QueryParams = {}) =>
      API_MODE === 'laravel' ? laravelFetch<PaginatedResponse<AuditLog>>(`/admin/audit-logs?${new URLSearchParams(params as any)}`) : mockAdmin_auditLogs(getToken(), params),
    settings: () =>
      API_MODE === 'laravel' ? laravelFetch<SystemSettings>('/admin/settings') : mockAdmin_settings(getToken()),
    updateSettings: (data: Partial<SystemSettings>) =>
      API_MODE === 'laravel' ? laravelFetch<SystemSettings>('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }) : mockAdmin_updateSettings(getToken(), data),
  },
};

// =========================
// Mock wrappers (wrap the raw mock functions to return ApiResponse)
// =========================
type MockFn<T> = (...args: any[]) => Promise<ApiResponse<T>>;

function mockAuth_register(req: RegisterRequest): Promise<ApiResponse<AuthSession>> { return mock.mockAuth.register(req) as any; }
function mockAuth_login(req: LoginRequest): Promise<ApiResponse<AuthSession>> { return mock.mockAuth.login(req) as any; }
async function mockAuth_me(token: string): Promise<ApiResponse<User>> { return mock.mockAuth.me(token) as any; }
async function mockAuth_logout(token: string): Promise<ApiResponse<null>> { return mock.mockAuth.logout(token) as any; }
function mockAuth_forgotPassword(email: string): Promise<ApiResponse<null>> { return mock.mockAuth.forgotPassword(email) as any; }

async function mockDashboard_stats(token: string): Promise<ApiResponse<any>> { return mock.mockDashboard.getStats(token) as any; }

async function mockSms_balance(token: string): Promise<ApiResponse<SmsBalance>> { return mock.mockSms.getBalance(token) as any; }
function mockSms_calculate(token: string, req: SmsCalculateRequest): Promise<ApiResponse<SmsCalculateResponse>> { return mock.mockSms.calculate(token, req) as any; }
function mockSms_send(token: string, req: SendSmsRequest): Promise<ApiResponse<Campaign>> { return mock.mockSms.send(token, req) as any; }

function mockCampaigns_list(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<Campaign>>> { return mock.mockCampaigns.list(token, params) as any; }
function mockCampaigns_get(token: string, id: string): Promise<ApiResponse<CampaignDetail>> { return mock.mockCampaigns.get(token, id) as any; }
function mockCampaigns_cancel(token: string, id: string): Promise<ApiResponse<Campaign>> { return mock.mockCampaigns.cancel(token, id) as any; }
function mockCampaigns_delete(token: string, id: string): Promise<ApiResponse<null>> { return mock.mockCampaigns.delete(token, id) as any; }

function mockContacts_list(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<Contact>>> { return mock.mockContacts.list(token, params) as any; }
function mockContacts_create(token: string, data: Partial<Contact>): Promise<ApiResponse<Contact>> { return mock.mockContacts.create(token, data) as any; }
function mockContacts_update(token: string, id: string, data: Partial<Contact>): Promise<ApiResponse<Contact>> { return mock.mockContacts.update(token, id, data) as any; }
function mockContacts_delete(token: string, id: string): Promise<ApiResponse<null>> { return mock.mockContacts.delete(token, id) as any; }
function mockContacts_import(token: string, contacts: Partial<Contact>[]): Promise<ApiResponse<ImportResult>> { return mock.mockContacts.import(token, contacts) as any; }
function mockContacts_export(token: string): Promise<ApiResponse<Contact[]>> { return mock.mockContacts.export(token) as any; }

function mockGroups_list(token: string): Promise<ApiResponse<ContactGroup[]>> { return mock.mockGroups.list(token) as any; }
function mockGroups_create(token: string, name: string, desc?: string): Promise<ApiResponse<ContactGroup>> { return mock.mockGroups.create(token, name, desc) as any; }
function mockGroups_update(token: string, id: string, name: string, desc?: string): Promise<ApiResponse<ContactGroup>> { return mock.mockGroups.update(token, id, name, desc) as any; }
function mockGroups_delete(token: string, id: string): Promise<ApiResponse<null>> { return mock.mockGroups.delete(token, id) as any; }

function mockSenderIds_list(token: string): Promise<ApiResponse<SenderId[]>> { return mock.mockSenderIds.list(token) as any; }
function mockSenderIds_request(token: string, name: string): Promise<ApiResponse<SenderId>> { return mock.mockSenderIds.request(token, name) as any; }

function mockPricing_get(token: string): Promise<ApiResponse<any>> { return mock.mockPricing.get(token) as any; }
function mockPricing_packages(token: string): Promise<ApiResponse<Package[]>> { return mock.mockPricing.getPackages(token) as any; }

function mockPayments_list(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<Payment>>> { return mock.mockPayments.list(token, params) as any; }
function mockPayments_get(token: string, id: string): Promise<ApiResponse<Payment>> { return mock.mockPayments.get(token, id) as any; }
function mockPayments_create(token: string, pkgId: string, method: Payment['payment_method']): Promise<ApiResponse<Payment>> { return mock.mockPayments.create(token, pkgId, method) as any; }

function mockTransactions_list(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> { return mock.mockTransactions.list(token, params) as any; }
function mockTransactions_get(token: string, id: string): Promise<ApiResponse<Transaction>> { return mock.mockTransactions.get(token, id) as any; }

function mockApiKeys_list(token: string): Promise<ApiResponse<ApiKey[]>> { return mock.mockApiKeys.list(token) as any; }
function mockApiKeys_create(token: string, name: string): Promise<ApiResponse<ApiKey>> { return mock.mockApiKeys.create(token, name) as any; }
function mockApiKeys_revoke(token: string, id: string): Promise<ApiResponse<null>> { return mock.mockApiKeys.revoke(token, id) as any; }

function mockNotifications_list(token: string): Promise<ApiResponse<AppNotification[]>> { return mock.mockNotifications.list(token) as any; }
function mockNotifications_markRead(token: string, id: string): Promise<ApiResponse<null>> { return mock.mockNotifications.markRead(token, id) as any; }
function mockNotifications_markAllRead(token: string): Promise<ApiResponse<null>> { return mock.mockNotifications.markAllRead(token) as any; }

function mockReports_overview(token: string, params: QueryParams): Promise<ApiResponse<ReportOverview>> { return mock.mockReports.overview(token, params) as any; }

function mockSettings_get(token: string): Promise<ApiResponse<SystemSettings>> { return mock.mockSettings.get(token) as any; }
function mockSettings_update(token: string, data: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> { return mock.mockSettings.update(token, data) as any; }

function mockAdmin_dashboard(token: string): Promise<ApiResponse<AdminDashboardStats>> { return mock.mockAdmin.dashboard(token) as any; }
function mockAdmin_customers(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<AdminCustomer>>> { return mock.mockAdmin.customers(token, params) as any; }
function mockAdmin_customer(token: string, id: string): Promise<ApiResponse<AdminCustomer>> { return mock.mockAdmin.customer(token, id) as any; }
function mockAdmin_updateCustomer(token: string, id: string, data: Partial<User>): Promise<ApiResponse<User>> { return mock.mockAdmin.updateCustomer(token, id, data) as any; }
function mockAdmin_suspendCustomer(token: string, id: string, reason: string): Promise<ApiResponse<User>> { return mock.mockAdmin.suspendCustomer(token, id, reason) as any; }
function mockAdmin_activateCustomer(token: string, id: string): Promise<ApiResponse<User>> { return mock.mockAdmin.activateCustomer(token, id) as any; }
function mockAdmin_adjustBalance(token: string, id: string, credits: number, reason: string): Promise<ApiResponse<any>> { return mock.mockAdmin.adjustBalance(token, id, credits, reason) as any; }
function mockAdmin_pricing(token: string): Promise<ApiResponse<any>> { return mock.mockAdmin.pricing(token) as any; }
function mockAdmin_updatePricing(token: string, data: any): Promise<ApiResponse<any>> { return mock.mockAdmin.updatePricing(token, data) as any; }
function mockAdmin_tiers(token: string): Promise<ApiResponse<PricingTier[]>> { return mock.mockAdmin.tiers(token) as any; }
function mockAdmin_createTier(token: string, data: Partial<PricingTier>): Promise<ApiResponse<PricingTier>> { return mock.mockAdmin.createTier(token, data) as any; }
function mockAdmin_updateTier(token: string, id: string, data: Partial<PricingTier>): Promise<ApiResponse<PricingTier>> { return mock.mockAdmin.updateTier(token, id, data) as any; }
function mockAdmin_deleteTier(token: string, id: string): Promise<ApiResponse<null>> { return mock.mockAdmin.deleteTier(token, id) as any; }
function mockAdmin_packages(token: string): Promise<ApiResponse<Package[]>> { return mock.mockAdmin.packages(token) as any; }
function mockAdmin_createPackage(token: string, data: Partial<Package>): Promise<ApiResponse<Package>> { return mock.mockAdmin.createPackage(token, data) as any; }
function mockAdmin_updatePackage(token: string, id: string, data: Partial<Package>): Promise<ApiResponse<Package>> { return mock.mockAdmin.updatePackage(token, id, data) as any; }
function mockAdmin_deletePackage(token: string, id: string): Promise<ApiResponse<null>> { return mock.mockAdmin.deletePackage(token, id) as any; }
function mockAdmin_campaigns(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<Campaign>>> { return mock.mockAdmin.campaigns(token, params) as any; }
function mockAdmin_campaign(token: string, id: string): Promise<ApiResponse<CampaignDetail>> { return mock.mockAdmin.campaign(token, id) as any; }
function mockAdmin_transactions(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> { return mock.mockAdmin.transactions(token, params) as any; }
function mockAdmin_payments(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<Payment>>> { return mock.mockAdmin.payments(token, params) as any; }
function mockAdmin_senderIds(token: string): Promise<ApiResponse<SenderId[]>> { return mock.mockAdmin.senderIds(token) as any; }
function mockAdmin_approveSenderId(token: string, id: string): Promise<ApiResponse<SenderId>> { return mock.mockAdmin.approveSenderId(token, id) as any; }
function mockAdmin_rejectSenderId(token: string, id: string, reason: string): Promise<ApiResponse<SenderId>> { return mock.mockAdmin.rejectSenderId(token, id, reason) as any; }
function mockAdmin_auditLogs(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<AuditLog>>> { return mock.mockAdmin.auditLogs(token, params) as any; }
function mockAdmin_settings(token: string): Promise<ApiResponse<SystemSettings>> { return mock.mockAdmin.settings(token) as any; }
function mockAdmin_updateSettings(token: string, data: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> { return mock.mockAdmin.updateSettings(token, data) as any; }
