import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Wiseware AI database in Supabase...");

  // 1. Seed AI Models
  const models = [
    {
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

  for (const m of models) {
    await prisma.aIModel.upsert({
      where: { slug: m.slug },
      update: m,
      create: m,
    });
  }

  // 2. Seed Automated Workflows
  const workflows = [
    {
      name: "Automated Latency Spike Remediation",
      description: "Detects API endpoints exceeding 200ms latency and triggers auto-scaling & cache warm-up.",
      triggerType: "EVENT",
      status: "ACTIVE",
      schedule: "Real-time Event Stream",
      stepsCount: 4,
    },
    {
      name: "Nightly Model Weight Verification",
      description: "Benchmarks baseline accuracy across 5,000 standard test vectors and logs parity delta.",
      triggerType: "SCHEDULE",
      status: "ACTIVE",
      schedule: "Daily at 02:00 UTC",
      stepsCount: 6,
    },
    {
      name: "Zero-Trust Token Rotation Pipeline",
      description: "Rotates ephemeral inference gateway encryption keys and revokes stale credentials.",
      triggerType: "SCHEDULE",
      status: "ACTIVE",
      schedule: "Every 12 hours",
      stepsCount: 3,
    },
    {
      name: "Customer Sentiment Alert Dispatcher",
      description: "Flags severe critical inferences and routes an incident payload to security webhooks.",
      triggerType: "EVENT",
      status: "PAUSED",
      schedule: "On Severity = Critical",
      stepsCount: 5,
    },
  ];

  for (const w of workflows) {
    const existing = await prisma.workflow.findFirst({ where: { name: w.name } });
    if (!existing) {
      await prisma.workflow.create({ data: w });
    }
  }

  // 3. Seed Initial System Logs
  await prisma.systemLog.create({
    data: {
      level: "INFO",
      source: "Engine",
      message: "Wiseware AI database initialized and verified on Supabase PostgreSQL.",
      metadata: { initializedAt: new Date().toISOString() },
    },
  });

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
