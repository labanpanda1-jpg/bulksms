import type {
  User, Campaign, Contact, ContactGroup, SenderId, PricingTier, Package,
  Payment, Transaction, ApiKey, AppNotification, AuditLog, SystemSettings, CampaignRecipient,
} from '@/types';
import { generateId } from '@/lib/sms';

const now = new Date();
function daysAgo(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}
function hoursAgo(hours: number): string {
  const d = new Date(now);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}
function minutesAgo(mins: number): string {
  const d = new Date(now);
  d.setMinutes(d.getMinutes() - mins);
  return d.toISOString();
}

// =========================
// System Settings
// =========================
export const seedSettings: SystemSettings = {
  company_name: 'ABANCOOL Bulk SMS',
  support_email: 'support@abancool.com',
  support_phone: '+254700000000',
  currency: 'KES',
  currency_symbol: 'KSh',
  timezone: 'Africa/Nairobi',
  free_registration_credits: 5,
  low_balance_threshold: 100,
  default_price_per_sms: 0.50,
  max_message_length: 918,
  minimum_purchase: 500,
  payment_methods: ['mpesa', 'card', 'bank_transfer'],
  email_notifications: true,
  sms_notifications: true,
  low_balance_alerts: true,
};

// =========================
// Pricing Tiers
// =========================
export const seedTiers: PricingTier[] = [
  { id: 'tier1', min_quantity: 1, max_quantity: 4999, price_per_sms: 0.50, label: 'Starter', active: true, sort_order: 1 },
  { id: 'tier2', min_quantity: 5000, max_quantity: 9999, price_per_sms: 0.45, label: 'Business', active: true, sort_order: 2 },
  { id: 'tier3', min_quantity: 10000, max_quantity: 29999, price_per_sms: 0.40, label: 'Professional', active: true, sort_order: 3 },
  { id: 'tier4', min_quantity: 30000, max_quantity: null, price_per_sms: 0.35, label: 'Enterprise', active: true, sort_order: 4 },
];

// =========================
// Packages
// =========================
export const seedPackages: Package[] = [
  { id: 'pkg1', name: 'Starter', sms_quantity: 5000, price: 2500, currency: 'KES', discount: 0, active: true, featured: false, sort_order: 1, description: 'Perfect for small businesses getting started', created_at: daysAgo(60), updated_at: daysAgo(10) },
  { id: 'pkg2', name: 'Business', sms_quantity: 10000, price: 4500, currency: 'KES', discount: 10, active: true, featured: true, sort_order: 2, description: 'Great value for growing businesses', created_at: daysAgo(60), updated_at: daysAgo(10) },
  { id: 'pkg3', name: 'Professional', sms_quantity: 30000, price: 12000, currency: 'KES', discount: 20, active: true, featured: false, sort_order: 3, description: 'For organizations with high volume needs', created_at: daysAgo(60), updated_at: daysAgo(10) },
  { id: 'pkg4', name: 'Enterprise', sms_quantity: 100000, price: 35000, currency: 'KES', discount: 30, active: true, featured: false, sort_order: 4, description: 'Maximum value for bulk SMS operations', created_at: daysAgo(60), updated_at: daysAgo(10) },
];

// =========================
// Users
// =========================
export const seedUsers: User[] = [
  {
    id: 'admin1', name: 'Laban Admin', email: 'admin@abancool.com', phone: '254700000001',
    role: 'SUPER_ADMIN', status: 'active', created_at: daysAgo(120), updated_at: daysAgo(1),
  },
  {
    id: 'admin2', name: 'Sarah Manager', email: 'manager@abancool.com', phone: '254700000002',
    role: 'ADMIN', status: 'active', created_at: daysAgo(90), updated_at: daysAgo(2),
  },
  {
    id: 'cust1', name: 'John Mwangi', email: 'customer@abancool.com', phone: '254712345678',
    role: 'CUSTOMER', business_name: 'Mwangi Electronics', status: 'active', created_at: daysAgo(45), updated_at: hoursAgo(3),
  },
  {
    id: 'cust2', name: 'Grace Achieng', email: 'grace@pandabiz.co.ke', phone: '254722334455',
    role: 'CUSTOMER', business_name: 'Panda Business Ltd', status: 'active', created_at: daysAgo(30), updated_at: hoursAgo(12),
  },
  {
    id: 'cust3', name: 'David Otieno', email: 'david@churchministry.org', phone: '254733445566',
    role: 'CUSTOMER', business_name: 'Church Ministry', status: 'active', created_at: daysAgo(20), updated_at: daysAgo(1),
  },
  {
    id: 'cust4', name: 'Mary Wanjiru', email: 'mary@fashionhub.ke', phone: '254744556677',
    role: 'CUSTOMER', business_name: 'Fashion Hub', status: 'suspended', created_at: daysAgo(15), updated_at: daysAgo(3),
  },
  {
    id: 'cust5', name: 'Peter Kamau', email: 'peter@schoolsys.ac.ke', phone: '254755667788',
    role: 'CUSTOMER', business_name: 'Greenfield School', status: 'active', created_at: daysAgo(10), updated_at: hoursAgo(6),
  },
  {
    id: 'cust6', name: 'Esther Njoki', email: 'esther@vipshop.ke', phone: '254766778899',
    role: 'CUSTOMER', business_name: 'VIP Shop', status: 'active', created_at: daysAgo(5), updated_at: hoursAgo(2),
  },
];

// =========================
// Balances (stored separately, keyed by user_id)
// =========================
export const seedBalances: Record<string, number> = {
  cust1: 5420,
  cust2: 1820,
  cust3: 320,
  cust4: 0,
  cust5: 850,
  cust6: 5,
};

// =========================
// Groups
// =========================
export const seedGroups: ContactGroup[] = [
  { id: 'grp1', name: 'Marketing', description: 'Marketing contacts', contact_count: 145, user_id: 'cust1', created_at: daysAgo(40), updated_at: daysAgo(5) },
  { id: 'grp2', name: 'Customers', description: 'Active customers', contact_count: 320, user_id: 'cust1', created_at: daysAgo(40), updated_at: daysAgo(2) },
  { id: 'grp3', name: 'Staff', description: 'Internal staff', contact_count: 28, user_id: 'cust1', created_at: daysAgo(35), updated_at: daysAgo(10) },
  { id: 'grp4', name: 'VIP Customers', description: 'Top tier customers', contact_count: 52, user_id: 'cust1', created_at: daysAgo(20), updated_at: daysAgo(1) },
  { id: 'grp5', name: 'Church Members', description: 'All church members', contact_count: 210, user_id: 'cust3', created_at: daysAgo(18), updated_at: daysAgo(3) },
  { id: 'grp6', name: 'Students', description: 'All students', contact_count: 480, user_id: 'cust5', created_at: daysAgo(9), updated_at: daysAgo(1) },
  { id: 'grp7', name: 'Parents', description: 'Parents of students', contact_count: 320, user_id: 'cust5', created_at: daysAgo(9), updated_at: daysAgo(2) },
];

// =========================
// Contacts
// =========================
function generateContacts(): Contact[] {
  const contacts: Contact[] = [];
  const names1 = ['John', 'Mary', 'Peter', 'Grace', 'David', 'Esther', 'James', 'Ruth', 'Samuel', 'Faith', 'Daniel', 'Joyce', 'Michael', 'Ann', 'Joseph', 'Rose', 'Brian', 'Lucy', 'Kevin', 'Nancy'];
  const names2 = ['Mwangi', 'Wanjiru', 'Kamau', 'Achieng', 'Otieno', 'Njoki', 'Maina', 'Wekesa', 'Kiprop', 'Cherono', 'Hassan', 'Ali', 'Mohamed', 'Yusuf', 'Ibrahim'];
  const companies = ['Tech Ltd', 'Fashions', 'Enterprises', 'Traders', 'Stores', 'Services', 'Group', 'Investments', 'Holdings', 'Supplies'];
  let id = 0;
  for (const uid of ['cust1', 'cust3', 'cust5', 'cust6']) {
    const count = uid === 'cust1' ? 60 : uid === 'cust5' ? 80 : 25;
    const grps = seedGroups.filter(g => g.user_id === uid);
    for (let i = 0; i < count; i++) {
      const fn = names1[Math.floor(Math.random() * names1.length)];
      const ln = names2[Math.floor(Math.random() * names2.length)];
      const phone = '2547' + Math.floor(10000000 + Math.random() * 89999999);
      const grp = Math.random() > 0.3 ? grps[Math.floor(Math.random() * grps.length)] : undefined;
      contacts.push({
        id: `ctct${++id}`,
        name: `${fn} ${ln}`,
        phone,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@email.com`,
        company: Math.random() > 0.5 ? companies[Math.floor(Math.random() * companies.length)] : '',
        group_id: grp?.id,
        group_name: grp?.name,
        status: Math.random() > 0.05 ? 'active' : 'inactive',
        user_id: uid,
        created_at: daysAgo(Math.floor(Math.random() * 40) + 1),
        updated_at: daysAgo(Math.floor(Math.random() * 10)),
      });
    }
  }
  return contacts;
}
export const seedContacts: Contact[] = generateContacts();

// =========================
// Sender IDs
// =========================
export const seedSenderIds: SenderId[] = [
  { id: 'sid1', name: 'ABANCOOL', status: 'APPROVED', user_id: 'cust1', created_at: daysAgo(40), updated_at: daysAgo(38) },
  { id: 'sid2', name: 'MWANGI', status: 'APPROVED', user_id: 'cust1', created_at: daysAgo(35), updated_at: daysAgo(33) },
  { id: 'sid3', name: 'PANDA', status: 'APPROVED', user_id: 'cust2', created_at: daysAgo(28), updated_at: daysAgo(26) },
  { id: 'sid4', name: 'CHURCH', status: 'APPROVED', user_id: 'cust3', created_at: daysAgo(18), updated_at: daysAgo(16) },
  { id: 'sid5', name: 'SCHOOL', status: 'APPROVED', user_id: 'cust5', created_at: daysAgo(8), updated_at: daysAgo(6) },
  { id: 'sid6', name: 'VIPSHOP', status: 'PENDING', user_id: 'cust6', created_at: daysAgo(3), updated_at: daysAgo(3) },
  { id: 'sid7', name: 'MYSHOP', status: 'PENDING', user_id: 'cust1', created_at: daysAgo(2), updated_at: daysAgo(2) },
  { id: 'sid8', name: 'FAZION', status: 'REJECTED', user_id: 'cust4', created_at: daysAgo(10), updated_at: daysAgo(8), rejection_reason: 'Name does not match registered business' },
];

// =========================
// Campaigns
// =========================
function generateRecipients(count: number, deliveredPct: number): CampaignRecipient[] {
  const recipients: CampaignRecipient[] = [];
  for (let i = 0; i < count; i++) {
    const isDelivered = Math.random() < deliveredPct;
    const isFailed = !isDelivered && Math.random() < 0.1;
    recipients.push({
      id: `rcpt${generateId()}`,
      phone: '2547' + Math.floor(10000000 + Math.random() * 89999999),
      name: Math.random() > 0.5 ? 'Contact ' + (i + 1) : undefined,
      status: isDelivered ? 'DELIVERED' : isFailed ? 'FAILED' : 'PENDING',
      sent_at: hoursAgo(Math.floor(Math.random() * 48)),
      delivered_at: isDelivered ? hoursAgo(Math.floor(Math.random() * 47)) : undefined,
      error_message: isFailed ? 'Number not reachable' : undefined,
    });
  }
  return recipients;
}

export const seedCampaigns: Campaign[] = [
  { id: 'cmp1', name: 'January Promo 2026', sender_id: 'ABANCOOL', message: 'Happy New Year! Get 20% off all electronics at Mwangi Electronics this January. Visit our store today!', recipient_count: 320, sms_units: 320, status: 'COMPLETED', sent: 320, delivered: 312, failed: 8, pending: 0, cost: 144.0, currency: 'KES', user_id: 'cust1', user_name: 'John Mwangi', created_at: daysAgo(20), updated_at: daysAgo(19) },
  { id: 'cmp2', name: 'Customer Reminder', sender_id: 'MWANGI', message: 'Dear customer, your order is ready for pickup. Please collect within 3 days. Thank you!', recipient_count: 145, sms_units: 145, status: 'COMPLETED', sent: 145, delivered: 142, failed: 3, pending: 0, cost: 72.5, currency: 'KES', user_id: 'cust1', user_name: 'John Mwangi', created_at: daysAgo(15), updated_at: daysAgo(14) },
  { id: 'cmp3', name: 'VIP Special Offer', sender_id: 'ABANCOOL', message: 'Exclusive VIP offer! 30% off premium products. Valid this weekend only. Show this SMS at checkout.', recipient_count: 52, sms_units: 52, status: 'COMPLETED', sent: 52, delivered: 51, failed: 1, pending: 0, cost: 23.4, currency: 'KES', user_id: 'cust1', user_name: 'John Mwangi', created_at: daysAgo(10), updated_at: daysAgo(9) },
  { id: 'cmp4', name: 'Staff Meeting Notice', sender_id: 'MWANGI', message: 'All staff are required to attend a general meeting on Friday at 9am in the main boardroom.', recipient_count: 28, sms_units: 28, status: 'COMPLETED', sent: 28, delivered: 28, failed: 0, pending: 0, cost: 14.0, currency: 'KES', user_id: 'cust1', user_name: 'John Mwangi', created_at: daysAgo(7), updated_at: daysAgo(6) },
  { id: 'cmp5', name: 'Flash Sale Alert', sender_id: 'ABANCOOL', message: 'FLASH SALE! 50% off all phones today only from 9am to 6pm. Stock is limited. Hurry!', recipient_count: 320, sms_units: 320, status: 'PROCESSING', sent: 180, delivered: 170, failed: 10, pending: 140, cost: 144.0, currency: 'KES', user_id: 'cust1', user_name: 'John Mwangi', created_at: hoursAgo(2), updated_at: minutesAgo(30) },
  { id: 'cmp6', name: 'Easter Sunday Service', sender_id: 'CHURCH', message: 'You are cordially invited to our Easter Sunday Service at 9am. Bring a friend! God bless you.', recipient_count: 210, sms_units: 210, status: 'COMPLETED', sent: 210, delivered: 205, failed: 5, pending: 0, cost: 84.0, currency: 'KES', user_id: 'cust3', user_name: 'David Otieno', created_at: daysAgo(12), updated_at: daysAgo(11) },
  { id: 'cmp7', name: 'Term Opening Notice', sender_id: 'SCHOOL', message: 'Dear parents, term 2 begins on Monday 6th January. Students should report by 8am. Thank you.', recipient_count: 320, sms_units: 320, status: 'COMPLETED', sent: 320, delivered: 315, failed: 5, pending: 0, cost: 128.0, currency: 'KES', user_id: 'cust5', user_name: 'Peter Kamau', created_at: daysAgo(8), updated_at: daysAgo(7) },
  { id: 'cmp8', name: 'Exam Results', sender_id: 'SCHOOL', message: 'End of term exam results are now available on the school portal. Please check your childs results.', recipient_count: 480, sms_units: 480, status: 'COMPLETED', sent: 480, delivered: 470, failed: 10, pending: 0, cost: 168.0, currency: 'KES', user_id: 'cust5', user_name: 'Peter Kamau', created_at: daysAgo(5), updated_at: daysAgo(4) },
  { id: 'cmp9', name: 'Panda Promo', sender_id: 'PANDA', message: 'Biggest sale of the year at Panda Business! Up to 40% off everything. This weekend only!', recipient_count: 200, sms_units: 200, status: 'COMPLETED', sent: 200, delivered: 195, failed: 5, pending: 0, cost: 80.0, currency: 'KES', user_id: 'cust2', user_name: 'Grace Achieng', created_at: daysAgo(14), updated_at: daysAgo(13) },
  { id: 'cmp10', name: 'Valentine Campaign', sender_id: 'ABANCOOL', message: 'This Valentine season, show love with the perfect gift from Mwangi Electronics. Special discounts on all accessories!', recipient_count: 320, sms_units: 640, status: 'SCHEDULED', sent: 0, delivered: 0, failed: 0, pending: 320, cost: 224.0, currency: 'KES', user_id: 'cust1', user_name: 'John Mwangi', scheduled_at: daysAgo(-5), created_at: hoursAgo(1), updated_at: hoursAgo(1) },
];

export const seedCampaignRecipients: Record<string, CampaignRecipient[]> = {
  cmp1: generateRecipients(320, 0.975),
  cmp2: generateRecipients(145, 0.979),
  cmp3: generateRecipients(52, 0.98),
  cmp5: generateRecipients(320, 0.53),
};

// =========================
// Transactions
// =========================
export const seedTransactions: Transaction[] = [
  // cust1
  { id: 'tx1', user_id: 'cust1', user_name: 'John Mwangi', type: 'BONUS', description: 'Registration bonus', credits: 5, balance_after: 5, amount: 0, currency: 'KES', status: 'completed', created_at: daysAgo(45) },
  { id: 'tx2', user_id: 'cust1', user_name: 'John Mwangi', type: 'PURCHASE', description: 'Purchase: Starter (5,000 SMS)', credits: 5000, balance_after: 5005, amount: 2500, currency: 'KES', status: 'completed', reference: 'RCP1700001', created_at: daysAgo(42) },
  { id: 'tx3', user_id: 'cust1', user_name: 'John Mwangi', type: 'SMS_DEBIT', description: 'Campaign: January Promo 2026', credits: -320, balance_after: 4685, amount: 0, currency: 'KES', status: 'completed', created_at: daysAgo(20) },
  { id: 'tx4', user_id: 'cust1', user_name: 'John Mwangi', type: 'PURCHASE', description: 'Purchase: Business (10,000 SMS)', credits: 10000, balance_after: 14685, amount: 4500, currency: 'KES', status: 'completed', reference: 'RCP1700002', created_at: daysAgo(18) },
  { id: 'tx5', user_id: 'cust1', user_name: 'John Mwangi', type: 'SMS_DEBIT', description: 'Campaign: Customer Reminder', credits: -145, balance_after: 14540, amount: 0, currency: 'KES', status: 'completed', created_at: daysAgo(15) },
  { id: 'tx6', user_id: 'cust1', user_name: 'John Mwangi', type: 'SMS_DEBIT', description: 'Campaign: VIP Special Offer', credits: -52, balance_after: 14488, amount: 0, currency: 'KES', status: 'completed', created_at: daysAgo(10) },
  { id: 'tx7', user_id: 'cust1', user_name: 'John Mwangi', type: 'SMS_DEBIT', description: 'Campaign: Staff Meeting Notice', credits: -28, balance_after: 14460, amount: 0, currency: 'KES', status: 'completed', created_at: daysAgo(7) },
  { id: 'tx8', user_id: 'cust1', user_name: 'John Mwangi', type: 'PURCHASE', description: 'Purchase: Professional (30,000 SMS)', credits: 30000, balance_after: 44460, amount: 12000, currency: 'KES', status: 'completed', reference: 'RCP1700003', created_at: daysAgo(4) },
  { id: 'tx9', user_id: 'cust1', user_name: 'John Mwangi', type: 'SMS_DEBIT', description: 'Campaign: Flash Sale Alert', credits: -320, balance_after: 44140, amount: 0, currency: 'KES', status: 'completed', created_at: hoursAgo(2) },
  { id: 'tx10', user_id: 'cust1', user_name: 'John Mwangi', type: 'SMS_DEBIT', description: 'Campaign: Flash Sale Alert (processing)', credits: -320, balance_after: 5420, amount: 0, currency: 'KES', status: 'completed', created_at: hoursAgo(2) },
  // cust2
  { id: 'tx11', user_id: 'cust2', user_name: 'Grace Achieng', type: 'BONUS', description: 'Registration bonus', credits: 5, balance_after: 5, amount: 0, currency: 'KES', status: 'completed', created_at: daysAgo(30) },
  { id: 'tx12', user_id: 'cust2', user_name: 'Grace Achieng', type: 'PURCHASE', description: 'Purchase: Business (10,000 SMS)', credits: 10000, balance_after: 10005, amount: 4500, currency: 'KES', status: 'completed', reference: 'RCP1700004', created_at: daysAgo(28) },
  { id: 'tx13', user_id: 'cust2', user_name: 'Grace Achieng', type: 'SMS_DEBIT', description: 'Campaign: Panda Promo', credits: -200, balance_after: 9805, amount: 0, currency: 'KES', status: 'completed', created_at: daysAgo(14) },
  { id: 'tx14', user_id: 'cust2', user_name: 'Grace Achieng', type: 'PURCHASE', description: 'Purchase: Starter (5,000 SMS)', credits: 5000, balance_after: 14805, amount: 2500, currency: 'KES', status: 'completed', reference: 'RCP1700005', created_at: daysAgo(3) },
  // cust3
  { id: 'tx15', user_id: 'cust3', user_name: 'David Otieno', type: 'BONUS', description: 'Registration bonus', credits: 5, balance_after: 5, amount: 0, currency: 'KES', status: 'completed', created_at: daysAgo(20) },
  { id: 'tx16', user_id: 'cust3', user_name: 'David Otieno', type: 'PURCHASE', description: 'Purchase: Starter (5,000 SMS)', credits: 5000, balance_after: 5005, amount: 2500, currency: 'KES', status: 'completed', reference: 'RCP1700006', created_at: daysAgo(18) },
  { id: 'tx17', user_id: 'cust3', user_name: 'David Otieno', type: 'SMS_DEBIT', description: 'Campaign: Easter Sunday Service', credits: -210, balance_after: 4795, amount: 0, currency: 'KES', status: 'completed', created_at: daysAgo(12) },
  // cust5
  { id: 'tx18', user_id: 'cust5', user_name: 'Peter Kamau', type: 'BONUS', description: 'Registration bonus', credits: 5, balance_after: 5, amount: 0, currency: 'KES', status: 'completed', created_at: daysAgo(10) },
  { id: 'tx19', user_id: 'cust5', user_name: 'Peter Kamau', type: 'PURCHASE', description: 'Purchase: Starter (5,000 SMS)', credits: 5000, balance_after: 5005, amount: 2500, currency: 'KES', status: 'completed', reference: 'RCP1700007', created_at: daysAgo(8) },
  { id: 'tx20', user_id: 'cust5', user_name: 'Peter Kamau', type: 'SMS_DEBIT', description: 'Campaign: Term Opening Notice', credits: -320, balance_after: 4685, amount: 0, currency: 'KES', status: 'completed', created_at: daysAgo(8) },
  { id: 'tx21', user_id: 'cust5', user_name: 'Peter Kamau', type: 'SMS_DEBIT', description: 'Campaign: Exam Results', credits: -480, balance_after: 4205, amount: 0, currency: 'KES', status: 'completed', created_at: daysAgo(5) },
  // cust6
  { id: 'tx22', user_id: 'cust6', user_name: 'Esther Njoki', type: 'BONUS', description: 'Registration bonus', credits: 5, balance_after: 5, amount: 0, currency: 'KES', status: 'completed', created_at: daysAgo(5) },
];

// =========================
// Payments
// =========================
export const seedPayments: Payment[] = [
  { id: 'pay1', receipt_number: 'RCP1700001', user_id: 'cust1', user_name: 'John Mwangi', package_id: 'pkg1', package_name: 'Starter', sms_credits: 5000, amount: 2500, currency: 'KES', payment_method: 'mpesa', status: 'completed', created_at: daysAgo(42), updated_at: daysAgo(42) },
  { id: 'pay2', receipt_number: 'RCP1700002', user_id: 'cust1', user_name: 'John Mwangi', package_id: 'pkg2', package_name: 'Business', sms_credits: 10000, amount: 4500, currency: 'KES', payment_method: 'mpesa', status: 'completed', created_at: daysAgo(18), updated_at: daysAgo(18) },
  { id: 'pay3', receipt_number: 'RCP1700003', user_id: 'cust1', user_name: 'John Mwangi', package_id: 'pkg3', package_name: 'Professional', sms_credits: 30000, amount: 12000, currency: 'KES', payment_method: 'mpesa', status: 'completed', created_at: daysAgo(4), updated_at: daysAgo(4) },
  { id: 'pay4', receipt_number: 'RCP1700004', user_id: 'cust2', user_name: 'Grace Achieng', package_id: 'pkg2', package_name: 'Business', sms_credits: 10000, amount: 4500, currency: 'KES', payment_method: 'mpesa', status: 'completed', created_at: daysAgo(28), updated_at: daysAgo(28) },
  { id: 'pay5', receipt_number: 'RCP1700005', user_id: 'cust2', user_name: 'Grace Achieng', package_id: 'pkg1', package_name: 'Starter', sms_credits: 5000, amount: 2500, currency: 'KES', payment_method: 'card', status: 'completed', created_at: daysAgo(3), updated_at: daysAgo(3) },
  { id: 'pay6', receipt_number: 'RCP1700006', user_id: 'cust3', user_name: 'David Otieno', package_id: 'pkg1', package_name: 'Starter', sms_credits: 5000, amount: 2500, currency: 'KES', payment_method: 'mpesa', status: 'completed', created_at: daysAgo(18), updated_at: daysAgo(18) },
  { id: 'pay7', receipt_number: 'RCP1700007', user_id: 'cust5', user_name: 'Peter Kamau', package_id: 'pkg1', package_name: 'Starter', sms_credits: 5000, amount: 2500, currency: 'KES', payment_method: 'mpesa', status: 'completed', created_at: daysAgo(8), updated_at: daysAgo(8) },
];

// =========================
// API Keys
// =========================
export const seedApiKeys: ApiKey[] = [
  { id: 'ak1', name: 'Production', key: 'abancool_sk_prod_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz', key_preview: 'abancool_sk_prod_abc...yz', status: 'active', requests_count: 15420, user_id: 'cust1', created_at: daysAgo(30), last_used: hoursAgo(1) },
  { id: 'ak2', name: 'Testing', key: 'abancool_sk_test_xyz987wvu654tsr321qpo098mln765kji432hgf109edc876ba', key_preview: 'abancool_sk_test_xyz...ba', status: 'active', requests_count: 320, user_id: 'cust1', created_at: daysAgo(15), last_used: daysAgo(2) },
];

// =========================
// Notifications
// =========================
export const seedNotifications: AppNotification[] = [
  { id: 'ntf1', user_id: 'cust1', title: 'Campaign Completed', message: 'Your campaign "January Promo 2026" has finished sending. Delivered: 312, Failed: 8', type: 'success', read: false, created_at: daysAgo(19) },
  { id: 'ntf2', user_id: 'cust1', title: 'Payment Successful', message: 'Your payment of KSh 4,500.00 for 10,000 SMS was successful.', type: 'success', read: false, created_at: daysAgo(18) },
  { id: 'ntf3', user_id: 'cust1', title: 'Campaign Completed', message: 'Your campaign "Customer Reminder" has finished sending. Delivered: 142, Failed: 3', type: 'success', read: true, created_at: daysAgo(14) },
  { id: 'ntf4', user_id: 'cust1', title: 'Low Balance Alert', message: 'Your SMS balance is low. Consider purchasing more credits.', type: 'warning', read: false, created_at: hoursAgo(3) },
  { id: 'ntf5', user_id: 'cust1', title: 'Campaign Processing', message: 'Your campaign "Flash Sale Alert" is currently processing.', type: 'info', read: false, created_at: hoursAgo(2) },
  { id: 'ntf6', user_id: 'cust3', title: 'Campaign Completed', message: 'Your campaign "Easter Sunday Service" has finished sending. Delivered: 205, Failed: 5', type: 'success', read: false, created_at: daysAgo(11) },
];

// =========================
// Audit Logs
// =========================
export const seedAuditLogs: AuditLog[] = [
  { id: 'al1', admin_id: 'admin1', admin_name: 'Laban Admin', action: 'APPROVE_SENDER_ID', target: 'ABANCOOL', target_type: 'SenderId', ip: '41.90.0.1', created_at: daysAgo(38) },
  { id: 'al2', admin_id: 'admin1', admin_name: 'Laban Admin', action: 'APPROVE_SENDER_ID', target: 'MWANGI', target_type: 'SenderId', ip: '41.90.0.1', created_at: daysAgo(33) },
  { id: 'al3', admin_id: 'admin1', admin_name: 'Laban Admin', action: 'REJECT_SENDER_ID', target: 'FAZION', target_type: 'SenderId', ip: '41.90.0.1', reason: 'Name does not match registered business', created_at: daysAgo(8) },
  { id: 'al4', admin_id: 'admin1', admin_name: 'Laban Admin', action: 'SUSPEND_CUSTOMER', target: 'Mary Wanjiru', target_type: 'User', ip: '41.90.0.1', reason: 'Payment default', created_at: daysAgo(3) },
  { id: 'al5', admin_id: 'admin1', admin_name: 'Laban Admin', action: 'ADJUST_BALANCE', target: 'John Mwangi', target_type: 'User', ip: '41.90.0.1', before: '0', after: '5000', reason: 'Purchase approved', created_at: daysAgo(42) },
  { id: 'al6', admin_id: 'admin1', admin_name: 'Laban Admin', action: 'UPDATE_PRICING', target: 'Business Tier', target_type: 'PricingTier', ip: '41.90.0.1', before: '0.50', after: '0.45', created_at: daysAgo(30) },
  { id: 'al7', admin_id: 'admin1', admin_name: 'Laban Admin', action: 'UPDATE_SETTINGS', target: 'Low Balance Threshold', target_type: 'SystemSetting', ip: '41.90.0.1', before: '50', after: '100', created_at: daysAgo(20) },
  { id: 'al8', admin_id: 'admin1', admin_name: 'Laban Admin', action: 'CREATE_PACKAGE', target: 'Enterprise', target_type: 'Package', ip: '41.90.0.1', created_at: daysAgo(60) },
];

// =========================
// Passwords (demo only)
// =========================
export const seedPasswords: Record<string, string> = {
  'admin@abancool.com': 'admin123',
  'manager@abancool.com': 'admin123',
  'customer@abancool.com': 'customer123',
  'grace@pandabiz.co.ke': 'customer123',
  'david@churchministry.org': 'customer123',
  'mary@fashionhub.ke': 'customer123',
  'peter@schoolsys.ac.ke': 'customer123',
  'esther@vipshop.ke': 'customer123',
};
