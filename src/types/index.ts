// =========================
// Core API Response Types
// =========================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  from?: string;
  to?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: string | number | undefined;
}

// =========================
// Auth & User Types
// =========================

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  business_name?: string;
  status: 'active' | 'suspended' | 'pending';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface RegisterRequest {
  full_name: string;
  business_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  terms_accepted: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

// =========================
// SMS & Balance Types
// =========================

export interface SmsBalance {
  balance: number;
  low_balance_threshold: number;
}

export interface SmsCalculateRequest {
  message: string;
  recipients: number;
  sender_id?: string;
}

export interface SmsCalculateResponse {
  characters: number;
  sms_parts: number;
  recipients: number;
  total_sms: number;
  estimated_cost: number;
  currency: string;
  is_unicode: boolean;
}

export interface SendSmsRequest {
  sender_id: string;
  recipients: string[];
  group_ids?: string[];
  message: string;
  schedule_date?: string;
  schedule_time?: string;
  timezone?: string;
}

// =========================
// Campaign Types
// =========================

export type CampaignStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface Campaign {
  id: string;
  name: string;
  sender_id: string;
  message: string;
  recipient_count: number;
  sms_units: number;
  status: CampaignStatus;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  cost: number;
  currency: string;
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_name?: string;
}

export interface CampaignDetail extends Campaign {
  recipients: CampaignRecipient[];
  timeline: CampaignTimelineEvent[];
}

export interface CampaignRecipient {
  id: string;
  phone: string;
  name?: string;
  status: 'DELIVERED' | 'SENT' | 'PENDING' | 'FAILED';
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
}

export interface CampaignTimelineEvent {
  id: string;
  event: string;
  description: string;
  timestamp: string;
}

// =========================
// Contact Types
// =========================

export type ContactStatus = 'active' | 'inactive' | 'opted_out';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  group_id?: string;
  group_name?: string;
  status: ContactStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  contact_count: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ImportResult {
  imported: number;
  duplicates: number;
  invalid: number;
  total: number;
  contacts?: Contact[];
}

// =========================
// Sender ID Types
// =========================

export type SenderIdStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SenderId {
  id: string;
  name: string;
  status: SenderIdStatus;
  user_id: string;
  user_name?: string;
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
}

// =========================
// Pricing Types
// =========================

export interface PricingTier {
  id: string;
  min_quantity: number;
  max_quantity: number | null;
  price_per_sms: number;
  label?: string;
  active: boolean;
  sort_order: number;
}

export interface PricingConfig {
  currency: string;
  currency_symbol: string;
  default_price_per_sms: number;
  free_registration_credits: number;
  low_balance_threshold: number;
  max_message_length: number;
  minimum_purchase: number;
  tiers: PricingTier[];
}

export interface Package {
  id: string;
  name: string;
  sms_quantity: number;
  price: number;
  currency: string;
  discount: number;
  active: boolean;
  featured: boolean;
  sort_order: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// =========================
// Payment & Transaction Types
// =========================

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'mpesa' | 'card' | 'bank_transfer';

export interface Payment {
  id: string;
  receipt_number: string;
  user_id: string;
  user_name?: string;
  package_id?: string;
  package_name?: string;
  sms_credits: number;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export type TransactionType =
  | 'PURCHASE'
  | 'SMS_DEBIT'
  | 'BONUS'
  | 'REFUND'
  | 'ADMIN_ADJUSTMENT'
  | 'PAYMENT';

export interface Transaction {
  id: string;
  user_id: string;
  user_name?: string;
  type: TransactionType;
  description: string;
  credits: number;
  balance_after: number;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
  admin_name?: string;
  reason?: string;
  created_at: string;
}

// =========================
// API Key Types
// =========================

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  key_preview: string;
  status: 'active' | 'revoked';
  last_used?: string;
  requests_count: number;
  user_id: string;
  created_at: string;
}

// =========================
// Notification Types
// =========================

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

// =========================
// Report Types
// =========================

export interface ReportOverview {
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  total_pending: number;
  delivery_rate: number;
  failed_rate: number;
  total_sms_units: number;
  total_cost: number;
  currency: string;
  by_date: { date: string; sent: number; delivered: number; failed?: number }[];
  by_sender: { sender_id: string; count: number }[];
}

// =========================
// Admin Types
// =========================

export interface AdminDashboardStats {
  total_customers: number;
  active_customers: number;
  sms_sent_today: number;
  sms_sent_this_month: number;
  total_sms_credits: number;
  revenue: number;
  pending_payments: number;
  failed_messages: number;
  customer_growth: { date: string; count: number }[];
  sms_usage: { date: string; count: number }[];
  revenue_chart: { date: string; amount: number }[];
  delivery_rate_trend: { date: string; rate: number }[];
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target: string;
  target_type: string;
  ip: string;
  before?: string;
  after?: string;
  reason?: string;
  created_at: string;
}

export interface SenderIdPricing {
  safaricom: number;
  airtel: number;
  telkom: number;
}

export interface SystemSettings {
  company_name: string;
  support_email: string;
  support_phone: string;
  currency: string;
  currency_symbol: string;
  timezone: string;
  free_registration_credits: number;
  low_balance_threshold: number;
  default_price_per_sms: number;
  max_message_length: number;
  minimum_purchase: number;
  payment_methods: PaymentMethod[];
  email_notifications: boolean;
  sms_notifications: boolean;
  low_balance_alerts: boolean;
  sender_id_pricing: SenderIdPricing;
}

// =========================
// Customer Profile (Admin view)
// =========================

export interface AdminCustomer extends User {
  sms_balance: number;
  total_sent: number;
  total_delivered: number;
  total_spent: number;
  last_login?: string;
  campaigns_count: number;
  contacts_count: number;
}
