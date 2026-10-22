import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/db-store";
import { getActiveAIProviderInfo } from "@/lib/ai-provider";

export async function GET() {
  try {
    const metrics = await getDashboardMetrics();
    const aiProvider = getActiveAIProviderInfo();

    return NextResponse.json({
      success: true,
      data: {
        ...metrics,
        aiProvider,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load dashboard metrics";
    console.error("[API metrics] Error fetching metrics:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
