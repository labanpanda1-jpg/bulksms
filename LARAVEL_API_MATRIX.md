# ABANCOOL Bulk SMS — Complete API Matrix & Laravel 13 Build Prompt

## 1. Complete API Matrix

Every endpoint the frontend calls, mapped to the page that calls it, the HTTP method, the path, the request body fields, and the response `data` shape.

### 1.1 Auth Endpoints (no auth required except logout & me)

| # | Page / Component | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 1 | RegisterPage | POST | `/auth/register` | `full_name, business_name, email, phone, password, password_confirmation, terms_accepted` | `AuthSession { token, user }` |
| 2 | LoginPage | POST | `/auth/login` | `email, password, remember?` | `AuthSession { token, user }` |
| 3 | ForgotPasswordPage | POST | `/auth/forgot-password` | `email` | `null` |
| 4 | AuthLayout / useAuth | GET | `/auth/me` | — | `User` |
| 5 | useAuth logout | POST | `/auth/logout` | — | `null` |
| 6 | (future) | POST | `/auth/reset-password` | `email, token, password, password_confirmation` | `null` |

### 1.2 Customer Dashboard

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 7 | CustomerDashboard | GET | `/dashboard/stats` | — | `{ balance, total_sent, total_delivered, delivery_rate, total_contacts, recent_campaigns[], chart_data[] }` |

### 1.3 SMS

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 8 | SendSmsPage, BuySmsPage, AppLayout | GET | `/sms/balance` | — | `SmsBalance { balance, low_balance_threshold }` |
| 9 | SendSmsPage | POST | `/sms/calculate` | `message, recipients (number), sender_id?` | `SmsCalculateResponse { characters, sms_parts, recipients, total_sms, estimated_cost, currency, is_unicode }` |
| 10 | SendSmsPage | POST | `/sms/send` | `sender_id, recipients (string[]), group_ids?, message, schedule_date?, schedule_time?, timezone?` | `Campaign` |

### 1.4 Campaigns

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 11 | CampaignsPage, ScheduledPage | GET | `/campaigns?page&per_page&search&status&from&to&sort&order` | — | `PaginatedResponse<Campaign>` |
| 12 | CampaignDetailPage | GET | `/campaigns/{id}` | — | `CampaignDetail (Campaign + recipients[], timeline[])` |
| 13 | CampaignDetailPage | POST | `/campaigns/{id}/cancel` | — | `Campaign` |
| 14 | CampaignsPage | DELETE | `/campaigns/{id}` | — | `null` |

### 1.5 Contacts

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 15 | ContactsPage | GET | `/contacts?page&per_page&search&status&sort&order` | — | `PaginatedResponse<Contact>` |
| 16 | ContactsPage | POST | `/contacts` | `name, phone, email?, company?, group_id?` | `Contact` |
| 17 | ContactsPage | PUT | `/contacts/{id}` | `name, phone, email?, company?, group_id?` | `Contact` |
| 18 | ContactsPage | DELETE | `/contacts/{id}` | — | `null` |
| 19 | ImportPage | POST | `/contacts/import` | `{ contacts: Partial<Contact>[] }` | `ImportResult { imported, duplicates, invalid, total, contacts? }` |
| 20 | ContactsPage | GET | `/contacts/export` | — | `Contact[]` |

### 1.6 Contact Groups

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 21 | GroupsPage, SendSmsPage | GET | `/groups` | — | `ContactGroup[]` |
| 22 | GroupsPage | POST | `/groups` | `name, description?` | `ContactGroup` |
| 23 | GroupsPage | PUT | `/groups/{id}` | `name, description?` | `ContactGroup` |
| 24 | GroupsPage | DELETE | `/groups/{id}` | — | `null` |

### 1.7 Sender IDs

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 25 | SenderIdsPage | GET | `/sender-ids` | — | `SenderId[]` |
| 26 | SenderIdsPage | POST | `/sender-ids` | `name` | `SenderId` |

### 1.8 Pricing & Packages (public, auth required)

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 27 | SenderIdsPage, BuySmsPage, PublicLandingPage | GET | `/pricing` | — | `{ currency, currency_symbol, default_price_per_sms, sender_id_pricing: { safaricom, airtel, telkom }, tiers: PricingTier[] }` |
| 28 | BuySmsPage, PublicLandingPage | GET | `/packages` | — | `Package[]` |

### 1.9 Payments

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 29 | TransactionsPage | GET | `/payments?page&per_page&search&status&from&to&sort&order` | — | `PaginatedResponse<Payment>` |
| 30 | BuySmsPage | GET | `/payments/{id}` | — | `Payment` |
| 31 | BuySmsPage | POST | `/payments` | `package_id, payment_method` | `Payment` |

### 1.10 Transactions

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 32 | TransactionsPage | GET | `/transactions?page&per_page&search&type&from&to&sort&order` | — | `PaginatedResponse<Transaction>` |
| 33 | TransactionsPage | GET | `/transactions/{id}` | — | `Transaction` |

### 1.11 Developer / API Keys

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 34 | DeveloperPage | GET | `/developer/api-keys` | — | `ApiKey[]` |
| 35 | DeveloperPage | POST | `/developer/api-keys` | `name` | `ApiKey` |
| 36 | DeveloperPage | DELETE | `/developer/api-keys/{id}` | — | `null` |

### 1.12 Notifications

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 37 | AppLayout (bell) | GET | `/notifications` | — | `AppNotification[]` |
| 38 | AppLayout | POST | `/notifications/{id}/read` | — | `null` |
| 39 | AppLayout | POST | `/notifications/read-all` | — | `null` |

### 1.13 Reports

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 40 | ReportsPage, DeliveryReportsPage | GET | `/reports/overview?from&to` | — | `ReportOverview` |

### 1.14 Customer Settings

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 41 | SettingsPage | GET | `/settings` | — | `SystemSettings` |
| 42 | SettingsPage | PUT | `/settings` | `Partial<SystemSettings>` | `SystemSettings` |

### 1.15 Admin — Dashboard

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 43 | AdminDashboard | GET | `/admin/dashboard` | — | `AdminDashboardStats` |

### 1.16 Admin — Customers

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 44 | AdminCustomersPage | GET | `/admin/customers?page&per_page&search&status&sort&order` | — | `PaginatedResponse<AdminCustomer>` |
| 45 | AdminCustomerDetailPage | GET | `/admin/customers/{id}` | — | `AdminCustomer` |
| 46 | AdminCustomerDetailPage | PUT | `/admin/customers/{id}` | `Partial<User>` | `User` |
| 47 | AdminCustomerDetailPage | POST | `/admin/customers/{id}/suspend` | `reason` | `User` |
| 48 | AdminCustomerDetailPage | POST | `/admin/customers/{id}/activate` | — | `User` |
| 49 | AdminCustomerDetailPage | POST | `/admin/customers/{id}/adjust-balance` | `credits, reason` | `{ balance, ledger_entry }` |

### 1.17 Admin — Pricing

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 50 | AdminPricingPage | GET | `/admin/pricing` | — | `{ currency, currency_symbol, default_price_per_sms, free_registration_credits, low_balance_threshold, max_message_length, minimum_purchase, sender_id_pricing: { safaricom, airtel, telkom }, tiers: PricingTier[] }` |
| 51 | AdminPricingPage | PUT | `/admin/pricing` | `default_price_per_sms?, free_registration_credits?, low_balance_threshold?, max_message_length?, minimum_purchase?, sender_id_pricing?` | `{ ...settings, tiers }` |
| 52 | AdminPricingPage | GET | `/admin/pricing/tiers` | — | `PricingTier[]` |
| 53 | AdminPricingPage | POST | `/admin/pricing/tiers` | `min_quantity, max_quantity?, price_per_sms, label?, active?, sort_order?` | `PricingTier` |
| 54 | AdminPricingPage | PUT | `/admin/pricing/tiers/{id}` | `Partial<PricingTier>` | `PricingTier` |
| 55 | AdminPricingPage | DELETE | `/admin/pricing/tiers/{id}` | — | `null` |

### 1.18 Admin — Packages

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 56 | AdminPackagesPage | GET | `/admin/packages` | — | `Package[]` |
| 57 | AdminPackagesPage | POST | `/admin/packages` | `name, sms_quantity, price, discount?, active?, featured?, sort_order?, description?` | `Package` |
| 58 | AdminPackagesPage | PUT | `/admin/packages/{id}` | `Partial<Package>` | `Package` |
| 59 | AdminPackagesPage | DELETE | `/admin/packages/{id}` | — | `null` |

### 1.19 Admin — Campaigns, Transactions, Payments

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 60 | AdminCampaignsPage | GET | `/admin/campaigns?page&per_page&search&status&from&to` | — | `PaginatedResponse<Campaign>` |
| 61 | AdminCampaignsPage (detail) | GET | `/admin/campaigns/{id}` | — | `CampaignDetail` |
| 62 | AdminTransactionsPage | GET | `/admin/transactions?page&per_page&search&type&from&to` | — | `PaginatedResponse<Transaction>` |
| 63 | AdminPaymentsPage | GET | `/admin/payments?page&per_page&search&status&from&to` | — | `PaginatedResponse<Payment>` |

### 1.20 Admin — Sender IDs

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 64 | AdminSenderIdsPage | GET | `/admin/sender-ids` | — | `SenderId[]` |
| 65 | AdminSenderIdsPage | POST | `/admin/sender-ids/{id}/approve` | — | `SenderId` |
| 66 | AdminSenderIdsPage | POST | `/admin/sender-ids/{id}/reject` | `reason` | `SenderId` |

### 1.21 Admin — Audit Logs & Settings

| # | Page | Method | Endpoint | Request Body | Response `data` |
|---|---|---|---|---|---|
| 67 | AdminAuditLogsPage | GET | `/admin/audit-logs?page&per_page&search&sort&order` | — | `PaginatedResponse<AuditLog>` |
| 68 | AdminSettingsPage | GET | `/admin/settings` | — | `SystemSettings` |
| 69 | AdminSettingsPage | PUT | `/admin/settings` | `Partial<SystemSettings>` | `SystemSettings` |

### 1.22 Webhooks (server-to-server, no auth)

| # | Caller | Method | Endpoint | Body | Response |
|---|---|---|---|---|---|
| 70 | SMS provider | POST | `/webhooks/sms/status` | Provider delivery status | `200 { success: true }` |
| 71 | M-Pesa Daraja | POST | `/webhooks/payments/mpesa` | STK Push callback | `200 { success: true }` |

---

## 2. Data Model (all fields)

```
users
  id (uuid, PK)
  name (string)
  email (string, unique)
  phone (string)
  role (enum: SUPER_ADMIN, ADMIN, CUSTOMER)
  business_name (string, nullable)
  status (enum: active, suspended, pending)
  avatar_url (string, nullable)
  password_hash (string)
  remember_token
  created_at, updated_at

sms_balances
  id (uuid, PK)
  user_id (uuid FK -> users.id, unique)
  balance (integer, >= 0)
  created_at, updated_at

sms_ledgers (transactions)
  id (uuid, PK)
  user_id (uuid FK)
  campaign_id (uuid FK, nullable)
  type (enum: PURCHASE, SMS_DEBIT, BONUS, REFUND, ADMIN_ADJUSTMENT, PAYMENT)
  description (string)
  credits (integer, can be negative)
  balance_after (integer)
  amount (decimal, nullable)
  currency (string)
  status (enum: completed, pending, failed)
  reference (string, nullable)
  admin_name (string, nullable)
  reason (string, nullable)
  idempotency_key (string, unique)
  created_at

sms_campaigns
  id (uuid, PK)
  user_id (uuid FK)
  name (string)
  sender_id (string)
  message (text)
  recipient_count (integer)
  sms_units (integer)
  sms_parts (integer)
  reserved_units (integer)
  status (enum: DRAFT, SCHEDULED, PROCESSING, COMPLETED, FAILED, CANCELLED)
  sent (integer, default 0)
  delivered (integer, default 0)
  failed (integer, default 0)
  pending (integer, default 0)
  cost (decimal)
  currency (string)
  scheduled_at (timestamp, nullable)
  created_at, updated_at

sms_recipients (campaign recipients)
  id (uuid, PK)
  campaign_id (uuid FK)
  phone (string, canonical)
  name (string, nullable)
  status (enum: DELIVERED, SENT, PENDING, FAILED)
  sent_at (timestamp, nullable)
  delivered_at (timestamp, nullable)
  error_message (text, nullable)
  provider_event_id (string, unique, nullable)
  created_at

contacts
  id (uuid, PK)
  user_id (uuid FK)
  name (string)
  phone (string)
  email (string, nullable)
  company (string, nullable)
  group_id (uuid FK, nullable)
  status (enum: active, inactive, opted_out)
  created_at, updated_at

contact_groups
  id (uuid, PK)
  user_id (uuid FK)
  name (string)
  description (text, nullable)
  contact_count (integer, default 0)
  created_at, updated_at

sender_ids
  id (uuid, PK)
  user_id (uuid FK)
  name (string, max 11)
  status (enum: PENDING, APPROVED, REJECTED)
  rejection_reason (text, nullable)
  created_at, updated_at

pricing_tiers
  id (uuid, PK)
  min_quantity (integer)
  max_quantity (integer, nullable)
  price_per_sms (decimal)
  label (string, nullable)
  active (boolean)
  sort_order (integer)

packages
  id (uuid, PK)
  name (string)
  sms_quantity (integer)
  price (decimal)
  currency (string)
  discount (decimal)
  active (boolean)
  featured (boolean)
  sort_order (integer)
  description (text, nullable)
  created_at, updated_at

payments
  id (uuid, PK)
  receipt_number (string)
  user_id (uuid FK)
  package_id (uuid FK, nullable)
  sms_credits (integer)
  amount (decimal)
  currency (string)
  payment_method (enum: mpesa, card, bank_transfer)
  status (enum: pending, completed, failed, refunded)
  callback_reference (string, unique, nullable)
  created_at, updated_at

api_keys
  id (uuid, PK)
  user_id (uuid FK)
  name (string)
  key_hash (string)
  key_prefix (string)
  status (enum: active, revoked)
  last_used (timestamp, nullable)
  requests_count (integer, default 0)
  created_at
  revoked_at (timestamp, nullable)

notifications
  id (uuid, PK)
  user_id (uuid FK)
  title (string)
  message (text)
  type (enum: info, success, warning, error)
  read (boolean, default false)
  event_key (string, unique)
  created_at

system_settings
  id (uuid, PK) or key-value table
  company_name (string)
  support_email (string)
  support_phone (string)
  currency (string)
  currency_symbol (string)
  timezone (string)
  free_registration_credits (integer)
  low_balance_threshold (integer)
  default_price_per_sms (decimal)
  max_message_length (integer)
  minimum_purchase (integer)
  payment_methods (json)
  email_notifications (boolean)
  sms_notifications (boolean)
  low_balance_alerts (boolean)
  sender_id_pricing (json: { safaricom, airtel, telkom })

audit_logs
  id (uuid, PK)
  admin_id (uuid FK)
  admin_name (string)
  action (string)
  target (string)
  target_type (string)
  ip (string)
  before (json, nullable)
  after (json, nullable)
  reason (text, nullable)
  created_at

webhook_events
  id (uuid, PK)
  provider_event_id (string, unique)
  payload_hash (string)
  processed_at (timestamp)
  failure_count (integer, default 0)
  created_at
```

---

## 3. Enum / Type Reference

```
UserRole: SUPER_ADMIN | ADMIN | CUSTOMER
UserStatus: active | suspended | pending
CampaignStatus: DRAFT | SCHEDULED | PROCESSING | COMPLETED | FAILED | CANCELLED
RecipientStatus: DELIVERED | SENT | PENDING | FAILED
SenderIdStatus: PENDING | APPROVED | REJECTED
ContactStatus: active | inactive | opted_out
PaymentStatus: pending | completed | failed | refunded
PaymentMethod: mpesa | card | bank_transfer
TransactionType: PURCHASE | SMS_DEBIT | BONUS | REFUND | ADMIN_ADJUSTMENT | PAYMENT
NotificationType: info | success | warning | error
ApiKeyStatus: active | revoked
```

---

## 4. Laravel 13 Copilot Build Prompt

Copy the prompt below and paste it into GitHub Copilot Chat, Cursor, or your AI assistant of choice to scaffold the full Laravel 13 backend.

```
You are building the Laravel 13 backend for ABANCOOL Bulk SMS, a Kenyan bulk SMS platform. The React frontend is already built and expects a REST API at /api/v1. Below is the complete specification. Build it end-to-end with migrations, models, controllers, form requests, resources, services, jobs, events, middleware, routes, and tests.

## Tech Stack
- Laravel 13 (PHP 8.4)
- Sanctum token auth
- MySQL 8
- Queues with Redis
- M-Pesa Daraja STK Push integration
- Talksasa SMS provider (internal only, never exposed in API responses)

## API Conventions
- Base path: /api/v1
- Every response: { success: boolean, message: string, data: T }
- Validation error: { success: false, message: "...", errors: { field: ["msg"] } }
- Pagination: { data: T[], meta: { current_page, last_page, per_page, total } }
- Auth: Bearer token via Authorization header (Sanctum)
- All customer queries scoped by authenticated user ID
- Admin routes require role:ADMIN or SUPER_ADMIN middleware

## Routes (71 endpoints)

### Public auth routes (no auth)
POST /api/v1/auth/register — body: full_name, business_name, email, phone, password, password_confirmation, terms_accepted — returns { token, user } — auto-credits free_registration_credits (default 5)
POST /api/v1/auth/login — body: email, password, remember? — returns { token, user }
POST /api/v1/auth/forgot-password — body: email — returns null
POST /api/v1/auth/reset-password — body: email, token, password, password_confirmation — returns null

### Authenticated customer routes (auth:sanctum)
GET  /api/v1/auth/me — returns User
POST /api/v1/auth/logout — returns null

GET  /api/v1/dashboard/stats — returns { balance, total_sent, total_delivered, delivery_rate, total_contacts, recent_campaigns[], chart_data[] }

GET  /api/v1/sms/balance — returns { balance, low_balance_threshold }
POST /api/v1/sms/calculate — body: message, recipients(number), sender_id? — returns { characters, sms_parts, recipients, total_sms, estimated_cost, currency, is_unicode }
POST /api/v1/sms/send — body: sender_id, recipients(string[]), group_ids?, message, schedule_date?, schedule_time?, timezone? — returns Campaign

GET  /api/v1/campaigns — query: page, per_page, search, status, from, to, sort, order — returns PaginatedResponse<Campaign>
GET  /api/v1/campaigns/{id} — returns CampaignDetail (Campaign + recipients[], timeline[])
POST /api/v1/campaigns/{id}/cancel — returns Campaign (refunds unsent credits)
DELETE /api/v1/campaigns/{id} — returns null

GET  /api/v1/contacts — query: page, per_page, search, status, sort, order — returns PaginatedResponse<Contact>
POST /api/v1/contacts — body: name, phone, email?, company?, group_id? — returns Contact
PUT  /api/v1/contacts/{id} — body: name, phone, email?, company?, group_id? — returns Contact
DELETE /api/v1/contacts/{id} — returns null
POST /api/v1/contacts/import — body: { contacts: [{ name, phone, email?, company?, group_id? }] } — returns { imported, duplicates, invalid, total, contacts? }
GET  /api/v1/contacts/export — returns Contact[]

GET  /api/v1/groups — returns ContactGroup[]
POST /api/v1/groups — body: name, description? — returns ContactGroup
PUT  /api/v1/groups/{id} — body: name, description? — returns ContactGroup
DELETE /api/v1/groups/{id} — returns null

GET  /api/v1/sender-ids — returns SenderId[]
POST /api/v1/sender-ids — body: name — returns SenderId

GET  /api/v1/pricing — returns { currency, currency_symbol, default_price_per_sms, sender_id_pricing: { safaricom, airtel, telkom }, tiers: PricingTier[] }
GET  /api/v1/packages — returns Package[]

GET  /api/v1/payments — query: page, per_page, search, status, from, to, sort, order — returns PaginatedResponse<Payment>
GET  /api/v1/payments/{id} — returns Payment
POST /api/v1/payments — body: package_id, payment_method — returns Payment (initiates M-Pesa STK Push)

GET  /api/v1/transactions — query: page, per_page, search, type, from, to, sort, order — returns PaginatedResponse<Transaction>
GET  /api/v1/transactions/{id} — returns Transaction

GET  /api/v1/developer/api-keys — returns ApiKey[]
POST /api/v1/developer/api-keys — body: name — returns ApiKey (shows plaintext key once, stores hash)
DELETE /api/v1/developer/api-keys/{id} — returns null

GET  /api/v1/notifications — returns AppNotification[]
POST /api/v1/notifications/{id}/read — returns null
POST /api/v1/notifications/read-all — returns null

GET  /api/v1/reports/overview — query: from, to — returns ReportOverview { total_sent, total_delivered, total_failed, total_pending, delivery_rate, failed_rate, total_sms_units, total_cost, currency, by_date[], by_sender[] }

GET  /api/v1/settings — returns SystemSettings
PUT  /api/v1/settings — body: Partial<SystemSettings> — returns SystemSettings

### Admin routes (auth:sanctum + role:ADMIN,SUPER_ADMIN)
GET  /api/v1/admin/dashboard — returns AdminDashboardStats
GET  /api/v1/admin/customers — query params — returns PaginatedResponse<AdminCustomer>
GET  /api/v1/admin/customers/{id} — returns AdminCustomer
PUT  /api/v1/admin/customers/{id} — body: Partial<User> — returns User
POST /api/v1/admin/customers/{id}/suspend — body: reason — returns User
POST /api/v1/admin/customers/{id}/activate — returns User
POST /api/v1/admin/customers/{id}/adjust-balance — body: credits, reason — returns { balance, ledger_entry }
GET  /api/v1/admin/pricing — returns pricing config + tiers + sender_id_pricing
PUT  /api/v1/admin/pricing — body: default_price_per_sms?, free_registration_credits?, low_balance_threshold?, max_message_length?, minimum_purchase?, sender_id_pricing? — returns updated config
GET  /api/v1/admin/pricing/tiers — returns PricingTier[]
POST /api/v1/admin/pricing/tiers — body: min_quantity, max_quantity?, price_per_sms, label?, active?, sort_order? — returns PricingTier
PUT  /api/v1/admin/pricing/tiers/{id} — body: Partial<PricingTier> — returns PricingTier
DELETE /api/v1/admin/pricing/tiers/{id} — returns null
GET  /api/v1/admin/packages — returns Package[]
POST /api/v1/admin/packages — body: name, sms_quantity, price, discount?, active?, featured?, sort_order?, description? — returns Package
PUT  /api/v1/admin/packages/{id} — returns Package
DELETE /api/v1/admin/packages/{id} — returns null
GET  /api/v1/admin/campaigns — query params — returns PaginatedResponse<Campaign>
GET  /api/v1/admin/campaigns/{id} — returns CampaignDetail
GET  /api/v1/admin/transactions — query params — returns PaginatedResponse<Transaction>
GET  /api/v1/admin/payments — query params — returns PaginatedResponse<Payment>
GET  /api/v1/admin/sender-ids — returns SenderId[]
POST /api/v1/admin/sender-ids/{id}/approve — returns SenderId
POST /api/v1/admin/sender-ids/{id}/reject — body: reason — returns SenderId
GET  /api/v1/admin/audit-logs — query params — returns PaginatedResponse<AuditLog>
GET  /api/v1/admin/settings — returns SystemSettings
PUT  /api/v1/admin/settings — body: Partial<SystemSettings> — returns SystemSettings

### Webhooks (no auth, signature-verified)
POST /api/v1/webhooks/sms/status — SMS delivery status callback
POST /api/v1/webhooks/payments/mpesa — M-Pesa STK Push callback

## Database Schema
Use UUID primary keys for all tables. Create migrations for:

users (id, name, email unique, phone, role enum, business_name nullable, status enum, password, timestamps)
sms_balances (user_id unique FK, balance integer >= 0, timestamps) — add CHECK constraint balance >= 0
sms_ledgers (id, user_id FK, campaign_id FK nullable, type enum, description, credits integer, balance_after integer, amount decimal nullable, currency, status enum, reference nullable, admin_name nullable, reason nullable, idempotency_key unique, created_at) — index user_id, campaign_id
sms_campaigns (id, user_id FK, name, sender_id, message text, recipient_count, sms_units, sms_parts, reserved_units, status enum, sent, delivered, failed, pending, cost decimal, currency, scheduled_at nullable, timestamps) — index user_id, status
sms_recipients (id, campaign_id FK, phone, name nullable, status enum, sent_at nullable, delivered_at nullable, error_message nullable, provider_event_id unique nullable, created_at) — index campaign_id, status
contacts (id, user_id FK, name, phone, email nullable, company nullable, group_id FK nullable, status enum, timestamps) — index user_id, group_id
contact_groups (id, user_id FK, name, description nullable, contact_count default 0, timestamps) — index user_id
sender_ids (id, user_id FK, name max 11, status enum, rejection_reason nullable, timestamps) — index user_id, status
pricing_tiers (id, min_quantity, max_quantity nullable, price_per_sms decimal, label nullable, active boolean, sort_order)
packages (id, name, sms_quantity, price decimal, currency, discount decimal, active boolean, featured boolean, sort_order, description nullable, timestamps)
payments (id, receipt_number, user_id FK, package_id FK nullable, sms_credits, amount decimal, currency, payment_method enum, status enum, callback_reference unique nullable, timestamps) — index user_id, status
api_keys (id, user_id FK, name, key_hash, key_prefix, status enum, last_used nullable, requests_count default 0, created_at, revoked_at nullable) — index user_id
notifications (id, user_id FK, title, message text, type enum, read boolean default false, event_key unique, created_at) — index user_id, read
system_settings (singleton row or key-value) — fields: company_name, support_email, support_phone, currency, currency_symbol, timezone, free_registration_credits, low_balance_threshold, default_price_per_sms, max_message_length, minimum_purchase, payment_methods json, email_notifications, sms_notifications, low_balance_alerts, sender_id_pricing json
audit_logs (id, admin_id FK, admin_name, action, target, target_type, ip, before json nullable, after json nullable, reason nullable, created_at) — index admin_id, action
webhook_events (id, provider_event_id unique, payload_hash, processed_at, failure_count default 0, created_at)

## Models with relationships
User hasOne SmsBalance, hasMany SmsCampaign, hasMany Contact, hasMany ContactGroup, hasMany SenderId, hasMany ApiKey, hasMany Notification, hasMany Payment, hasMany SmsLedger.
SmsCampaign hasMany SmsRecipient, hasMany SmsLedger.
Contact belongsTo ContactGroup, belongsTo User.
ContactGroup hasMany Contact.
SenderId belongsTo User.
Payment belongsTo User, belongsTo Package.
Use UUID cast on all primary keys. Use $fillable on all models. Use enums via PHP 8.4 enum classes or string constants.

## Form Requests
Create a FormRequest for every POST/PUT endpoint. Validate all fields per the matrix. Return validation errors in { success: false, message: "...", errors: {} } format. Override failedValidation to return JSON.

## API Resources
Create JsonResource classes for: User, AdminCustomer, Campaign, CampaignDetail, Contact, ContactGroup, SenderId, PricingTier, Package, Payment, Transaction, ApiKey, AppNotification, AuditLog, SmsBalance, ReportOverview, SystemSettings.
Wrap every controller response in a helper that returns { success: true, message: "...", data: ... }.

## Services
- CreditLedgerService: atomic balance deduction with row locking, idempotency key, ledger entry creation, and refund logic. All inside DB::transaction with lockForUpdate.
- SmsProviderInterface + TalksasaSmsProvider: submit() and normalizeStatus(). Bound in AppServiceProvider. Never referenced in controllers or responses.
- MpesaService: STK Push initiation, callback verification, payment confirmation. Credentials in .env only.
- PricingService: resolves price per SMS from tiers and system settings. Never trusts client-provided prices.
- NotificationService: creates notifications with unique event_key to prevent duplicates.

## Jobs (all ShouldQueue with backoff and unique/idempotent keys)
- ReserveCampaignCredits: locks balance, validates pricing, creates reservation ledger, dispatches delivery
- SendSmsBatch: bounded batch through SmsProviderInterface
- PollScheduledCampaigns: finds due scheduled campaigns
- ReconcileSmsDeliveryStatuses: retries provider status reconciliation
- RefundUnacceptedSms: refunds recipients never accepted after terminal failure or cancellation
- SendInvoiceEmail: queued after successful payment
- SendLowBalanceEmail: one alert per threshold crossing
- PruneExpiredApiKeysAndTokens: revokes expired credentials

## Events & Listeners
- CampaignCreated -> ReserveCampaignCreditsListener
- CampaignQueued -> DispatchSmsBatchesListener
- SmsSubmitted -> UpdateRecipientSubmissionListener
- SmsDeliveryStatusReceived -> UpdateDeliveryReportListener
- CampaignCompleted -> SendCampaignReportEmailListener
- PaymentCompleted -> CreateInvoiceListener
- InvoiceCreated -> SendInvoiceEmailListener
- BalanceCrossedLowThreshold -> SendLowBalanceEmailListener
- AdminBalanceAdjusted -> WriteAuditLogListener

## Middleware
- auth:sanctum for all authenticated routes
- role:ADMIN,SUPER_ADMIN for all /admin routes (custom middleware checking user role)
- throttle:api for customer routes, throttle:admin for admin routes
- verify.sms.webhook for SMS webhook signature verification

## Business Rules (enforced server-side, never in frontend)
1. New registration auto-credits free_registration_credits (default 5) via ledger entry
2. Sending SMS: lock balance row, calculate units = recipients * sms_parts, check balance >= units, deduct, create SMS_DEBIT ledger entry, all in one transaction
3. Cancel campaign: refund only recipients not yet accepted by provider, create REFUND ledger entry
4. Admin balance adjustment: create ADMIN_ADJUSTMENT ledger + audit log + notification
5. All pricing derived from server-side config (pricing tiers + system settings)
6. Low balance threshold triggers one notification per threshold crossing (not per message)
7. Sender ID pricing is configurable per network (safaricom, airtel, telkom) in system settings
8. M-Pesa callback: verify, resolve pending payment from server data, compare amount, credit once inside locked transaction
9. SMS webhook: verify signature, normalize status, update only matching recipient by campaign+recipient ID (never by phone alone), terminal status cannot move backward
10. API keys: show plaintext once on creation, store only hash, prefix for display
11. Admin message access: log every message-body read to audit_logs with admin ID, message ID, customer ID, IP
12. No API response ever contains provider name, provider credentials, or internal exception messages

## M-Pesa Daraja Integration
- STK Push: initiate from POST /payments, send prompt to customer phone
- Callback: POST /webhooks/payments/mpesa, verify, resolve payment, credit SMS balance, create invoice, send email
- Store callback_reference uniquely to prevent double-crediting
- Credentials in .env: MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, MPESA_SHORTCODE, MPESA_CALLBACK_URL

## SMS Provider Integration (Talksasa)
- SmsProviderInterface: submit(SmsSubmission): ProviderSubmissionResult, normalizeStatus(array): NormalizedDeliveryStatus
- TalksasaSmsProvider implements the interface, bound in AppServiceProvider
- Credentials in .env: TALKSASA_API_KEY, TALKSASA_API_URL
- Provider message IDs encrypted at rest
- Provider exceptions logged to private channel, converted to generic errors
- Customer-facing responses never mention Talksasa

## Configuration (.env)
APP_NAME=ABANCOOL
SANCTUM_STATEFUL_DOMAINS=...
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
MPESA_SHORTCODE=...
MPESA_CALLBACK_URL=...
MPESA_ENV=sandbox
TALKSASA_API_KEY=...
TALKSASA_API_URL=...
QUEUE_CONNECTION=redis
CACHE_STORE=redis
SESSION_DRIVER=redis

## Seed Data
Seed: 2 admin users, 10 customers with balances, 5 pricing tiers, 6 packages, system settings with sender_id_pricing { safaricom: 7500, airtel: 7500, telkom: 7500 }, sample contacts, groups, sender IDs, campaigns, payments, transactions, notifications, audit logs.

## Tests
Write feature tests proving:
- Concurrent sends cannot overspend a balance
- Duplicate idempotency keys cannot double-charge
- Repeated payment callbacks cannot double-credit
- Cancel refunds only unaccepted recipients
- Low-balance alert sent once per crossing
- Admin message access is audited
- No customer response contains provider-specific names
- Registration auto-credits 5 SMS
- Pricing is always server-derived

Begin by creating the migrations, then models, then controllers with form requests and resources, then services, then jobs and events, then middleware and routes, then seeders, then tests. Output complete files, do not skip or abbreviate.
```
