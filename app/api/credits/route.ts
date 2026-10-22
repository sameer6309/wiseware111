import { NextResponse } from "next/server";
import { getCreditsData, deductCredits } from "@/lib/db-store";
import type { DeductCreditsParams } from "@/lib/types";

/**
 * GET /api/credits
 * Returns the current user credit account balance, quota tier, and transaction ledger.
 */
export async function GET() {
  try {
    const data = await getCreditsData();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[API /api/credits GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch credit account details", details: msg },
      { status: 500 }
    );
  }
}

/**
 * POST /api/credits
 * Performs an atomic credit deduction for system actions (AI inference, enrichment, etc.).
 * Includes strict negative balance prevention (HTTP 402 if insufficient) and idempotency deduplication.
 */
export async function POST(request: Request) {
  try {
    const body: DeductCreditsParams = await request.json();
    const { amount, category, description, idempotencyKey, metadata } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid positive credit deduction amount is required." },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: "A valid deduction category must be specified." },
        { status: 400 }
      );
    }

    const result = await deductCredits({
      amount: Math.round(amount),
      category,
      description: description || `Deduction for ${category}`,
      idempotencyKey,
      metadata,
    });

    if (!result.success) {
      if (result.error === "INSUFFICIENT_CREDITS") {
        return NextResponse.json(
          {
            success: false,
            error: "Insufficient credits available. Please recharge your account.",
            code: "INSUFFICIENT_CREDITS",
            currentBalance: result.account.balance,
            requiredAmount: amount,
          },
          { status: 402 } // Payment / Credit Required
        );
      }
      return NextResponse.json(
        { success: false, error: result.error || "Failed to deduct credits" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        account: result.account,
        transaction: result.transaction,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[API /api/credits POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process credit deduction", details: msg },
      { status: 500 }
    );
  }
}
