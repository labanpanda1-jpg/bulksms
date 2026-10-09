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
