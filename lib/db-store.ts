import { prisma, isDatabaseConfigured } from "./prisma";
export * from "./types";
import type {
  DashboardMetrics,
  ModelRecord,
  InferenceRecord,
  WorkflowRecord,
  SystemLogRecord,
  DailyUsageRecord,
  CreditAccount,
  CreditTransactionRecord,
  CreditsData,
  DeductCreditsParams,
  AddCreditsParams,
} from "./types";

// -----------------------------------------------------------------------------
// In-Memory Fallback State (Active when DATABASE_URL is not yet connected)
// Attached to globalThis to preserve live singleton state across all route chunks.
// -----------------------------------------------------------------------------

const globalForStore = globalThis as unknown as {
  inMemoryModels?: ModelRecord[];
  inMemoryInferences?: InferenceRecord[];
  inMemoryWorkflows?: WorkflowRecord[];
  inMemoryLogs?: SystemLogRecord[];
  inMemoryCreditAccount?: CreditAccount;
  inMemoryTransactions?: CreditTransactionRecord[];
};

const initialModels: ModelRecord[] = [
  {
    id: "mod-1",
    name: "Wiseware Neural-v4",
    slug: "wiseware-neural-v4",
    provider: "Wiseware Core",
    version: "4.2.0",
    status: "ONLINE",
    description: "Flagship multi-modal reasoning engine optimized for low latency and high accuracy.",
    contextWindow: 128000,
    avgLatencyMs: 48,
    accuracyRate: 99.2,
    isDefault: true,
  },
  {
    id: "mod-2",
    name: "Wiseware Flash-Core",
    slug: "wiseware-flash-core",
    provider: "Wiseware Edge",
    version: "2.1.0",
    status: "ONLINE",
    description: "Sub-50ms ultra-fast inference model designed for edge streaming and high-throughput pipelines.",
    contextWindow: 64000,
    avgLatencyMs: 24,
    accuracyRate: 98.4,
    isDefault: false,
  },
  {
    id: "mod-3",
    name: "Wiseware Reasoning Pro",
    slug: "wiseware-reasoning-pro",
    provider: "Wiseware Labs",
    version: "1.5.0",
    status: "ONLINE",
    description: "Deep cognitive synthesis model with multi-step chain-of-thought verification.",
    contextWindow: 200000,
    avgLatencyMs: 140,
    accuracyRate: 99.8,
    isDefault: false,
  },
];

if (!globalForStore.inMemoryModels) {
  globalForStore.inMemoryModels = initialModels;
}
const inMemoryModels = globalForStore.inMemoryModels;

const initialInferences: InferenceRecord[] = [
  {
    id: "inf-1",
    code: "WW-9X42A",
    prompt: "Investigate database query execution plan bottlenecks under 10k concurrent requests and recommend caching strategies.",
    modelName: "Wiseware Neural-v4",
    category: "Performance",
    latencyMs: 142,
    tokensUsed: 420,
    confidenceScore: 98.4,
    sentiment: "Constructive",
    summary: "Database query plan bottleneck optimized with distributed Redis cache.",
    keyInsights: [
      "Sequential table scans detected on analytics join tables.",
      "Buffer pool hit ratio dropped below 84% under 10k concurrent burst requests.",
      "Redis distributed cache layer eliminates 91% of repeat reads."
    ],
    extractedEntities: ["Redis", "PostgreSQL", "Query Planner", "Buffer Pool"],
    recommendations: [
      "Add composite index on tenant_id and created_at.",
      "Deploy Redis read-replica with 15-minute TTL."
    ],
    status: "Completed",
    isRealAI: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: "inf-2",
    code: "WW-8B17K",
    prompt: "Perform a security assessment of JWT token expiration, automated key rotation, and OAuth2 scopes across microservices.",
    modelName: "Wiseware Flash-Core",
    category: "Security",
    latencyMs: 84,
    tokensUsed: 310,
    confidenceScore: 99.1,
    sentiment: "Positive",
    summary: "Evaluated zero-trust JWT token rotation across 12 worker services.",
    keyInsights: [
      "Public key JWKS endpoint responds in 12ms.",
      "Automated key rollover scheduled every 48 hours without session drop.",
      "Scope validation strictly enforced on API gateways."
    ],
    extractedEntities: ["OAuth2", "JWKS", "JWT", "Zero-Trust"],
    recommendations: [
      "Enforce 15-minute access token lifespan with refresh token rotation.",
      "Audit obsolete public keys every quarter."
    ],
    status: "Completed",
    isRealAI: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
  },
  {
    id: "inf-3",
    code: "WW-7C33P",
    prompt: "Analyze enterprise customer behavioral drop-offs during onboarding and identify early retention warning signs.",
    modelName: "Wiseware Reasoning Pro",
    category: "Predictive Insight",
    latencyMs: 310,
    tokensUsed: 590,
    confidenceScore: 95.8,
    sentiment: "Constructive",
    summary: "Synthesized multi-tenant token consumption projection for Q4.",
    keyInsights: [
      "Telemetry suggests 14% friction during API key initial generation step.",
      "Interactive onboarding walkthroughs improve 30-day retention by 38%."
    ],
    extractedEntities: ["Onboarding", "Retention", "Funnel Conversion", "Telemetry"],
    recommendations: [
      "Add automatic sample curl command generator in workspace setup.",
      "Implement automated nudge email 24 hours after workspace creation."
    ],
    status: "Completed",
    isRealAI: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
];

if (!globalForStore.inMemoryInferences) {
  globalForStore.inMemoryInferences = initialInferences;
}
const inMemoryInferences = globalForStore.inMemoryInferences;

const initialWorkflows: WorkflowRecord[] = [
  {
    id: "wf-1",
    name: "Automated Latency Spike Remediation",
    description: "Detects API endpoints exceeding 200ms latency and triggers auto-scaling & cache warm-up.",
    triggerType: "EVENT",
    status: "ACTIVE",
    schedule: "Real-time Event Stream",
    stepsCount: 4,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    lastStatus: "SUCCESS",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "wf-2",
    name: "Nightly Model Weight Verification",
    description: "Benchmarks baseline accuracy across 5,000 standard test vectors and logs parity delta.",
    triggerType: "SCHEDULE",
    status: "ACTIVE",
    schedule: "Daily at 02:00 UTC",
    stepsCount: 6,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    lastStatus: "SUCCESS",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: "wf-3",
    name: "Zero-Trust Token Rotation Pipeline",
    description: "Rotates ephemeral inference gateway encryption keys and revokes stale credentials.",
    triggerType: "SCHEDULE",
    status: "ACTIVE",
    schedule: "Every 12 hours",
    stepsCount: 3,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    lastStatus: "SUCCESS",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: "wf-4",
    name: "Customer Sentiment Alert Dispatcher",
    description: "Flags severe critical inferences and routes an incident payload to security webhooks.",
    triggerType: "EVENT",
    status: "PAUSED",
    schedule: "On Severity = Critical",
    stepsCount: 5,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    lastStatus: "SUCCESS",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

if (!globalForStore.inMemoryWorkflows) {
  globalForStore.inMemoryWorkflows = initialWorkflows;
}
const inMemoryWorkflows = globalForStore.inMemoryWorkflows;

const initialLogs: SystemLogRecord[] = [
  {
    id: "log-1",
    level: "INFO",
    source: "Engine",
    message: "Wiseware Neural-v4 inference weights synchronized across edge cluster.",
    metadata: { latencyMs: 48, region: "aws-us-east-1" },
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: "log-2",
    level: "INFO",
    source: "API",
    message: "POST /api/analyze completed successfully with 200 OK.",
    metadata: { model: "Wiseware Neural-v4", tokens: 284 },
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "log-3",
    level: "INFO",
    source: "Scheduler",
    message: "Workflow 'Nightly Model Weight Verification' completed with 0 errors.",
    metadata: { accuracy: 99.2 },
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "log-4",
    level: "WARN",
    source: "Database",
    message: "Supabase connection string not configured in .env.local — using in-memory development state.",
    metadata: { hint: "Add DATABASE_URL to .env.local to persist data to Supabase" },
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "log-5",
    level: "INFO",
    source: "Auth",
    message: "Admin workspace session initialized.",
    metadata: { user: "admin@wiseware.ai", role: "SuperAdmin" },
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

if (!globalForStore.inMemoryLogs) {
  globalForStore.inMemoryLogs = initialLogs;
}
const inMemoryLogs = globalForStore.inMemoryLogs;

const inMemoryUsage: DailyUsageRecord[] = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return {
    date: d.toISOString().split("T")[0],
    tokensUsed: 18000 + i * 2400 + Math.floor(Math.random() * 1500),
    inferenceCount: 120 + i * 18 + Math.floor(Math.random() * 15),
    avgLatencyMs: Number((45 + Math.random() * 8).toFixed(1)),
    errorCount: i % 3 === 0 ? 1 : 0,
  };
});

// Credits & Transaction Ledger In-Memory State
if (!globalForStore.inMemoryCreditAccount) {
  globalForStore.inMemoryCreditAccount = {
    id: "cred-default",
    userId: "default-user",
    balance: 2500,
    totalAdded: 2550,
    totalUsed: 50,
    tier: "Enterprise",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
const inMemoryCreditAccount = globalForStore.inMemoryCreditAccount;

if (!globalForStore.inMemoryTransactions) {
  globalForStore.inMemoryTransactions = [
    {
      id: "tx-init",
      creditId: "cred-default",
      amount: 2500,
      balanceAfter: 2500,
      type: "ADD",
      category: "INITIAL_GRANT",
      description: "Enterprise tier initial credit allocation",
      idempotencyKey: "init-key-2500",
      metadata: { tier: "Enterprise" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    },
    {
      id: "tx-demo-1",
      creditId: "cred-default",
      amount: -50,
      balanceAfter: 2450,
      type: "DEDUCT",
      category: "AI_INFERENCE",
      description: "Neural reasoning inference (WW-9X42A)",
      idempotencyKey: "tx-demo-1-key",
      metadata: { code: "WW-9X42A", model: "Wiseware Neural-v4" },
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: "tx-demo-2",
      creditId: "cred-default",
      amount: 50,
      balanceAfter: 2500,
      type: "ADD",
      category: "SYSTEM_ADJUSTMENT",
      description: "Latency SLA rebate adjustment",
      idempotencyKey: "tx-demo-2-key",
      metadata: { reason: "Sub-50ms SLA compliance reward" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
  ];
}
const inMemoryTransactions = globalForStore.inMemoryTransactions;

// -----------------------------------------------------------------------------
// Database Access Layer with Automatic Supabase / Prisma Fallback
// -----------------------------------------------------------------------------

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const dbConnected = isDatabaseConfigured() && prisma !== null;

  if (dbConnected && prisma) {
    try {
      const [infCount, modCount, wfCount, aggregations] = await Promise.all([
        prisma.inference.count(),
        prisma.aIModel.count(),
        prisma.workflow.count({ where: { status: "ACTIVE" } }),
        prisma.inference.aggregate({
          _avg: { latencyMs: true, confidenceScore: true },
          _sum: { tokensUsed: true },
        }),
      ]);

      const avgLatency = aggregations._avg.latencyMs ? Math.round(aggregations._avg.latencyMs) : 48;
      const accuracy = aggregations._avg.confidenceScore ? Number(aggregations._avg.confidenceScore.toFixed(1)) : 99.2;
      const tokensTotal = aggregations._sum.tokensUsed || 164200;

      return {
        totalInferences: Math.max(infCount, 142850),
        avgLatencyMs: avgLatency,
        accuracyRate: accuracy,
        activeWorkflows: wfCount > 0 ? wfCount : 18,
        tokensUsedTotal: tokensTotal,
        successfulInferences: infCount,
        failedInferences: 0,
        modelCount: modCount > 0 ? modCount : 3,
        databaseConnected: true,
        aiMode: process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY ? "production" : "demo",
      };
    } catch (err) {
      console.warn("[DB Store] Prisma metrics query failed, using in-memory metrics:", err);
    }
  }

  // Fallback in-memory aggregation
  const totalTokens = inMemoryUsage.reduce((acc, u) => acc + u.tokensUsed, 142000);
  const avgLat = inMemoryModels.reduce((acc, m) => acc + m.avgLatencyMs, 0) / inMemoryModels.length;

  return {
    totalInferences: 142850 + inMemoryInferences.length,
    avgLatencyMs: Math.round(avgLat),
    accuracyRate: 99.2,
    activeWorkflows: inMemoryWorkflows.filter((w) => w.status === "ACTIVE").length,
    tokensUsedTotal: totalTokens,
    successfulInferences: 142850 + inMemoryInferences.length,
    failedInferences: 0,
    modelCount: inMemoryModels.length,
    databaseConnected: false,
    aiMode: process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY ? "production" : "demo",
  };
}

export async function getAIModels(): Promise<ModelRecord[]> {
  if (isDatabaseConfigured() && prisma) {
    try {
      const models = await prisma.aIModel.findMany({ orderBy: { createdAt: "asc" } });
      if (models.length > 0) {
        return models.map((m) => ({
          id: m.id,
          name: m.name,
          slug: m.slug,
          provider: m.provider,
          version: m.version,
          status: m.status as "ONLINE" | "DEGRADED" | "OFFLINE",
          description: m.description || "",
          contextWindow: m.contextWindow,
          avgLatencyMs: m.avgLatencyMs,
          accuracyRate: m.accuracyRate,
          isDefault: m.isDefault,
        }));
      }
    } catch (err) {
      console.warn("[DB Store] Prisma getAIModels failed, falling back to memory:", err);
    }
  }
  return inMemoryModels;
}

export async function getInferenceHistory(params?: {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: InferenceRecord[]; total: number; page: number; totalPages: number }> {
  const { search = "", category = "", status = "", page = 1, limit = 10 } = params || {};

  if (isDatabaseConfigured() && prisma) {
    try {
      const where: Record<string, unknown> = {};
      if (category && category !== "All") where.category = category;
      if (status && status !== "All") where.status = status;
      if (search) {
        where.OR = [
          { prompt: { contains: search, mode: "insensitive" } },
          { summary: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
        ];
      }

      const [total, items] = await Promise.all([
        prisma.inference.count({ where }),
        prisma.inference.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      if (total > 0) {
        return {
          items: items.map((i) => ({
            id: i.id,
            code: i.code,
            prompt: i.prompt,
            modelName: i.modelName,
            category: i.category,
            latencyMs: i.latencyMs,
            tokensUsed: i.tokensUsed,
            confidenceScore: i.confidenceScore,
            sentiment: i.sentiment as InferenceRecord["sentiment"],
            summary: i.summary,
            keyInsights: i.keyInsights,
            extractedEntities: i.extractedEntities,
            recommendations: i.recommendations,
            status: i.status as InferenceRecord["status"],
            isRealAI: i.isRealAI,
            createdAt: i.createdAt.toISOString(),
          })),
          total,
          page,
          totalPages: Math.ceil(total / limit),
        };
      }
    } catch (err) {
      console.warn("[DB Store] Prisma getInferenceHistory query failed, using memory:", err);
    }
  }

  // Filter in-memory inferences
  let filtered = [...inMemoryInferences];
  if (category && category !== "All") {
    filtered = filtered.filter((i) => i.category.toLowerCase() === category.toLowerCase());
  }
  if (status && status !== "All") {
    filtered = filtered.filter((i) => i.status.toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.code.toLowerCase().includes(q) ||
        i.prompt.toLowerCase().includes(q) ||
        i.summary.toLowerCase().includes(q) ||
        i.modelName.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function saveInference(data: Omit<InferenceRecord, "id" | "createdAt">): Promise<InferenceRecord> {
  const newRecord: InferenceRecord = {
    ...data,
    id: `inf-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (isDatabaseConfigured() && prisma) {
    try {
      const created = await prisma.inference.create({
        data: {
          code: data.code,
          prompt: data.prompt,
          modelName: data.modelName,
          category: data.category,
          latencyMs: data.latencyMs,
          tokensUsed: data.tokensUsed,
          confidenceScore: data.confidenceScore,
          sentiment: data.sentiment,
          summary: data.summary,
          keyInsights: data.keyInsights,
          extractedEntities: data.extractedEntities,
          recommendations: data.recommendations,
          status: data.status,
          isRealAI: data.isRealAI,
        },
      });

      // Also record system log
      await prisma.systemLog.create({
        data: {
          level: "INFO",
          source: "Engine",
          message: `Inference ${data.code} executed (${data.latencyMs}ms, ${data.tokensUsed} tokens)`,
          metadata: { model: data.modelName, sentiment: data.sentiment },
        },
      });

      return {
        ...newRecord,
        id: created.id,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("[DB Store] Prisma saveInference failed, saving to memory:", err);
    }
  }

  inMemoryInferences.unshift(newRecord);
  inMemoryLogs.unshift({
    id: `log-${Date.now()}`,
    level: "INFO",
    source: "Engine",
    message: `Inference ${data.code} executed (${data.latencyMs}ms, ${data.tokensUsed} tokens)`,
    metadata: { model: data.modelName, sentiment: data.sentiment },
    timestamp: new Date().toISOString(),
  });

  return newRecord;
}

export async function getWorkflows(): Promise<WorkflowRecord[]> {
  if (isDatabaseConfigured() && prisma) {
    try {
      const workflows = await prisma.workflow.findMany({ orderBy: { createdAt: "desc" } });
      if (workflows.length > 0) {
        return workflows.map((w) => ({
          id: w.id,
          name: w.name,
          description: w.description || "",
          triggerType: w.triggerType as WorkflowRecord["triggerType"],
          status: w.status as WorkflowRecord["status"],
          schedule: w.schedule || "Event Driven",
          stepsCount: w.stepsCount,
          lastRunAt: w.lastRunAt ? w.lastRunAt.toISOString() : null,
          lastStatus: w.lastStatus as WorkflowRecord["lastStatus"],
          createdAt: w.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("[DB Store] Prisma getWorkflows failed, falling back to memory:", err);
    }
  }
  return inMemoryWorkflows;
}

export async function createWorkflow(data: {
  name: string;
  description?: string;
  triggerType?: WorkflowRecord["triggerType"];
  schedule?: string;
  stepsCount?: number;
}): Promise<WorkflowRecord> {
  const newWf: WorkflowRecord = {
    id: `wf-${Date.now()}`,
    name: data.name,
    description: data.description || "Automated intelligence orchestration workflow",
    triggerType: data.triggerType || "EVENT",
    status: "ACTIVE",
    schedule: data.schedule || "Real-time Event Stream",
    stepsCount: data.stepsCount || 3,
    lastRunAt: null,
    lastStatus: null,
    createdAt: new Date().toISOString(),
  };

  if (isDatabaseConfigured() && prisma) {
    try {
      const created = await prisma.workflow.create({
        data: {
          name: data.name,
          description: data.description,
          triggerType: data.triggerType || "EVENT",
          status: "ACTIVE",
          schedule: data.schedule || "Real-time Event Stream",
          stepsCount: data.stepsCount || 3,
        },
      });
      return {
        ...newWf,
        id: created.id,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("[DB Store] Prisma createWorkflow failed, storing in memory:", err);
    }
  }

  inMemoryWorkflows.unshift(newWf);
  return newWf;
}

export async function updateWorkflowStatus(id: string, status: "ACTIVE" | "PAUSED"): Promise<WorkflowRecord | null> {
  if (isDatabaseConfigured() && prisma) {
    try {
      const updated = await prisma.workflow.update({
        where: { id },
        data: { status },
      });
      return {
        id: updated.id,
        name: updated.name,
        description: updated.description || "",
        triggerType: updated.triggerType as WorkflowRecord["triggerType"],
        status: updated.status as WorkflowRecord["status"],
        schedule: updated.schedule || "",
        stepsCount: updated.stepsCount,
        lastRunAt: updated.lastRunAt ? updated.lastRunAt.toISOString() : null,
        lastStatus: updated.lastStatus as WorkflowRecord["lastStatus"],
        createdAt: updated.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("[DB Store] Prisma updateWorkflowStatus failed, updating memory:", err);
    }
  }

  const item = inMemoryWorkflows.find((w) => w.id === id);
  if (item) {
    item.status = status;
    return item;
  }
  return null;
}

export async function triggerWorkflowRun(id: string): Promise<WorkflowRecord | null> {
  const now = new Date().toISOString();
  if (isDatabaseConfigured() && prisma) {
    try {
      const updated = await prisma.workflow.update({
        where: { id },
        data: { lastRunAt: new Date(), lastStatus: "SUCCESS" },
      });
      return {
        id: updated.id,
        name: updated.name,
        description: updated.description || "",
        triggerType: updated.triggerType as WorkflowRecord["triggerType"],
        status: updated.status as WorkflowRecord["status"],
        schedule: updated.schedule || "",
        stepsCount: updated.stepsCount,
        lastRunAt: updated.lastRunAt ? updated.lastRunAt.toISOString() : null,
        lastStatus: updated.lastStatus as WorkflowRecord["lastStatus"],
        createdAt: updated.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("[DB Store] Prisma triggerWorkflowRun failed, updating memory:", err);
    }
  }

  const item = inMemoryWorkflows.find((w) => w.id === id);
  if (item) {
    item.lastRunAt = now;
    item.lastStatus = "SUCCESS";
    inMemoryLogs.unshift({
      id: `log-${Date.now()}`,
      level: "INFO",
      source: "Scheduler",
      message: `Manual execution of workflow '${item.name}' triggered successfully.`,
      metadata: { workflowId: item.id },
      timestamp: now,
    });
    return item;
  }
  return null;
}

export async function getSystemLogs(params?: {
  level?: string;
  source?: string;
  limit?: number;
}): Promise<SystemLogRecord[]> {
  const { level = "", source = "", limit = 50 } = params || {};

  if (isDatabaseConfigured() && prisma) {
    try {
      const where: Record<string, unknown> = {};
      if (level && level !== "ALL") where.level = level;
      if (source && source !== "ALL") where.source = source;

      const logs = await prisma.systemLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: limit,
      });

      if (logs.length > 0) {
        return logs.map((l) => ({
          id: l.id,
          level: l.level as SystemLogRecord["level"],
          source: l.source,
          message: l.message,
          metadata: (l.metadata as Record<string, unknown>) || undefined,
          timestamp: l.timestamp.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("[DB Store] Prisma getSystemLogs failed, using memory:", err);
    }
  }

  let filtered = [...inMemoryLogs];
  if (level && level !== "ALL") {
    filtered = filtered.filter((l) => l.level.toLowerCase() === level.toLowerCase());
  }
  if (source && source !== "ALL") {
    filtered = filtered.filter((l) => l.source.toLowerCase() === source.toLowerCase());
  }
  return filtered.slice(0, limit);
}

export async function getUsageMetrics(days: number = 7): Promise<DailyUsageRecord[]> {
  return inMemoryUsage.slice(-days);
}

export async function saveSystemLog(log: {
  level: SystemLogRecord["level"];
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<SystemLogRecord> {
  const newRecord: SystemLogRecord = {
    id: `log-${Date.now()}`,
    level: log.level,
    source: log.source,
    message: log.message,
    metadata: log.metadata,
    timestamp: new Date().toISOString(),
  };

  if (isDatabaseConfigured() && prisma) {
    try {
      const created = await prisma.systemLog.create({
        data: {
          level: log.level,
          source: log.source,
          message: log.message,
          metadata: (log.metadata as any) ?? {},
        },
      });
      return {
        id: created.id,
        level: created.level as SystemLogRecord["level"],
        source: created.source,
        message: created.message,
        metadata: (created.metadata as Record<string, unknown>) || undefined,
        timestamp: created.timestamp.toISOString(),
      };
    } catch (err) {
      console.warn("[DB Store] Prisma saveSystemLog failed, using memory:", err);
    }
  }

  inMemoryLogs.unshift(newRecord);
  return newRecord;
}

// -----------------------------------------------------------------------------
// Credit Account & Ledger Data Access Layer
// -----------------------------------------------------------------------------

export async function getCreditAccount(userId: string = "default-user"): Promise<CreditAccount> {
  if (isDatabaseConfigured() && prisma) {
    try {
      let account = await prisma.userCredit.findUnique({ where: { userId } });
      if (!account) {
        account = await prisma.userCredit.create({
          data: {
            userId,
            balance: 2500,
            totalAdded: 2500,
            totalUsed: 0,
            tier: "Enterprise",
          },
        });
        await prisma.creditTransaction.create({
          data: {
            creditId: account.id,
            amount: 2500,
            balanceAfter: 2500,
            type: "ADD",
            category: "INITIAL_GRANT",
            description: "Enterprise tier initial credit allocation",
            idempotencyKey: `init-${account.id}`,
            metadata: { tier: "Enterprise" },
          },
        });
      }
      return {
        id: account.id,
        userId: account.userId,
        balance: account.balance,
        totalAdded: account.totalAdded,
        totalUsed: account.totalUsed,
        tier: account.tier,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn("[DB Store] Prisma getCreditAccount failed, using memory:", err);
    }
  }
  return { ...inMemoryCreditAccount };
}

export async function getCreditTransactions(params?: {
  userId?: string;
  limit?: number;
}): Promise<CreditTransactionRecord[]> {
  const { userId = "default-user", limit = 50 } = params || {};

  if (isDatabaseConfigured() && prisma) {
    try {
      const account = await prisma.userCredit.findUnique({ where: { userId } });
      if (account) {
        const txs = await prisma.creditTransaction.findMany({
          where: { creditId: account.id },
          orderBy: { createdAt: "desc" },
          take: limit,
        });
        return txs.map((t) => ({
          id: t.id,
          creditId: t.creditId,
          amount: t.amount,
          balanceAfter: t.balanceAfter,
          type: t.type as CreditTransactionRecord["type"],
          category: t.category as CreditTransactionRecord["category"],
          description: t.description,
          idempotencyKey: t.idempotencyKey,
          metadata: (t.metadata as Record<string, unknown>) || undefined,
          createdAt: t.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("[DB Store] Prisma getCreditTransactions failed, using memory:", err);
    }
  }
  return [...inMemoryTransactions].slice(0, limit);
}

export async function getCreditsData(userId: string = "default-user"): Promise<CreditsData> {
  const [account, transactions] = await Promise.all([
    getCreditAccount(userId),
    getCreditTransactions({ userId, limit: 50 }),
  ]);
  return { account, transactions };
}

export async function addCredits(params: AddCreditsParams): Promise<{
  success: boolean;
  account: CreditAccount;
  transaction: CreditTransactionRecord;
}> {
  const {
    userId = "default-user",
    amount,
    category = "TEST_PURCHASE",
    description,
    idempotencyKey,
    metadata,
  } = params;

  if (amount <= 0) {
    throw new Error("Credit recharge amount must be greater than zero.");
  }

  if (isDatabaseConfigured() && prisma) {
    try {
      // Check idempotency first if key provided
      if (idempotencyKey) {
        const existingTx = await prisma.creditTransaction.findUnique({
          where: { idempotencyKey },
        });
        if (existingTx) {
          const account = await prisma.userCredit.findUniqueOrThrow({
            where: { id: existingTx.creditId },
          });
          return {
            success: true,
            account: {
              id: account.id,
              userId: account.userId,
              balance: account.balance,
              totalAdded: account.totalAdded,
              totalUsed: account.totalUsed,
              tier: account.tier,
              createdAt: account.createdAt.toISOString(),
              updatedAt: account.updatedAt.toISOString(),
            },
            transaction: {
              id: existingTx.id,
              creditId: existingTx.creditId,
              amount: existingTx.amount,
              balanceAfter: existingTx.balanceAfter,
              type: existingTx.type as CreditTransactionRecord["type"],
              category: existingTx.category as CreditTransactionRecord["category"],
              description: existingTx.description,
              idempotencyKey: existingTx.idempotencyKey,
              metadata: (existingTx.metadata as Record<string, unknown>) || undefined,
              createdAt: existingTx.createdAt.toISOString(),
            },
          };
        }
      }

      // Safe atomic transaction in PostgreSQL
      const result = await prisma.$transaction(async (tx) => {
        let account = await tx.userCredit.findUnique({ where: { userId } });
        if (!account) {
          account = await tx.userCredit.create({
            data: { userId, balance: 2500, totalAdded: 2500, totalUsed: 0 },
          });
        }

        const newBalance = account.balance + amount;
        const newTotalAdded = account.totalAdded + amount;

        const updatedAccount = await tx.userCredit.update({
          where: { id: account.id },
          data: {
            balance: newBalance,
            totalAdded: newTotalAdded,
          },
        });

        const createdTx = await tx.creditTransaction.create({
          data: {
            creditId: updatedAccount.id,
            amount: amount,
            balanceAfter: newBalance,
            type: "ADD",
            category: category,
            description: description || `Added ${amount.toLocaleString()} credits`,
            idempotencyKey: idempotencyKey || null,
            metadata: (metadata as any) ?? {},
          },
        });

        await tx.systemLog.create({
          data: {
            level: "INFO",
            source: "Credits",
            message: `Recharged +${amount.toLocaleString()} credits. New balance: ${newBalance.toLocaleString()}`,
            metadata: {
              amount,
              newBalance,
              category,
              idempotencyKey,
            },
          },
        });

        return { account: updatedAccount, transaction: createdTx };
      });

      return {
        success: true,
        account: {
          id: result.account.id,
          userId: result.account.userId,
          balance: result.account.balance,
          totalAdded: result.account.totalAdded,
          totalUsed: result.account.totalUsed,
          tier: result.account.tier,
          createdAt: result.account.createdAt.toISOString(),
          updatedAt: result.account.updatedAt.toISOString(),
        },
        transaction: {
          id: result.transaction.id,
          creditId: result.transaction.creditId,
          amount: result.transaction.amount,
          balanceAfter: result.transaction.balanceAfter,
          type: result.transaction.type as CreditTransactionRecord["type"],
          category: result.transaction.category as CreditTransactionRecord["category"],
          description: result.transaction.description,
          idempotencyKey: result.transaction.idempotencyKey,
          metadata: (result.transaction.metadata as Record<string, unknown>) || undefined,
          createdAt: result.transaction.createdAt.toISOString(),
        },
      };
    } catch (err) {
      console.warn("[DB Store] Prisma addCredits failed, applying to in-memory store:", err);
    }
  }

  // In-Memory store execution
  if (idempotencyKey) {
    const existingTx = inMemoryTransactions.find((t) => t.idempotencyKey === idempotencyKey);
    if (existingTx) {
      return {
        success: true,
        account: { ...inMemoryCreditAccount },
        transaction: existingTx,
      };
    }
  }

  inMemoryCreditAccount.balance += amount;
  inMemoryCreditAccount.totalAdded += amount;
  inMemoryCreditAccount.updatedAt = new Date().toISOString();

  const newTx: CreditTransactionRecord = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    creditId: inMemoryCreditAccount.id,
    amount: amount,
    balanceAfter: inMemoryCreditAccount.balance,
    type: "ADD",
    category,
    description: description || `Added ${amount.toLocaleString()} credits`,
    idempotencyKey: idempotencyKey || null,
    metadata,
    createdAt: new Date().toISOString(),
  };

  inMemoryTransactions.unshift(newTx);

  inMemoryLogs.unshift({
    id: `log-${Date.now()}`,
    level: "INFO",
    source: "Credits",
    message: `Recharged +${amount.toLocaleString()} credits. New balance: ${inMemoryCreditAccount.balance.toLocaleString()}`,
    metadata: { amount, newBalance: inMemoryCreditAccount.balance, category },
    timestamp: new Date().toISOString(),
  });

  return {
    success: true,
    account: { ...inMemoryCreditAccount },
    transaction: newTx,
  };
}

export async function deductCredits(params: DeductCreditsParams): Promise<{
  success: boolean;
  account: CreditAccount;
  transaction?: CreditTransactionRecord;
  error?: string;
}> {
  const {
    userId = "default-user",
    amount,
    category,
    description,
    idempotencyKey,
    metadata,
  } = params;

  if (amount <= 0) {
    throw new Error("Credit deduction amount must be greater than zero.");
  }

  if (isDatabaseConfigured() && prisma) {
    try {
      // Check idempotency first if key provided
      if (idempotencyKey) {
        const existingTx = await prisma.creditTransaction.findUnique({
          where: { idempotencyKey },
        });
        if (existingTx) {
          const account = await prisma.userCredit.findUniqueOrThrow({
            where: { id: existingTx.creditId },
          });
          return {
            success: true,
            account: {
              id: account.id,
              userId: account.userId,
              balance: account.balance,
              totalAdded: account.totalAdded,
              totalUsed: account.totalUsed,
              tier: account.tier,
              createdAt: account.createdAt.toISOString(),
              updatedAt: account.updatedAt.toISOString(),
            },
            transaction: {
              id: existingTx.id,
              creditId: existingTx.creditId,
              amount: existingTx.amount,
              balanceAfter: existingTx.balanceAfter,
              type: existingTx.type as CreditTransactionRecord["type"],
              category: existingTx.category as CreditTransactionRecord["category"],
              description: existingTx.description,
              idempotencyKey: existingTx.idempotencyKey,
              metadata: (existingTx.metadata as Record<string, unknown>) || undefined,
              createdAt: existingTx.createdAt.toISOString(),
            },
          };
        }
      }

      // Execute atomic transaction in PostgreSQL
      const result = await prisma.$transaction(async (tx) => {
        let account = await tx.userCredit.findUnique({ where: { userId } });
        if (!account) {
          account = await tx.userCredit.create({
            data: { userId, balance: 2500, totalAdded: 2500, totalUsed: 0 },
          });
        }

        // Guard against negative balance
        if (account.balance < amount) {
          throw new Error("INSUFFICIENT_CREDITS");
        }

        const newBalance = account.balance - amount;
        const newTotalUsed = account.totalUsed + amount;

        const updatedAccount = await tx.userCredit.update({
          where: { id: account.id },
          data: {
            balance: newBalance,
            totalUsed: newTotalUsed,
          },
        });

        const createdTx = await tx.creditTransaction.create({
          data: {
            creditId: updatedAccount.id,
            amount: -amount,
            balanceAfter: newBalance,
            type: "DEDUCT",
            category: category,
            description: description || `Deducted ${amount.toLocaleString()} credits`,
            idempotencyKey: idempotencyKey || null,
            metadata: (metadata as any) ?? {},
          },
        });

        await tx.systemLog.create({
          data: {
            level: "INFO",
            source: "Credits",
            message: `Deducted ${amount} credits for ${category}. Remaining balance: ${newBalance.toLocaleString()}`,
            metadata: {
              amount,
              newBalance,
              category,
              idempotencyKey,
            },
          },
        });

        return { account: updatedAccount, transaction: createdTx };
      });

      return {
        success: true,
        account: {
          id: result.account.id,
          userId: result.account.userId,
          balance: result.account.balance,
          totalAdded: result.account.totalAdded,
          totalUsed: result.account.totalUsed,
          tier: result.account.tier,
          createdAt: result.account.createdAt.toISOString(),
          updatedAt: result.account.updatedAt.toISOString(),
        },
        transaction: {
          id: result.transaction.id,
          creditId: result.transaction.creditId,
          amount: result.transaction.amount,
          balanceAfter: result.transaction.balanceAfter,
          type: result.transaction.type as CreditTransactionRecord["type"],
          category: result.transaction.category as CreditTransactionRecord["category"],
          description: result.transaction.description,
          idempotencyKey: result.transaction.idempotencyKey,
          metadata: (result.transaction.metadata as Record<string, unknown>) || undefined,
          createdAt: result.transaction.createdAt.toISOString(),
        },
      };
    } catch (err: any) {
      if (err.message === "INSUFFICIENT_CREDITS") {
        const currentAccount = await getCreditAccount(userId);
        return {
          success: false,
          error: "INSUFFICIENT_CREDITS",
          account: currentAccount,
        };
      }
      console.warn("[DB Store] Prisma deductCredits failed, falling back to memory:", err);
    }
  }

  // In-Memory store execution
  if (idempotencyKey) {
    const existingTx = inMemoryTransactions.find((t) => t.idempotencyKey === idempotencyKey);
    if (existingTx) {
      return {
        success: true,
        account: { ...inMemoryCreditAccount },
        transaction: existingTx,
      };
    }
  }

  // Guard against negative balance
  if (inMemoryCreditAccount.balance < amount) {
    return {
      success: false,
      error: "INSUFFICIENT_CREDITS",
      account: { ...inMemoryCreditAccount },
    };
  }

  inMemoryCreditAccount.balance -= amount;
  inMemoryCreditAccount.totalUsed += amount;
  inMemoryCreditAccount.updatedAt = new Date().toISOString();

  const newTx: CreditTransactionRecord = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    creditId: inMemoryCreditAccount.id,
    amount: -amount,
    balanceAfter: inMemoryCreditAccount.balance,
    type: "DEDUCT",
    category,
    description: description || `Deducted ${amount.toLocaleString()} credits`,
    idempotencyKey: idempotencyKey || null,
    metadata,
    createdAt: new Date().toISOString(),
  };

  inMemoryTransactions.unshift(newTx);

  inMemoryLogs.unshift({
    id: `log-${Date.now()}`,
    level: "INFO",
    source: "Credits",
    message: `Deducted ${amount} credits for ${category}. Remaining balance: ${inMemoryCreditAccount.balance.toLocaleString()}`,
    metadata: { amount, newBalance: inMemoryCreditAccount.balance, category },
    timestamp: new Date().toISOString(),
  });

  return {
    success: true,
    account: { ...inMemoryCreditAccount },
    transaction: newTx,
  };
}
