import { NextRequest, NextResponse } from "next/server";
import { getSystemLogs } from "@/lib/db-store";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get("level") || "";
    const source = searchParams.get("source") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const safeLimit = isNaN(limit) || limit < 1 || limit > 100 ? 50 : limit;

    const logs = await getSystemLogs({
      level,
      source,
      limit: safeLimit,
    });

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load system logs";
    console.error("[API logs] Error fetching logs:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
