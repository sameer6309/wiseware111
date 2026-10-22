/**
 * Shared Type Definitions for Wiseware AI Platform
 * Safe for import in both Client and Server Components.
 */

export interface DashboardMetrics {
  totalInferences: number;
  avgLatencyMs: number;
  accuracyRate: number;
  activeWorkflows: number;
  tokensUsedTotal: number;
  successfulInferences: number;
  failedInferences: number;
  modelCount: number;
  databaseConnected: boolean;
  aiMode: "production" | "demo";
}

export interface ModelRecord {
  id: string;
  name: string;
  slug: string;
  provider: string;
  version: string;
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  description?: string;
  contextWindow: number;
  avgLatencyMs: number;
  accuracyRate: number;
  isDefault: boolean;
}

export interface InferenceRecord {
  id: string;
  code: string;
  prompt: string;
  modelName: string;
  category: string;
  latencyMs: number;
  tokensUsed: number;
  confidenceScore: number;
  sentiment: "Positive" | "Neutral" | "Constructive" | "Critical";
  summary: string;
  keyInsights: string[];
  extractedEntities: string[];
  recommendations: string[];
  status: "Completed" | "Failed" | "Processing";
  isRealAI: boolean;
  createdAt: string;
}

export interface WorkflowRecord {
  id: string;
  name: string;
  description: string;
  triggerType: "SCHEDULE" | "EVENT" | "MANUAL" | "WEBHOOK";
  status: "ACTIVE" | "PAUSED" | "DRAFT";
  schedule: string;
  stepsCount: number;
  lastRunAt: string | null;
  lastStatus: "SUCCESS" | "FAILED" | "RUNNING" | null;
  createdAt: string;
}

export interface SystemLogRecord {
  id: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface DailyUsageRecord {
  date: string;
  tokensUsed: number;
  inferenceCount: number;
  avgLatencyMs: number;
  errorCount: number;
}

// -----------------------------------------------------------------------------
// Explorium AgentSource B2B Intelligence Types
// -----------------------------------------------------------------------------

export interface BusinessEnrichmentData {
  businessId: string | null;
  matchedName: string;
  domain: string;
  matchConfidence: number;
  companyName?: string;
  legalName?: string;
  industry?: string;
  subIndustry?: string;
  companySize?: string;
  employeeCount?: number | string;
  revenue?: number | string;
  revenueRange?: string;
  headquartersLocation?: string;
  city?: string;
  state?: string;
  country?: string;
  foundedYear?: number | string;
  companyType?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  description?: string;
  technologies?: string[];
  isMockPreview?: boolean;
  enrichedAt: string;
  rawResponse?: Record<string, unknown>;
}

export interface EnrichmentRequest {
  domain?: string;
  name?: string;
  url?: string;
  linkedinUrl?: string;
  enrichmentType?: "firmographics" | "technographics" | "comprehensive";
  authorizeCreditUsage?: boolean;
}

export interface EnrichmentResponse {
  success: boolean;
  data?: BusinessEnrichmentData;
  error?: string;
  code?: string;
  creditsUsed?: boolean;
  provider: string;
  message?: string;
}

export interface ExploriumStatus {
  isConfigured: boolean;
  provider: string;
  apiVersion: string;
  creditProtectionActive: boolean;
  requiresCreditConfirmation: boolean;
}

// -----------------------------------------------------------------------------
// Credits & Transaction Ledger Types
// -----------------------------------------------------------------------------

export type CreditTransactionType = "ADD" | "DEDUCT" | "REFUND";

export type CreditCategory =
  | "AI_INFERENCE"
  | "B2B_ENRICHMENT"
  | "TEST_PURCHASE"
  | "INITIAL_GRANT"
  | "SYSTEM_ADJUSTMENT";

export interface CreditAccount {
  id: string;
  userId: string;
  balance: number;
  totalAdded: number;
  totalUsed: number;
  tier: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransactionRecord {
  id: string;
  creditId: string;
  amount: number;
  balanceAfter: number;
  type: CreditTransactionType;
  category: CreditCategory;
  description: string;
  idempotencyKey?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface CreditsData {
  account: CreditAccount;
  transactions: CreditTransactionRecord[];
}

export interface DeductCreditsParams {
  userId?: string;
  amount: number;
  category: CreditCategory;
  description: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

export interface AddCreditsParams {
  userId?: string;
  amount: number;
  category?: CreditCategory;
  description: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}
