import { NextResponse } from "next/server";
import { getAIModels } from "@/lib/db-store";

export async function GET() {
  try {
    const models = await getAIModels();
    return NextResponse.json({
      success: true,
      data: models,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load model registry";
    console.error("[API models] Error fetching models:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
