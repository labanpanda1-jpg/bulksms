import type {
  User, Campaign, Contact, ContactGroup, SenderId, PricingTier, Package,
  Payment, Transaction, ApiKey, AppNotification, AuditLog, SystemSettings, CampaignRecipient,
} from '@/types';
import {
  seedUsers, seedBalances, seedGroups, seedContacts, seedSenderIds, seedCampaigns,
  seedCampaignRecipients, seedTransactions, seedPayments, seedApiKeys, seedNotifications,
  seedAuditLogs, seedSettings, seedTiers, seedPackages, seedPasswords,
} from './seed';

const DB_KEY = 'abancool_db_v1';

interface Database {
  users: User[];
  passwords: Record<string, string>;
  balances: Record<string, number>;
  groups: ContactGroup[];
  contacts: Contact[];
  senderIds: SenderId[];
  campaigns: Campaign[];
  campaignRecipients: Record<string, CampaignRecipient[]>;
  transactions: Transaction[];
  payments: Payment[];
  apiKeys: ApiKey[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  tiers: PricingTier[];
  packages: Package[];
  sessions: Record<string, string>; // token -> userId
}

function createSeedDatabase(): Database {
  return {
    users: structuredClone(seedUsers),
    passwords: { ...seedPasswords },
    balances: { ...seedBalances },
    groups: structuredClone(seedGroups),
    contacts: structuredClone(seedContacts),
    senderIds: structuredClone(seedSenderIds),
    campaigns: structuredClone(seedCampaigns),
    campaignRecipients: structuredClone(seedCampaignRecipients),
    transactions: structuredClone(seedTransactions),
    payments: structuredClone(seedPayments),
    apiKeys: structuredClone(seedApiKeys),
    notifications: structuredClone(seedNotifications),
    auditLogs: structuredClone(seedAuditLogs),
    settings: structuredClone(seedSettings),
    tiers: structuredClone(seedTiers),
    packages: structuredClone(seedPackages),
    sessions: {},
  };
}

let db: Database | null = null;

export function getDb(): Database {
  if (db) return db;
  try {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
      db = JSON.parse(stored) as Database;
      return db;
    }
  } catch {
    // fall through
  }
  db = createSeedDatabase();
  saveDb();
  return db;
}

export function saveDb(): void {
  if (!db) return;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // storage full or unavailable
  }
}

export function resetDb(): void {
  db = createSeedDatabase();
  saveDb();
}

// Simulate async latency
export function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
