import { getDb, saveDb, delay } from '@/mocks/db';
import type {
  ApiResponse, User, AuthSession, RegisterRequest, LoginRequest,
  SmsBalance, SmsCalculateRequest, SmsCalculateResponse, SendSmsRequest,
  Campaign, CampaignDetail, CampaignRecipient, Contact, ContactGroup,
  SenderId, PricingTier, Package, Payment, Transaction, ApiKey,
  AppNotification, AuditLog, SystemSettings, AdminDashboardStats,
  ReportOverview, QueryParams, PaginatedResponse, ImportResult,
  AdminCustomer, ContactStatus,
} from '@/types';
import {
  generateId, generateReceiptNumber, generateApiKey,
  calculateSmsParts, calculateTotalSms, normalizePhoneNumber, isValidKenyanPhone,
  getPriceForQuantity,
} from '@/lib/sms';

// =========================
// Helper functions
// =========================
function ok<T>(data: T, message: string = 'Success'): ApiResponse<T> {
  return { success: true, message, data };
}

function fail(message: string): ApiResponse<never> {
  return { success: false, message, data: null as never };
}

function paginate<T>(items: T[], params: QueryParams): PaginatedResponse<T> {
  const page = params.page || 1;
  const perPage = params.per_page || 25;
  const start = (page - 1) * perPage;
  const data = items.slice(start, start + perPage);
  return {
    data,
    meta: {
      current_page: page,
      last_page: Math.ceil(items.length / perPage) || 1,
      per_page: perPage,
      total: items.length,
    },
  };
}

function filterByParams(
  items: any[],
  params: QueryParams,
  searchFields: string[],
  statusField?: string,
  dateField?: string,
): any[] {
  let result = [...items];
  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(item =>
      searchFields.some(f => {
        const val = item[f];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }
  if (params.status && statusField) {
    result = result.filter(item => String(item[statusField]) === params.status);
  }
  if (params.from && dateField) {
    result = result.filter(item => new Date(String(item[dateField])) >= new Date(params.from!));
  }
  if (params.to && dateField) {
    result = result.filter(item => new Date(String(item[dateField])) <= new Date(params.to!));
  }
  if (params.sort && items.length > 0 && params.sort in items[0]) {
    const sortKey = params.sort;
    const order = params.order || 'desc';
    result.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return order === 'asc' ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv));
      return order === 'asc' ? cmp : -cmp;
    });
  }
  return result;
}

function getUserByToken(token: string): User | null {
  const db = getDb();
  const userId = db.sessions[token];
  if (!userId) return null;
  return db.users.find(u => u.id === userId) || null;
}

function requireAuth(token: string): User {
  const user = getUserByToken(token);
  if (!user) throw new Error('Unauthenticated.');
  return user;
}

function requireAdmin(token: string): User {
  const user = requireAuth(token);
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') throw new Error('You do not have permission to perform this action.');
  return user;
}

function addTransaction(
  userId: string,
  type: Transaction['type'],
  description: string,
  credits: number,
  amount: number = 0,
  reference?: string,
  adminName?: string,
  reason?: string,
): Transaction {
  const db = getDb();
  const currentBalance = db.balances[userId] || 0;
  const newBalance = currentBalance + credits;
  db.balances[userId] = newBalance;
  const tx: Transaction = {
    id: generateId(),
    user_id: userId,
    user_name: db.users.find(u => u.id === userId)?.name,
    type,
    description,
    credits,
    balance_after: newBalance,
    amount,
    currency: db.settings.currency,
    status: 'completed',
    reference,
    admin_name: adminName,
    reason,
    created_at: new Date().toISOString(),
  };
  db.transactions.unshift(tx);
  return tx;
}

function addNotification(
  userId: string,
  title: string,
  message: string,
  type: AppNotification['type'] = 'info',
): void {
  const db = getDb();
  db.notifications.unshift({
    id: generateId(),
    user_id: userId,
    title,
    message,
    type,
    read: false,
    created_at: new Date().toISOString(),
  });
}

function addAuditLog(
  adminId: string,
  adminName: string,
  action: string,
  target: string,
  targetType: string,
  before?: string,
  after?: string,
  reason?: string,
): void {
  const db = getDb();
  db.auditLogs.unshift({
    id: generateId(),
    admin_id: adminId,
    admin_name: adminName,
    action,
    target,
    target_type: targetType,
    ip: '41.90.0.1',
    before,
    after,
    reason,
    created_at: new Date().toISOString(),
  });
}

// =========================
// Auth Service
// =========================
export const mockAuth = {
  async register(req: RegisterRequest): Promise<ApiResponse<AuthSession>> {
    await delay();
    const db = getDb();
    const existing = db.users.find(u => u.email.toLowerCase() === req.email.toLowerCase());
    if (existing) return fail('An account with this email already exists.');
    const user: User = {
      id: generateId(),
      name: req.full_name,
      email: req.email,
      phone: normalizePhoneNumber(req.phone),
      role: 'CUSTOMER',
      business_name: req.business_name,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.users.push(user);
    db.passwords[req.email.toLowerCase()] = req.password;
    // Give free registration credits
    const freeCredits = db.settings.free_registration_credits;
    db.balances[user.id] = freeCredits;
    addTransaction(user.id, 'BONUS', 'Registration bonus', freeCredits, 0);
    addNotification(user.id, 'Welcome to ABANCOOL', `Your account has been created with ${freeCredits} free SMS credits. Start sending messages today!`, 'success');
    const token = generateId();
    db.sessions[token] = user.id;
    saveDb();
    return ok({ token, user }, 'Registration successful. You have received ' + freeCredits + ' free SMS credits.');
  },

  async login(req: LoginRequest): Promise<ApiResponse<AuthSession>> {
    await delay();
    const db = getDb();
    const user = db.users.find(u => u.email.toLowerCase() === req.email.toLowerCase());
    if (!user) return fail('Invalid email or password.');
    const password = db.passwords[req.email.toLowerCase()];
    if (password !== req.password) return fail('Invalid email or password.');
    if (user.status === 'suspended') return fail('Your account has been suspended. Please contact support.');
    const token = generateId();
    db.sessions[token] = user.id;
    saveDb();
    return ok({ token, user }, 'Login successful.');
  },

  async me(token: string): Promise<ApiResponse<User>> {
    await delay(100);
    const user = getUserByToken(token);
    if (!user) return fail('Unauthenticated.');
    return ok(user);
  },

  async logout(token: string): Promise<ApiResponse<null>> {
    await delay(100);
    const db = getDb();
    delete db.sessions[token];
    saveDb();
    return ok(null, 'Logged out successfully.');
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    await delay();
    return ok(null, 'If an account exists with this email, a password reset link has been sent.');
  },

  async resetPassword(token: string, email: string, password: string): Promise<ApiResponse<null>> {
    await delay();
    const db = getDb();
    if (db.passwords[email.toLowerCase()] !== undefined) {
      db.passwords[email.toLowerCase()] = password;
      saveDb();
    }
    return ok(null, 'Password reset successful.');
  },
};

// =========================
// Dashboard Service
// =========================
export const mockDashboard = {
  async getStats(token: string): Promise<ApiResponse<any>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const userCampaigns = db.campaigns.filter(c => c.user_id === user.id);
    const totalSent = userCampaigns.reduce((s, c) => s + c.sent, 0);
    const totalDelivered = userCampaigns.reduce((s, c) => s + c.delivered, 0);
    const totalFailed = userCampaigns.reduce((s, c) => s + c.failed, 0);
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const balance = db.balances[user.id] || 0;
    const recentCampaigns = userCampaigns.slice(0, 5);
    const recentTransactions = db.transactions.filter(t => t.user_id === user.id).slice(0, 5);
    const usageData = generateUsageData(userCampaigns);
    return ok({
      balance,
      total_sent: totalSent,
      total_delivered: totalDelivered,
      total_failed: totalFailed,
      delivery_rate: deliveryRate,
      total_campaigns: userCampaigns.length,
      recent_campaigns: recentCampaigns,
      recent_transactions: recentTransactions,
      usage_data: usageData,
    });
  },
};

function generateUsageData(campaigns: Campaign[]) {
  const days: { date: string; sent: number; delivered: number; failed: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayCampaigns = campaigns.filter(c => c.created_at.slice(0, 10) === dateStr);
    days.push({
      date: dateStr,
      sent: dayCampaigns.reduce((s, c) => s + c.sent, 0),
      delivered: dayCampaigns.reduce((s, c) => s + c.delivered, 0),
      failed: dayCampaigns.reduce((s, c) => s + c.failed, 0),
    });
  }
  return days;
}

// =========================
// SMS Service
// =========================
export const mockSms = {
  async getBalance(token: string): Promise<ApiResponse<SmsBalance>> {
    await delay(100);
    const user = requireAuth(token);
    const db = getDb();
    return ok({
      balance: db.balances[user.id] || 0,
      low_balance_threshold: db.settings.low_balance_threshold,
    });
  },

  async calculate(token: string, req: SmsCalculateRequest): Promise<ApiResponse<SmsCalculateResponse>> {
    await delay(100);
    requireAuth(token);
    const db = getDb();
    const { parts, isUnicode } = calculateSmsParts(req.message);
    const totalSms = parts * req.recipients;
    const pricePerSms = getPriceForQuantity(totalSms, db.tiers, db.settings.default_price_per_sms);
    return ok({
      characters: req.message.length,
      sms_parts: parts,
      recipients: req.recipients,
      total_sms: totalSms,
      estimated_cost: totalSms * pricePerSms,
      currency: db.settings.currency,
      is_unicode: isUnicode,
    });
  },

  async send(token: string, req: SendSmsRequest): Promise<ApiResponse<Campaign>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();

    // Collect all recipients
    const recipientPhones = new Set<string>();
    req.recipients.forEach(p => recipientPhones.add(normalizePhoneNumber(p)));
    if (req.group_ids) {
      for (const gid of req.group_ids) {
        const groupContacts = db.contacts.filter(c => c.group_id === gid && c.user_id === user.id);
        groupContacts.forEach(c => recipientPhones.add(c.phone));
      }
    }

    const recipientCount = recipientPhones.size;
    if (recipientCount === 0) return fail('No valid recipients selected.');

    const { parts } = calculateSmsParts(req.message);
    const totalSms = parts * recipientCount;
    const balance = db.balances[user.id] || 0;

    if (balance < totalSms) {
      return fail(`Insufficient SMS balance. You need ${totalSms} SMS but only have ${balance}.`);
    }

    const pricePerSms = getPriceForQuantity(totalSms, db.tiers, db.settings.default_price_per_sms);
    const cost = totalSms * pricePerSms;

    // Check sender ID is approved
    const senderId = db.senderIds.find(s => s.id === req.sender_id || s.name === req.sender_id);
    if (!senderId || senderId.status !== 'APPROVED') {
      return fail('Sender ID is not approved.');
    }

    const isScheduled = req.schedule_date && req.schedule_time;
    const scheduledAt = isScheduled
      ? new Date(`${req.schedule_date}T${req.schedule_time}`).toISOString()
      : undefined;

    const campaign: Campaign = {
      id: generateId(),
      name: req.message.slice(0, 30) + (req.message.length > 30 ? '...' : ''),
      sender_id: senderId.name,
      message: req.message,
      recipient_count: recipientCount,
      sms_units: totalSms,
      status: isScheduled ? 'SCHEDULED' : 'PROCESSING',
      sent: 0,
      delivered: 0,
      failed: 0,
      pending: recipientCount,
      cost,
      currency: db.settings.currency,
      user_id: user.id,
      user_name: user.name,
      scheduled_at: scheduledAt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.campaigns.unshift(campaign);

    // Deduct balance and create ledger
    addTransaction(user.id, 'SMS_DEBIT', `Campaign: ${campaign.name}`, -totalSms);

    // Generate recipients
    const campaignRecipients: CampaignRecipient[] = Array.from(recipientPhones).map(phone => ({
      id: generateId(),
      phone,
      status: 'PENDING' as const,
    }));
    db.campaignRecipients[campaign.id] = campaignRecipients;

    // Simulate delivery processing for non-scheduled campaigns
    if (!isScheduled) {
      simulateDelivery(campaign.id, user.id);
    }

    addNotification(user.id, 'Campaign Created', `Your campaign "${campaign.name}" has been created and is processing.`, 'info');

    saveDb();
    return ok(campaign, 'Campaign created successfully. SMS credits have been deducted.');
  },

  async getHistory(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<Campaign>>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    let items = db.campaigns.filter(c => c.user_id === user.id);
    items = filterByParams(items, params, ['name', 'sender_id', 'message'] as any, 'status', 'created_at');
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return ok(paginate(items, params));
  },
};

function simulateDelivery(campaignId: string, userId: string) {
  const db = getDb();
  const campaign = db.campaigns.find(c => c.id === campaignId);
  const recipients = db.campaignRecipients[campaignId];
  if (!campaign || !recipients) return;

  // Process in batches with delays
  const batchSize = Math.max(1, Math.floor(recipients.length / 5));
  let processed = 0;

  const processBatch = () => {
    const db = getDb();
    const campaign = db.campaigns.find(c => c.id === campaignId);
    const recipients = db.campaignRecipients[campaignId];
    if (!campaign || !recipients) return;

    const end = Math.min(processed + batchSize, recipients.length);
    for (let i = processed; i < end; i++) {
      const r = recipients[i];
      const isDelivered = Math.random() < 0.97;
      r.status = isDelivered ? 'DELIVERED' : 'FAILED';
      r.sent_at = new Date().toISOString();
      if (isDelivered) r.delivered_at = new Date().toISOString();
      else r.error_message = 'Number not reachable';
      campaign.sent++;
      if (isDelivered) campaign.delivered++;
      else campaign.failed++;
      campaign.pending--;
    }
    processed = end;

    if (processed >= recipients.length) {
      campaign.status = 'COMPLETED';
      campaign.updated_at = new Date().toISOString();
      addNotification(userId, 'Campaign Completed', `Your campaign "${campaign.name}" has finished sending. Delivered: ${campaign.delivered}, Failed: ${campaign.failed}`, 'success');
      const balance = db.balances[userId] || 0;
      if (balance < db.settings.low_balance_threshold && balance > 0) {
        addNotification(userId, 'Low Balance Alert', `Your SMS balance is low. You have ${balance} SMS remaining.`, 'warning');
      }
    } else {
      campaign.updated_at = new Date().toISOString();
      setTimeout(processBatch, 2000);
    }
    saveDb();
  };

  setTimeout(processBatch, 1500);
}

// =========================
// Campaign Service
// =========================
export const mockCampaigns = {
  async list(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<Campaign>>> {
    return mockSms.getHistory(token, params);
  },

  async get(token: string, id: string): Promise<ApiResponse<CampaignDetail>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const campaign = db.campaigns.find(c => c.id === id);
    if (!campaign) return fail('Campaign not found.');
    if (campaign.user_id !== user.id && user.role === 'CUSTOMER') return fail('You do not have permission to view this campaign.');
    const recipients = db.campaignRecipients[id] || [];
    const timeline = generateTimeline(campaign);
    return ok({ ...campaign, recipients: recipients.slice(0, 100), timeline });
  },

  async cancel(token: string, id: string): Promise<ApiResponse<Campaign>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const campaign = db.campaigns.find(c => c.id === id);
    if (!campaign) return fail('Campaign not found.');
    if (campaign.user_id !== user.id) return fail('You do not have permission to cancel this campaign.');
    if (campaign.status === 'COMPLETED' || campaign.status === 'CANCELLED') return fail('This campaign cannot be cancelled.');
    campaign.status = 'CANCELLED';
    // Restore credits
    const refundAmount = campaign.sms_units - campaign.sent;
    if (refundAmount > 0) {
      addTransaction(user.id, 'REFUND', `Refund: Cancelled campaign ${campaign.name}`, refundAmount);
    }
    saveDb();
    return ok(campaign, 'Campaign cancelled. SMS credits have been refunded for unsent messages.');
  },

  async delete(token: string, id: string): Promise<ApiResponse<null>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const idx = db.campaigns.findIndex(c => c.id === id);
    if (idx === -1) return fail('Campaign not found.');
    if (db.campaigns[idx].user_id !== user.id) return fail('You do not have permission to delete this campaign.');
    db.campaigns.splice(idx, 1);
    delete db.campaignRecipients[id];
    saveDb();
    return ok(null, 'Campaign deleted successfully.');
  },
};

function generateTimeline(campaign: Campaign): CampaignRecipient['status'] extends never ? never : any[] {
  const events: any[] = [];
  events.push({ id: generateId(), event: 'Campaign Created', description: 'Campaign was created', timestamp: campaign.created_at });
  if (campaign.status === 'SCHEDULED' && campaign.scheduled_at) {
    events.push({ id: generateId(), event: 'Scheduled', description: `Campaign scheduled for ${new Date(campaign.scheduled_at).toLocaleString()}`, timestamp: campaign.created_at });
  }
  if (campaign.sent > 0) {
    events.push({ id: generateId(), event: 'Sending Started', description: 'Messages started sending', timestamp: campaign.updated_at });
  }
  if (campaign.status === 'COMPLETED') {
    events.push({ id: generateId(), event: 'Campaign Completed', description: `All messages processed. Delivered: ${campaign.delivered}, Failed: ${campaign.failed}`, timestamp: campaign.updated_at });
  }
  if (campaign.status === 'CANCELLED') {
    events.push({ id: generateId(), event: 'Campaign Cancelled', description: 'Campaign was cancelled by user', timestamp: campaign.updated_at });
  }
  return events;
}

// =========================
// Contacts Service
// =========================
export const mockContacts = {
  async list(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<Contact>>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    let items = db.contacts.filter(c => c.user_id === user.id);
    items = filterByParams(items as any, params, ['name', 'phone', 'email', 'company'] as any, undefined, 'created_at');
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return ok(paginate(items, params));
  },

  async create(token: string, data: Partial<Contact>): Promise<ApiResponse<Contact>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    if (!data.phone) return fail('Phone number is required.');
    if (!isValidKenyanPhone(data.phone)) return fail('Invalid Kenyan phone number.');
    const normalized = normalizePhoneNumber(data.phone);
    const existing = db.contacts.find(c => c.phone === normalized && c.user_id === user.id);
    if (existing) return fail('A contact with this phone number already exists.');
    const contact: Contact = {
      id: generateId(),
      name: data.name || '',
      phone: normalized,
      email: data.email || '',
      company: data.company || '',
      group_id: data.group_id,
      group_name: db.groups.find(g => g.id === data.group_id)?.name,
      status: 'active' as ContactStatus,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.contacts.push(contact);
    if (contact.group_id) {
      const grp = db.groups.find(g => g.id === contact.group_id);
      if (grp) grp.contact_count++;
    }
    saveDb();
    return ok(contact, 'Contact added successfully.');
  },

  async update(token: string, id: string, data: Partial<Contact>): Promise<ApiResponse<Contact>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const contact = db.contacts.find(c => c.id === id);
    if (!contact) return fail('Contact not found.');
    if (contact.user_id !== user.id) return fail('Permission denied.');
    if (data.phone) {
      const normalized = normalizePhoneNumber(data.phone);
      if (!isValidKenyanPhone(data.phone)) return fail('Invalid Kenyan phone number.');
      contact.phone = normalized;
    }
    if (data.name !== undefined) contact.name = data.name;
    if (data.email !== undefined) contact.email = data.email;
    if (data.company !== undefined) contact.company = data.company;
    if (data.group_id !== undefined) {
      if (contact.group_id) {
        const oldGrp = db.groups.find(g => g.id === contact.group_id);
        if (oldGrp) oldGrp.contact_count--;
      }
      contact.group_id = data.group_id;
      contact.group_name = db.groups.find(g => g.id === data.group_id)?.name;
      if (data.group_id) {
        const newGrp = db.groups.find(g => g.id === data.group_id);
        if (newGrp) newGrp.contact_count++;
      }
    }
    contact.updated_at = new Date().toISOString();
    saveDb();
    return ok(contact, 'Contact updated successfully.');
  },

  async delete(token: string, id: string): Promise<ApiResponse<null>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const idx = db.contacts.findIndex(c => c.id === id);
    if (idx === -1) return fail('Contact not found.');
    if (db.contacts[idx].user_id !== user.id) return fail('Permission denied.');
    const contact = db.contacts[idx];
    if (contact.group_id) {
      const grp = db.groups.find(g => g.id === contact.group_id);
      if (grp) grp.contact_count = Math.max(0, grp.contact_count - 1);
    }
    db.contacts.splice(idx, 1);
    saveDb();
    return ok(null, 'Contact deleted successfully.');
  },

  async import(token: string, contacts: Partial<Contact>[]): Promise<ApiResponse<ImportResult>> {
    await delay(500);
    const user = requireAuth(token);
    const db = getDb();
    let imported = 0, duplicates = 0, invalid = 0;
    for (const c of contacts) {
      if (!c.phone || !isValidKenyanPhone(c.phone)) {
        invalid++;
        continue;
      }
      const normalized = normalizePhoneNumber(c.phone);
      const existing = db.contacts.find(ec => ec.phone === normalized && ec.user_id === user.id);
      if (existing) {
        duplicates++;
        continue;
      }
      db.contacts.push({
        id: generateId(),
        name: c.name || '',
        phone: normalized,
        email: c.email || '',
        company: c.company || '',
        group_id: c.group_id,
        group_name: db.groups.find(g => g.id === c.group_id)?.name,
        status: 'active' as ContactStatus,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      imported++;
    }
    saveDb();
    return ok({ imported, duplicates, invalid, total: contacts.length }, `Import complete: ${imported} imported, ${duplicates} duplicates, ${invalid} invalid.`);
  },

  async export(token: string): Promise<ApiResponse<Contact[]>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const contacts = db.contacts.filter(c => c.user_id === user.id);
    return ok(contacts, 'Export successful.');
  },
};

// =========================
// Groups Service
// =========================
export const mockGroups = {
  async list(token: string): Promise<ApiResponse<ContactGroup[]>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const groups = db.groups.filter(g => g.user_id === user.id);
    return ok(groups);
  },

  async create(token: string, name: string, description?: string): Promise<ApiResponse<ContactGroup>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const group: ContactGroup = {
      id: generateId(),
      name,
      description,
      contact_count: 0,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.groups.push(group);
    saveDb();
    return ok(group, 'Group created successfully.');
  },

  async update(token: string, id: string, name: string, description?: string): Promise<ApiResponse<ContactGroup>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const group = db.groups.find(g => g.id === id);
    if (!group) return fail('Group not found.');
    if (group.user_id !== user.id) return fail('Permission denied.');
    group.name = name;
    group.description = description;
    group.updated_at = new Date().toISOString();
    saveDb();
    return ok(group, 'Group updated successfully.');
  },

  async delete(token: string, id: string): Promise<ApiResponse<null>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const idx = db.groups.findIndex(g => g.id === id);
    if (idx === -1) return fail('Group not found.');
    if (db.groups[idx].user_id !== user.id) return fail('Permission denied.');
    // Remove group_id from contacts
    db.contacts.forEach(c => {
      if (c.group_id === id) {
        c.group_id = undefined;
        c.group_name = undefined;
      }
    });
    db.groups.splice(idx, 1);
    saveDb();
    return ok(null, 'Group deleted successfully.');
  },
};

// =========================
// Sender IDs Service
// =========================
export const mockSenderIds = {
  async list(token: string): Promise<ApiResponse<SenderId[]>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const senderIds = db.senderIds.filter(s => s.user_id === user.id);
    return ok(senderIds);
  },

  async request(token: string, name: string): Promise<ApiResponse<SenderId>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const existing = db.senderIds.find(s => s.name === name && s.user_id === user.id);
    if (existing) return fail('You have already requested this Sender ID.');
    const senderId: SenderId = {
      id: generateId(),
      name: name.toUpperCase(),
      status: 'PENDING',
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.senderIds.push(senderId);
    saveDb();
    return ok(senderId, 'Sender ID request submitted for approval.');
  },
};

// =========================
// Pricing Service
// =========================
export const mockPricing = {
  async get(token: string): Promise<ApiResponse<any>> {
    await delay(100);
    requireAuth(token);
    const db = getDb();
    return ok({
      currency: db.settings.currency,
      currency_symbol: db.settings.currency_symbol,
      default_price_per_sms: db.settings.default_price_per_sms,
      sender_id_pricing: db.settings.sender_id_pricing,
      tiers: db.tiers.filter(t => t.active).sort((a, b) => a.min_quantity - b.min_quantity),
    });
  },

  async getPackages(token: string): Promise<ApiResponse<Package[]>> {
    await delay(100);
    requireAuth(token);
    const db = getDb();
    return ok(db.packages.filter(p => p.active).sort((a, b) => a.sort_order - b.sort_order));
  },
};

// =========================
// Payments Service
// =========================
export const mockPayments = {
  async list(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    let items = db.payments.filter(p => p.user_id === user.id);
    items = filterByParams(items as any, params, ['receipt_number', 'package_name'] as any, 'status', 'created_at');
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return ok(paginate(items, params));
  },

  async get(token: string, id: string): Promise<ApiResponse<Payment>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const payment = db.payments.find(p => p.id === id);
    if (!payment) return fail('Payment not found.');
    if (payment.user_id !== user.id && user.role === 'CUSTOMER') return fail('Permission denied.');
    return ok(payment);
  },

  async create(token: string, packageId: string, paymentMethod: Payment['payment_method']): Promise<ApiResponse<Payment>> {
    await delay(1500); // simulate payment processing
    const user = requireAuth(token);
    const db = getDb();
    const pkg = db.packages.find(p => p.id === packageId);
    if (!pkg) return fail('Package not found.');
    const receiptNumber = generateReceiptNumber();
    const payment: Payment = {
      id: generateId(),
      receipt_number: receiptNumber,
      user_id: user.id,
      user_name: user.name,
      package_id: pkg.id,
      package_name: pkg.name,
      sms_credits: pkg.sms_quantity,
      amount: pkg.price,
      currency: pkg.currency,
      payment_method: paymentMethod,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.payments.unshift(payment);
    addTransaction(user.id, 'PURCHASE', `Purchase: ${pkg.name} (${pkg.sms_quantity.toLocaleString()} SMS)`, pkg.sms_quantity, pkg.price, receiptNumber);
    addNotification(user.id, 'Payment Successful', `Your payment of ${db.settings.currency_symbol} ${pkg.price.toLocaleString()} for ${pkg.sms_quantity.toLocaleString()} SMS was successful.`, 'success');
    saveDb();
    return ok(payment, 'Payment successful. SMS credits have been added to your account.');
  },
};

// =========================
// Transactions Service
// =========================
export const mockTransactions = {
  async list(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    let items = db.transactions.filter(t => t.user_id === user.id);
    items = filterByParams(items as any, params, ['description', 'reference'] as any, 'status', 'created_at');
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return ok(paginate(items, params));
  },

  async get(token: string, id: string): Promise<ApiResponse<Transaction>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const tx = db.transactions.find(t => t.id === id);
    if (!tx) return fail('Transaction not found.');
    if (tx.user_id !== user.id && user.role === 'CUSTOMER') return fail('Permission denied.');
    return ok(tx);
  },
};

// =========================
// API Keys Service
// =========================
export const mockApiKeys = {
  async list(token: string): Promise<ApiResponse<ApiKey[]>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const keys = db.apiKeys.filter(k => k.user_id === user.id);
    return ok(keys);
  },

  async create(token: string, name: string): Promise<ApiResponse<ApiKey>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const key = generateApiKey();
    const apiKey: ApiKey = {
      id: generateId(),
      name,
      key,
      key_preview: key.slice(0, 20) + '...' + key.slice(-4),
      status: 'active',
      requests_count: 0,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };
    db.apiKeys.push(apiKey);
    saveDb();
    return ok(apiKey, 'API key generated successfully.');
  },

  async revoke(token: string, id: string): Promise<ApiResponse<null>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    const key = db.apiKeys.find(k => k.id === id);
    if (!key) return fail('API key not found.');
    if (key.user_id !== user.id) return fail('Permission denied.');
    key.status = 'revoked';
    saveDb();
    return ok(null, 'API key revoked successfully.');
  },
};

// =========================
// Notifications Service
// =========================
export const mockNotifications = {
  async list(token: string): Promise<ApiResponse<AppNotification[]>> {
    await delay(100);
    const user = requireAuth(token);
    const db = getDb();
    const notifs = db.notifications.filter(n => n.user_id === user.id);
    return ok(notifs);
  },

  async markRead(token: string, id: string): Promise<ApiResponse<null>> {
    await delay(100);
    const user = requireAuth(token);
    const db = getDb();
    const notif = db.notifications.find(n => n.id === id && n.user_id === user.id);
    if (notif) {
      notif.read = true;
      saveDb();
    }
    return ok(null, 'Notification marked as read.');
  },

  async markAllRead(token: string): Promise<ApiResponse<null>> {
    await delay(100);
    const user = requireAuth(token);
    const db = getDb();
    db.notifications.forEach(n => {
      if (n.user_id === user.id) n.read = true;
    });
    saveDb();
    return ok(null, 'All notifications marked as read.');
  },
};

// =========================
// Reports Service
// =========================
export const mockReports = {
  async overview(token: string, params: QueryParams): Promise<ApiResponse<ReportOverview>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    let campaigns = db.campaigns.filter(c => c.user_id === user.id);
    if (params.from) campaigns = campaigns.filter(c => new Date(c.created_at) >= new Date(params.from!));
    if (params.to) campaigns = campaigns.filter(c => new Date(c.created_at) <= new Date(params.to!));
    const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
    const totalDelivered = campaigns.reduce((s, c) => s + c.delivered, 0);
    const totalFailed = campaigns.reduce((s, c) => s + c.failed, 0);
    const totalPending = campaigns.reduce((s, c) => s + c.pending, 0);
    const totalSmsUnits = campaigns.reduce((s, c) => s + c.sms_units, 0);
    const totalCost = campaigns.reduce((s, c) => s + c.cost, 0);
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const byDate = generateUsageData(campaigns);
    const senderMap: Record<string, number> = {};
    campaigns.forEach(c => { senderMap[c.sender_id] = (senderMap[c.sender_id] || 0) + c.sent; });
    const bySender = Object.entries(senderMap).map(([sender_id, count]) => ({ sender_id, count }));
    return ok({
      total_sent: totalSent,
      total_delivered: totalDelivered,
      total_failed: totalFailed,
      total_pending: totalPending,
      delivery_rate: deliveryRate,
      failed_rate: totalSent > 0 ? (totalFailed / totalSent) * 100 : 0,
      total_sms_units: totalSmsUnits,
      total_cost: totalCost,
      currency: db.settings.currency,
      by_date: byDate,
      by_sender: bySender,
    });
  },
};

// =========================
// Settings Service
// =========================
export const mockSettings = {
  async get(token: string): Promise<ApiResponse<SystemSettings>> {
    await delay(100);
    requireAuth(token);
    const db = getDb();
    return ok(db.settings);
  },

  async update(token: string, data: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> {
    await delay();
    const user = requireAuth(token);
    const db = getDb();
    Object.assign(db.settings, data);
    saveDb();
    return ok(db.settings, 'Settings updated successfully.');
  },
};

// =========================
// Admin Services
// =========================
export const mockAdmin = {
  async dashboard(token: string): Promise<ApiResponse<AdminDashboardStats>> {
    await delay();
    requireAdmin(token);
    const db = getDb();
    const customers = db.users.filter(u => u.role === 'CUSTOMER');
    const activeCustomers = customers.filter(u => u.status === 'active');
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const campaignsToday = db.campaigns.filter(c => c.created_at.slice(0, 10) === today);
    const campaignsThisMonth = db.campaigns.filter(c => c.created_at.slice(0, 7) === thisMonth);
    const totalSmsCredits = Object.values(db.balances).reduce((s, b) => s + b, 0);
    const revenue = db.payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
    const pendingPayments = db.payments.filter(p => p.status === 'pending').length;
    const failedMessages = db.campaigns.reduce((s, c) => s + c.failed, 0);

    // Charts
    const customerGrowth: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = customers.filter(c => c.created_at.slice(0, 10) <= dateStr).length;
      customerGrowth.push({ date: dateStr, count });
    }
    const smsUsage: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = db.campaigns.filter(c => c.created_at.slice(0, 10) === dateStr).reduce((s, c) => s + c.sms_units, 0);
      smsUsage.push({ date: dateStr, count });
    }
    const revenueChart: { date: string; amount: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const amount = db.payments.filter(p => p.created_at.slice(0, 10) === dateStr && p.status === 'completed').reduce((s, p) => s + p.amount, 0);
      revenueChart.push({ date: dateStr, amount });
    }
    const deliveryRateTrend: { date: string; rate: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayCamp = db.campaigns.filter(c => c.created_at.slice(0, 10) === dateStr);
      const sent = dayCamp.reduce((s, c) => s + c.sent, 0);
      const del = dayCamp.reduce((s, c) => s + c.delivered, 0);
      deliveryRateTrend.push({ date: dateStr, rate: sent > 0 ? (del / sent) * 100 : 0 });
    }

    return ok({
      total_customers: customers.length,
      active_customers: activeCustomers.length,
      sms_sent_today: campaignsToday.reduce((s, c) => s + c.sent, 0),
      sms_sent_this_month: campaignsThisMonth.reduce((s, c) => s + c.sms_units, 0),
      total_sms_credits: totalSmsCredits,
      revenue,
      pending_payments: pendingPayments,
      failed_messages: failedMessages,
      customer_growth: customerGrowth,
      sms_usage: smsUsage,
      revenue_chart: revenueChart,
      delivery_rate_trend: deliveryRateTrend,
    });
  },

  async customers(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<AdminCustomer>>> {
    await delay();
    requireAdmin(token);
    const db = getDb();
    let items = db.users.filter(u => u.role === 'CUSTOMER');
    items = filterByParams(items as any, params, ['name', 'email', 'phone', 'business_name'] as any, 'status', 'created_at');
    const enriched: AdminCustomer[] = items.map(u => {
      const userCamp = db.campaigns.filter(c => c.user_id === u.id);
      const userPay = db.payments.filter(p => p.user_id === u.id && p.status === 'completed');
      return {
        ...u,
        sms_balance: db.balances[u.id] || 0,
        total_sent: userCamp.reduce((s, c) => s + c.sent, 0),
        total_delivered: userCamp.reduce((s, c) => s + c.delivered, 0),
        total_spent: userPay.reduce((s, p) => s + p.amount, 0),
        campaigns_count: userCamp.length,
        contacts_count: db.contacts.filter(c => c.user_id === u.id).length,
      };
    });
    enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return ok(paginate(enriched, params));
  },

  async customer(token: string, id: string): Promise<ApiResponse<AdminCustomer>> {
    await delay();
    requireAdmin(token);
    const db = getDb();
    const u = db.users.find(u => u.id === id);
    if (!u) return fail('Customer not found.');
    const userCamp = db.campaigns.filter(c => c.user_id === u.id);
    const userPay = db.payments.filter(p => p.user_id === u.id && p.status === 'completed');
    return ok({
      ...u,
      sms_balance: db.balances[u.id] || 0,
      total_sent: userCamp.reduce((s, c) => s + c.sent, 0),
      total_delivered: userCamp.reduce((s, c) => s + c.delivered, 0),
      total_spent: userPay.reduce((s, p) => s + p.amount, 0),
      campaigns_count: userCamp.length,
      contacts_count: db.contacts.filter(c => c.user_id === u.id).length,
    });
  },

  async updateCustomer(token: string, id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    await delay();
    const admin = requireAdmin(token);
    const db = getDb();
    const u = db.users.find(u => u.id === id);
    if (!u) return fail('Customer not found.');
    const before = { ...u };
    Object.assign(u, data);
    u.updated_at = new Date().toISOString();
    addAuditLog(admin.id, admin.name, 'UPDATE_CUSTOMER', u.name, 'User', JSON.stringify(before), JSON.stringify(u));
    saveDb();
    return ok(u, 'Customer updated successfully.');
  },

  async suspendCustomer(token: string, id: string, reason: string): Promise<ApiResponse<User>> {
    await delay();
    const admin = requireAdmin(token);
    const db = getDb();
    const u = db.users.find(u => u.id === id);
    if (!u) return fail('Customer not found.');
    u.status = 'suspended';
    u.updated_at = new Date().toISOString();
    addAuditLog(admin.id, admin.name, 'SUSPEND_CUSTOMER', u.name, 'User', 'active', 'suspended', reason);
    addNotification(u.id, 'Account Suspended', 'Your account has been suspended. Please contact support for assistance.', 'error');
    saveDb();
    return ok(u, 'Customer suspended successfully.');
  },

  async activateCustomer(token: string, id: string): Promise<ApiResponse<User>> {
    await delay();
    const admin = requireAdmin(token);
    const db = getDb();
    const u = db.users.find(u => u.id === id);
    if (!u) return fail('Customer not found.');
    u.status = 'active';
    u.updated_at = new Date().toISOString();
    addAuditLog(admin.id, admin.name, 'ACTIVATE_CUSTOMER', u.name, 'User', 'suspended', 'active');
    addNotification(u.id, 'Account Activated', 'Your account has been reactivated. You can now use the platform.', 'success');
    saveDb();
    return ok(u, 'Customer activated successfully.');
  },

  async adjustBalance(token: string, id: string, credits: number, reason: string): Promise<ApiResponse<{ user: User; transaction: Transaction }>> {
    await delay();
    const admin = requireAdmin(token);
    const db = getDb();
    const u = db.users.find(u => u.id === id);
    if (!u) return fail('Customer not found.');
    const before = db.balances[id] || 0;
    const tx = addTransaction(id, 'ADMIN_ADJUSTMENT', `Admin adjustment: ${reason}`, credits, 0, undefined, admin.name, reason);
    addAuditLog(admin.id, admin.name, 'ADJUST_BALANCE', u.name, 'User', String(before), String(before + credits), reason);
    if (credits > 0) {
      addNotification(id, 'SMS Credits Added', `${admin.name} added ${credits} SMS to your account. Reason: ${reason}`, 'success');
    } else {
      addNotification(id, 'SMS Credits Removed', `${admin.name} removed ${Math.abs(credits)} SMS from your account. Reason: ${reason}`, 'warning');
    }
    saveDb();
    return ok({ user: u, transaction: tx }, 'Balance adjusted successfully.');
  },

  async pricing(token: string): Promise<ApiResponse<any>> {
    await delay();
    requireAdmin(token);
    const db = getDb();
    return ok({
      currency: db.settings.currency,
      currency_symbol: db.settings.currency_symbol,
      default_price_per_sms: db.settings.default_price_per_sms,
      free_registration_credits: db.settings.free_registration_credits,
      low_balance_threshold: db.settings.low_balance_threshold,
      max_message_length: db.settings.max_message_length,
      minimum_purchase: db.settings.minimum_purchase,
      sender_id_pricing: db.settings.sender_id_pricing,
      tiers: db.tiers.sort((a, b) => a.min_quantity - b.min_quantity),
    });
  },

  async updatePricing(token: string, data: any): Promise<ApiResponse<any>> {
    await delay();
    const admin = requireAdmin(token);
    const db = getDb();
    if (data.default_price_per_sms !== undefined) {
      addAuditLog(admin.id, admin.name, 'UPDATE_PRICING', 'Default Price', 'SystemSetting', String(db.settings.default_price_per_sms), String(data.default_price_per_sms));
      db.settings.default_price_per_sms = data.default_price_per_sms;
    }
    if (data.free_registration_credits !== undefined) db.settings.free_registration_credits = data.free_registration_credits;
    if (data.low_balance_threshold !== undefined) {
      addAuditLog(admin.id, admin.name, 'UPDATE_SETTINGS', 'Low Balance Threshold', 'SystemSetting', String(db.settings.low_balance_threshold), String(data.low_balance_threshold));
      db.settings.low_balance_threshold = data.low_balance_threshold;
    }
    if (data.max_message_length !== undefined) db.settings.max_message_length = data.max_message_length;
    if (data.minimum_purchase !== undefined) db.settings.minimum_purchase = data.minimum_purchase;
    if (data.sender_id_pricing !== undefined) {
      addAuditLog(admin.id, admin.name, 'UPDATE_PRICING', 'Sender ID Pricing', 'SystemSetting', JSON.stringify(db.settings.sender_id_pricing), JSON.stringify(data.sender_id_pricing));
      db.settings.sender_id_pricing = data.sender_id_pricing;
    }
    saveDb();
    return ok({ ...db.settings, tiers: db.tiers }, 'Pricing updated successfully.');
  },

  async tiers(token: string): Promise<ApiResponse<PricingTier[]>> {
    await delay();
    requireAdmin(token);
    const db = getDb();
    return ok(db.tiers.sort((a, b) => a.min_quantity - b.min_quantity));
  },

  async createTier(token: string, data: Partial<PricingTier>): Promise<ApiResponse<PricingTier>> {
    await delay();
    const admin = requireAdmin(token);
    const db = getDb();
    const tier: PricingTier = {
      id: generateId(),
      min_quantity: data.min_quantity || 1,
      max_quantity: data.max_quantity ?? null,
      price_per_sms: data.price_per_sms || 0.50,
      label: data.label,
      active: data.active ?? true,
      sort_order: data.sort_order || db.tiers.length + 1,
    };
    db.tiers.push(tier);
    addAuditLog(admin.id, admin.name, 'CREATE_TIER', tier.label || `Tier ${tier.min_quantity}`, 'PricingTier', undefined, JSON.stringify(tier));
    saveDb();
    return ok(tier, 'Pricing tier created successfully.');
  },

  async updateTier(token: string, id: string, data: Partial<PricingTier>): Promise<ApiResponse<PricingTier>> {
    await delay();
    const admin = requireAdmin(token);
    const db = getDb();
    const tier = db.tiers.find(t => t.id === id);
    if (!tier) return fail('Tier not found.');
    const before = { ...tier };
    Object.assign(tier, data);
    addAuditLog(admin.id, admin.name, 'UPDATE_TIER', tier.label || `Tier ${tier.min_quantity}`, 'PricingTier', JSON.stringify(before), JSON.stringify(tier));
    saveDb();
    return ok(tier, 'Pricing tier updated successfully.');
  },

  async deleteTier(token: string, id: string): Promise<ApiResponse<null>> {
    await delay();
    const admin = requireAdmin(token);
    const db = getDb();
    const idx = db.tiers.findIndex(t => t.id === id);
    if (idx === -1) return fail('Tier not found.');
    addAuditLog(admin.id, admin.name, 'DELETE_TIER', db.tiers[idx].label || 'Tier', 'PricingTier');
    db.tiers.splice(idx, 1);
    saveDb();
    return ok(null, 'Pricing tier deleted successfully.');
  },

  async packages(token: string): Promise<ApiResponse<Package[]>> {
    await delay();
    requireAdmin(token);
    const db = getDb();
    return ok(db.packages.sort((a, b) => a.sort_order - b.sort_order));
  },

  async createPackage(token: string, data: Partial<Package>): Promise<ApiResponse<Package>> {
    await delay();
    const admin = requireAdmin(token);
    const db = getDb();
    const pkg: Package = {
      id: generateId(),
      name: data.name || '',
      sms_quantity: data.sms_quantity || 0,
      price: data.price || 0,
      currency: db.settings.currency,
      discount: data.discount || 0,
      active: data.active ?? true,
      featured: data.featured ?? false,
      sort_order: data.sort_order || db.packages.length + 1,
      description: data.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.packages.push(pkg);
    addAuditLog(admin.id, admin.name, 'CREATE_PACKAGE', pkg.name, 'Package', undefined, JSON.stringify(pkg));
    saveDb();
    return ok(pkg, 'Package created successfully.');
  },

  async updatePackage(token: string, id: string, data: Partial<Package>): Promise<ApiResponse<Package>> {
    await delay();
    const admin = requireAdmin(token);
    const db = getDb();
    const pkg = db.packages.find(p => p.id === id);
    if (!pkg) return fail('Package not found.');
    const before = { ...pkg };
    Object.assign(pkg, data);
    pkg.updated_at = new Date().toISOString();
    addAuditLog(admin.id, admin.name, 'UPDATE_PACKAGE', pkg.name, 'Package', JSON.stringify(before), JSON.stringify(pkg));
    saveDb();
    return ok(pkg, 'Package updated successfully.');
  },

  async deletePackage(token: string, id: string): Promise<ApiResponse<null>> {
    await delay();
    const admin = requireAdmin(token);
    const db = getDb();
    const idx = db.packages.findIndex(p => p.id === id);
    if (idx === -1) return fail('Package not found.');
    addAuditLog(admin.id, admin.name, 'DELETE_PACKAGE', db.packages[idx].name, 'Package');
    db.packages.splice(idx, 1);
    saveDb();
    return ok(null, 'Package deleted successfully.');
  },

  async campaigns(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<Campaign>>> {
    await delay();
    requireAdmin(token);
    const db = getDb();
    let items = [...db.campaigns];
    items = filterByParams(items as any, params, ['name', 'sender_id', 'user_name', 'message'] as any, 'status', 'created_at');
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return ok(paginate(items, params));
  },

  async campaign(token: string, id: string): Promise<ApiResponse<CampaignDetail>> {
    await delay();
    requireAdmin(token);
    const db = getDb();
    const campaign = db.campaigns.find(c => c.id === id);
    if (!campaign) return fail('Campaign not found.');
    const recipients = db.campaignRecipients[id] || [];
    const timeline = generateTimeline(campaign);
    return ok({ ...campaign, recipients: recipients.slice(0, 100), timeline });
  },

  async transactions(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    await delay();
    requireAdmin(token);
    const db = getDb();
    let items = [...db.transactions];
    items = filterByParams(items as any, params, ['description', 'user_name', 'reference'] as any, 'type', 'created_at');
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return ok(paginate(items, params));
  },

  async payments(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    await delay();
    requireAdmin(token);
    const db = getDb();
    let items = [...db.payments];
    items = filterByParams(items as any, params, ['receipt_number', 'user_name', 'package_name'] as any, 'status', 'created_at');
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return ok(paginate(items, params));
  },

  async senderIds(token: string): Promise<ApiResponse<SenderId[]>> {
    await delay();
    requireAdmin(token);
    const db = getDb();
    return ok(db.senderIds);
  },

  async approveSenderId(token: string, id: string): Promise<ApiResponse<SenderId>> {
    await delay();
    const admin = requireAdmin(token);
    const db = getDb();
    const sid = db.senderIds.find(s => s.id === id);
    if (!sid) return fail('Sender ID not found.');
    sid.status = 'APPROVED';
    sid.updated_at = new Date().toISOString();
    addAuditLog(admin.id, admin.name, 'APPROVE_SENDER_ID', sid.name, 'SenderId');
    addNotification(sid.user_id, 'Sender ID Approved', `Your Sender ID "${sid.name}" has been approved. You can now use it to send SMS.`, 'success');
    saveDb();
    return ok(sid, 'Sender ID approved successfully.');
  },

  async rejectSenderId(token: string, id: string, reason: string): Promise<ApiResponse<SenderId>> {
    await delay();
    const admin = requireAdmin(token);
    const db = getDb();
    const sid = db.senderIds.find(s => s.id === id);
    if (!sid) return fail('Sender ID not found.');
    sid.status = 'REJECTED';
    sid.rejection_reason = reason;
    sid.updated_at = new Date().toISOString();
    addAuditLog(admin.id, admin.name, 'REJECT_SENDER_ID', sid.name, 'SenderId', undefined, undefined, reason);
    addNotification(sid.user_id, 'Sender ID Rejected', `Your Sender ID "${sid.name}" has been rejected. Reason: ${reason}`, 'error');
    saveDb();
    return ok(sid, 'Sender ID rejected successfully.');
  },

  async auditLogs(token: string, params: QueryParams): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
    await delay();
    requireAdmin(token);
    const db = getDb();
    let items = [...db.auditLogs];
    items = filterByParams(items as any, params, ['admin_name', 'action', 'target'] as any, undefined, 'created_at');
    return ok(paginate(items, params));
  },

  async settings(token: string): Promise<ApiResponse<SystemSettings>> {
    await delay();
    requireAdmin(token);
    const db = getDb();
    return ok(db.settings);
  },

  async updateSettings(token: string, data: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> {
    await delay();
    const admin = requireAdmin(token);
    const db = getDb();
    const before = { ...db.settings };
    Object.assign(db.settings, data);
    addAuditLog(admin.id, admin.name, 'UPDATE_SETTINGS', 'System Settings', 'SystemSetting', JSON.stringify(before), JSON.stringify(db.settings));
    saveDb();
    return ok(db.settings, 'Settings updated successfully.');
  },
};
