import { NextRequest, NextResponse } from "next/server";
import { getUsageMetrics } from "@/lib/db-store";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "7", 10);
    const safeDays = isNaN(days) || days < 1 || days > 90 ? 7 : days;

    const data = await getUsageMetrics(safeDays);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load usage metrics";
    console.error("[API usage] Error fetching usage telemetry:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
