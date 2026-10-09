# ABANCOOL Bulk SMS — Laravel API Contract

## Integration Guide

### Switching from Mock to Laravel

Set `VITE_API_MODE=laravel` and `VITE_API_BASE_URL=https://api.abancool.com/api/v1` in `.env`.

The frontend service layer (`src/services/api.ts`) already maps every call to the correct endpoint. No UI changes needed.

### Standard Response Format

```json
{ "success": true, "message": "OK", "data": {} }
```

Validation error:
```json
{ "success": false, "message": "Validation failed.", "errors": { "phone": ["Invalid."] } }
```

### Pagination Format

```json
{ "data": [], "meta": { "current_page": 1, "last_page": 10, "per_page": 25, "total": 245 } }
```

### Authentication

All endpoints except `/auth/register`, `/auth/login`, `/auth/forgot-password` require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register customer, auto-credits 5 SMS |
| POST | `/auth/login` | Login, returns token + user |
| POST | `/auth/logout` | Invalidate token |
| GET | `/auth/me` | Current user |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Reset password |

### Customer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | KPIs, charts, recent activity |
| GET | `/sms/balance` | Current SMS balance |
| POST | `/sms/calculate` | Calculate SMS parts/cost |
| POST | `/sms/send` | Send or schedule SMS campaign |
| GET | `/campaigns` | List campaigns (paginated, filterable) |
| GET | `/campaigns/{id}` | Campaign detail with recipients + timeline |
| POST | `/campaigns/{id}/cancel` | Cancel campaign, refund unsent credits |
| DELETE | `/campaigns/{id}` | Delete campaign |
| GET | `/contacts` | List contacts (paginated, filterable) |
| POST | `/contacts` | Create contact |
| PUT | `/contacts/{id}` | Update contact |
| DELETE | `/contacts/{id}` | Delete contact |
| POST | `/contacts/import` | Bulk import contacts |
| GET | `/contacts/export` | Export contacts CSV |
| GET | `/groups` | List groups |
| POST | `/groups` | Create group |
| PUT | `/groups/{id}` | Update group |
| DELETE | `/groups/{id}` | Delete group |
| GET | `/sender-ids` | List sender IDs |
| POST | `/sender-ids` | Request new sender ID |
| GET | `/pricing` | Get pricing config + tiers |
| GET | `/packages` | List purchase packages |
| GET | `/payments` | List payments |
| GET | `/payments/{id}` | Payment detail (receipt) |
| POST | `/payments` | Create payment (purchase SMS) |
| GET | `/transactions` | List transactions (ledger) |
| GET | `/transactions/{id}` | Transaction detail |
| GET | `/developer/api-keys` | List API keys |
| POST | `/developer/api-keys` | Generate API key |
| DELETE | `/developer/api-keys/{id}` | Revoke API key |
| GET | `/notifications` | List notifications |
| POST | `/notifications/{id}/read` | Mark read |
| POST | `/notifications/read-all` | Mark all read |
| GET | `/reports/overview` | Delivery report stats |
| GET | `/settings` | Get settings |
| PUT | `/settings` | Update settings |

### Admin Endpoints

All require `ADMIN` or `SUPER_ADMIN` role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Platform KPIs + charts |
| GET | `/admin/customers` | List customers |
| GET | `/admin/customers/{id}` | Customer detail |
| PUT | `/admin/customers/{id}` | Update customer |
| POST | `/admin/customers/{id}/suspend` | Suspend customer |
| POST | `/admin/customers/{id}/activate` | Activate customer |
| POST | `/admin/customers/{id}/adjust-balance` | Adjust SMS balance |
| GET | `/admin/pricing` | Get pricing config |
| PUT | `/admin/pricing` | Update pricing config |
| GET | `/admin/pricing/tiers` | List tiers |
| POST | `/admin/pricing/tiers` | Create tier |
| PUT | `/admin/pricing/tiers/{id}` | Update tier |
| DELETE | `/admin/pricing/tiers/{id}` | Delete tier |
| GET | `/admin/packages` | List packages |
| POST | `/admin/packages` | Create package |
| PUT | `/admin/packages/{id}` | Update package |
| DELETE | `/admin/packages/{id}` | Delete package |
| GET | `/admin/campaigns` | All campaigns |
| GET | `/admin/campaigns/{id}` | Campaign detail |
| GET | `/admin/transactions` | All transactions |
| GET | `/admin/payments` | All payments |
| GET | `/admin/sender-ids` | All sender IDs |
| POST | `/admin/sender-ids/{id}/approve` | Approve sender ID |
| POST | `/admin/sender-ids/{id}/reject` | Reject sender ID |
| GET | `/admin/audit-logs` | Audit logs |
| GET | `/admin/settings` | System settings |
| PUT | `/admin/settings` | Update system settings |

### Data Model

```
User (id, name, email, phone, role, business_name, status)
  ├── SmsBalance (user_id, balance)
  ├── SmsLedger/Transaction (user_id, type, credits, balance_after, amount)
  ├── SmsCampaign (user_id, name, sender_id, message, status, sent, delivered, failed)
  │   └── SmsRecipient (campaign_id, phone, status, sent_at, delivered_at)
  ├── Contact (user_id, name, phone, email, company, group_id)
  ├── ContactGroup (user_id, name, contact_count)
  ├── SenderId (user_id, name, status)
  ├── ApiKey (user_id, name, key, status)
  ├── Payment (user_id, package_id, amount, sms_credits, status)
  └── Notification (user_id, title, message, read)

PricingTier (min_quantity, max_quantity, price_per_sms, active)
Package (name, sms_quantity, price, discount, active, featured)
SystemSetting (key-value config)
AuditLog (admin_id, action, target, before, after, reason)
```

### SMS Provider Boundary

The SMS provider (Talksasa) is an **internal backend implementation detail**. The frontend never references it. In Laravel:

1. Create `app/Services/Sms/SmsProviderInterface.php`
2. Create `app/Services/Sms/TalksasaSmsProvider.php` implementing the interface
3. Bind in a service provider
4. The controller calls the interface, not the implementation
5. Provider credentials live in `.env` server-side only
6. Customer-facing API stays unchanged regardless of provider

### Business Rules (Backend-Authoritative)

- New registration → auto-credit `free_registration_credits` (default 5)
- Sending SMS → check balance >= total_sms_units, deduct, create ledger entry
- Cancel campaign → refund unsent credits
- Admin balance adjustment → create ledger + audit log + notification
- All pricing derived from admin config (never hardcoded in frontend)
- Low balance threshold triggers notification

## End-to-End Production Workflow

This section is the implementation contract for the Laravel service. The browser and customer API must never calculate, deduct, deliver, or refund SMS credits on their own. Laravel is the source of truth for balances, pricing, provider calls, message state, emails, and admin access.

### Public API routes

Add these routes to `routes/api.php` under the `v1` prefix:

```php
Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/forgot-password', [PasswordController::class, 'forgot']);
    Route::post('auth/reset-password', [PasswordController::class, 'reset']);

    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::get('sms/balance', [BalanceController::class, 'show']);
        Route::post('sms/calculate', [SmsController::class, 'calculate']);
        Route::post('sms/send', [SmsController::class, 'send']);
        Route::get('campaigns', [CampaignController::class, 'index']);
        Route::get('campaigns/{campaign}', [CampaignController::class, 'show']);
        Route::post('campaigns/{campaign}/cancel', [CampaignController::class, 'cancel']);
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications/{notification}/read', [NotificationController::class, 'read']);
        Route::get('transactions', [TransactionController::class, 'index']);
        Route::get('payments', [PaymentController::class, 'index']);
        Route::post('payments', [PaymentController::class, 'store']);
    });

    Route::middleware(['auth:sanctum', 'role:ADMIN,SUPER_ADMIN', 'throttle:admin'])->prefix('admin')->group(function () {
        Route::get('messages', [AdminMessageController::class, 'index']);
        Route::get('messages/{message}', [AdminMessageController::class, 'show']);
        Route::get('customers/{customer}/messages', [AdminMessageController::class, 'customerMessages']);
        Route::post('messages/{message}/retry', [AdminMessageController::class, 'retry']);
        Route::get('audit-logs', [AdminAuditLogController::class, 'index']);
    });

    Route::post('webhooks/sms/status', [SmsWebhookController::class, 'status'])
        ->middleware('verify.sms.webhook');
    Route::post('webhooks/payments/mpesa', [MpesaWebhookController::class, 'callback']);
});
```

The admin message endpoints are the only place where message bodies are readable across customers. Every read must be recorded in `audit_logs` with the admin ID, message ID, customer ID, IP address, and reason. Customer endpoints scope every query by the authenticated customer ID.

### Customer API request and response

`POST /sms/send` accepts the message content, recipients, sender ID, and optional schedule. It does not accept a price, balance, provider name, provider message ID, or balance-after value.

```json
{
  "name": "April reminders",
  "sender_id": "ABANCOOL",
  "message": "Your appointment is tomorrow at 10:00.",
  "recipients": ["254712345678", "254722345678"],
  "scheduled_for": null,
  "idempotency_key": "customer-generated-unique-key"
}
```

```json
{
  "success": true,
  "message": "Campaign accepted for delivery.",
  "data": {
    "campaign_id": "uuid",
    "status": "QUEUED",
    "sms_units_reserved": 2,
    "balance_after": 48
  }
}
```

The response and all customer-facing errors must refer only to ABANCOOL. Never return `Talksasa`, provider credentials, upstream URLs, provider request payloads, provider response bodies, or internal exception messages.

### Atomic balance and ledger service

Create `app/Services/Sms/CreditLedgerService.php`. The deduction must occur inside one database transaction while locking the customer's balance row. The amount is calculated from the server-side message segmentation and active pricing tier.

```php
public function reserveForCampaign(User $user, SmsCampaign $campaign): SmsLedger
{
    return DB::transaction(function () use ($user, $campaign) {
        $balance = SmsBalance::query()
            ->where('user_id', $user->id)
            ->lockForUpdate()
            ->firstOrFail();

        $units = $campaign->recipients()->count() * $campaign->sms_parts;
        if ($units < 1 || $balance->balance < $units) {
            throw new InsufficientSmsCredit;
        }

        $balance->decrement('balance', $units);
        $ledger = SmsLedger::create([
            'user_id' => $user->id,
            'campaign_id' => $campaign->id,
            'type' => 'RESERVATION',
            'credits' => -$units,
            'balance_after' => $balance->fresh()->balance,
            'idempotency_key' => $campaign->id . ':reservation',
        ]);

        $campaign->update(['reserved_units' => $units, 'status' => 'QUEUED']);
        return $ledger;
    });
}
```

Add a unique index on `sms_ledgers.idempotency_key`. Never deduct by calling `decrement()` outside the transaction, never trust the client total, and never allow a second request with the same idempotency key to reserve credits twice.

Use a second locked transaction for refunds. Refund only recipients that were not accepted by the provider, and create a positive `REFUND` ledger entry. Every adjustment, reservation, delivery charge, and refund must have a ledger row; the balance is a cached current value, not the audit history.

### Provider boundary and customer privacy

The only provider-specific class is `app/Services/Sms/TalksasaSmsProvider.php`. It implements `SmsProviderInterface` and is bound in `AppServiceProvider`. Controllers, jobs, events, resources, logs shown to customers, and public API responses use only the interface and internal DTOs.

```php
interface SmsProviderInterface
{
    public function submit(SmsSubmission $submission): ProviderSubmissionResult;
    public function normalizeStatus(array $payload): NormalizedDeliveryStatus;
}
```

Store provider credentials only in server-side configuration. Encrypt provider message IDs at rest if they are retained. Store only the internal campaign and recipient IDs in customer-visible records. Provider exceptions are logged to a private channel and converted to `SmsDeliveryFailed` or a generic retryable error.

### Jobs, events, listeners, and observers

Create these queued jobs with `ShouldQueue`, a backoff policy, and a unique/idempotent key:

- `ReserveCampaignCredits`: locks the balance, validates current pricing, creates the reservation ledger entry, and dispatches delivery jobs.
- `SendSmsBatch`: sends a bounded batch through `SmsProviderInterface`; it never sends more than the recipient rows reserved for that campaign.
- `PollScheduledCampaigns`: finds due campaigns and dispatches `SendSmsBatch` without sending future campaigns early.
- `ReconcileSmsDeliveryStatuses`: retries provider status reconciliation for pending recipients.
- `RefundUnacceptedSms`: refunds recipients that were never accepted after a terminal failure or cancellation.
- `SendInvoiceEmail`: renders the invoice and sends it from the queue after a successful payment.
- `SendLowBalanceEmail`: sends one alert per threshold crossing, not once per message.
- `PruneExpiredApiKeysAndTokens`: revokes expired credentials and removes stale webhook idempotency records.

Dispatch delivery jobs only after the credit reservation transaction commits, using `afterCommit()` or an outbox table. Configure retries such as `backoff(): array { return [10, 60, 300]; }` and a `failed()` method that records a private failure event and releases only unaccepted reservations.

Create these events and listeners:

| Event | Listener | Result |
|---|---|---|
| `CampaignCreated` | `ReserveCampaignCreditsListener` | Reserves credits exactly once. |
| `CampaignQueued` | `DispatchSmsBatchesListener` | Sends bounded queued batches. |
| `SmsSubmitted` | `UpdateRecipientSubmissionListener` | Stores internal acceptance state and timestamp. |
| `SmsDeliveryStatusReceived` | `UpdateDeliveryReportListener` | Updates delivery state idempotently. |
| `CampaignCompleted` | `SendCampaignReportEmailListener` | Sends an optional completion report. |
| `PaymentCompleted` | `CreateInvoiceListener` | Creates an immutable invoice and ledger credit. |
| `InvoiceCreated` | `SendInvoiceEmailListener` | Queues the invoice email. |
| `BalanceCrossedLowThreshold` | `SendLowBalanceEmailListener` | Sends the low-balance warning once per crossing. |
| `AdminBalanceAdjusted` | `WriteAuditLogListener` | Writes the before/after audit record. |

Create `SmsCampaignObserver` to set internal timestamps and dispatch domain events after commit. Observers must not perform network calls directly. Create `SmsRecipientObserver` for state transitions only; provider calls belong in jobs.

### Invoice and low-balance email automation

Use Laravel Notifications and queued Mailables. Configure templates for:

- payment receipt and invoice, including package, amount, VAT/tax fields where applicable, credits purchased, invoice number, and payment date;
- low balance warning when the balance crosses the configured threshold, including current balance and a link to buy credits;
- campaign completion report with accepted, delivered, failed, and refunded totals.

Email preferences belong to the customer settings table. Essential payment and security emails cannot be disabled; marketing emails can. Store `invoice_number` and `sent_at` on the invoice, and use a unique notification key so retries do not send duplicate invoices.

### SMS delivery webhook safety

`SmsWebhookController` must verify the provider signature before parsing the payload. Normalize the provider status into internal values: `ACCEPTED`, `DELIVERED`, `FAILED`, or `UNKNOWN`. Store the provider event ID with a unique index and return success for an already-processed event so provider retries are harmless.

The webhook must update only the matching recipient and campaign, never a recipient selected only by a phone number. A terminal status cannot be moved backward. When all recipients are terminal, dispatch `CampaignCompleted`; if accepted messages are fewer than reserved messages, dispatch the refund job for the difference.

### Payment and invoice idempotency

M-Pesa callbacks must be verified, stored in a unique `payment_reference` record, and processed once inside a locked transaction. Never trust amount or package quantity from the browser or callback alone: resolve the pending payment and package from server data, compare the amount, then credit the customer and create the invoice. Repeated callbacks return the original success result without adding credits again.

### Admin message access and privacy

Admins may search and read all customer messages only through the admin routes and only with `ADMIN` or `SUPER_ADMIN` authorization. Add a separate `message.read` audit event for every message-body access. Do not expose the provider name in the admin or customer response unless a super-admin diagnostic view explicitly requires it. Redact phone numbers and message content from ordinary application logs.

### Required database constraints and indexes

Add non-destructive migrations for:

- `sms_balances`: one row per user, non-negative balance constraint;
- `sms_ledgers`: unique idempotency key, indexed user and campaign IDs;
- `sms_campaigns`: internal status, reservation totals, segmentation parts, schedule, and completion timestamps;
- `sms_recipients`: canonical phone, internal delivery state, unique provider event ID;
- `payments`: unique callback/reference ID and immutable status transitions;
- `invoices`: unique invoice number and payment relation;
- `notifications`: user, type, read timestamp, and unique event key;
- `api_keys`: hashed secret, visible prefix, expiry, last-used timestamp, and revoked timestamp;
- `audit_logs`: actor, action, target type/ID, reason, IP address, and JSON before/after snapshots;
- `webhook_events`: unique provider event ID, payload hash, processed timestamp, and failure count.

Use foreign keys, indexes for every customer and status filter, and check constraints for non-negative credits and valid state transitions. Never expose raw API keys after creation; show the secret once and store only its hash.

### Operational requirements

Run queue workers for mail, SMS, webhook reconciliation, and reports separately so a provider outage cannot block invoice emails. Add rate limits per customer and API key, maximum recipient batch sizes, request idempotency, structured private logs, health checks for the queue and provider adapter, and metrics for reservation failures, provider failures, delivery latency, refunds, email failures, and webhook replay attempts.

The production acceptance tests must prove that concurrent sends cannot overspend a balance, duplicate idempotency keys cannot double-charge, repeated payment callbacks cannot double-credit, provider outages retry without duplicate sends, cancellations refund only unaccepted recipients, low-balance alerts are not spammed, admin message access is audited, and no customer response contains provider-specific names or fields.
