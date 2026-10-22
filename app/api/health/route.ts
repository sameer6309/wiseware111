import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/prisma";
import { getExploriumStatus } from "@/lib/explorium";
import { getActiveAIProviderInfo } from "@/lib/ai-provider";

const SERVER_START_TIME = Date.now();

export async function GET() {
  try {
    const uptimeSeconds = Math.floor((Date.now() - SERVER_START_TIME) / 1000);
    const dbConnected = isDatabaseConfigured();
    const explorium = getExploriumStatus();
    const aiProvider = getActiveAIProviderInfo();

    return NextResponse.json(
      {
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptimeSeconds,
        services: {
          database: {
            configured: dbConnected,
            type: dbConnected ? "Supabase PostgreSQL" : "In-Memory Development Store",
            status: "operational",
          },
          exploriumAgentSource: {
            configured: explorium.isConfigured,
            apiVersion: explorium.apiVersion,
            creditProtectionActive: explorium.creditProtectionActive,
            status: "operational",
          },
          aiEngine: {
            configured: aiProvider.isRealAIConfigured,
            activeProvider: aiProvider.activeProvider,
            configuredProviders: aiProvider.configuredProviders,
            mode: aiProvider.mode,
            status: "operational",
          },
        },
        environment: process.env.NODE_ENV || "development",
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Health check error";
    return NextResponse.json(
      {
        success: false,
        status: "degraded",
        error: msg,
      },
      { status: 500 }
    );
  }
}
