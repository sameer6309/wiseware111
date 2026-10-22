import { NextRequest, NextResponse } from "next/server";
import { getInferenceHistory } from "@/lib/db-store";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const safePage = isNaN(page) || page < 1 ? 1 : page;
    const safeLimit = isNaN(limit) || limit < 1 || limit > 50 ? 10 : limit;

    const result = await getInferenceHistory({
      search,
      category,
      status,
      page: safePage,
      limit: safeLimit,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load inference history";
    console.error("[API history] Error fetching inference history:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
