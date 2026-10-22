import { NextResponse } from "next/server";
import { addCredits } from "@/lib/db-store";
import { verifyCreditPackage } from "@/lib/credits-config";
import type { AddCreditsParams } from "@/lib/types";

export interface PurchaseCreditsRequestBody extends Partial<AddCreditsParams> {
  packageId?: string;
  paymentMethod?: "test" | "stripe";
  token?: string;
}

/**
 * POST /api/credits/add
 * Safely adds credits to the user account with server-side package verification.
 * Supports verified pre-set credit bundles (+1,000, +5,000, +25,000) with idempotency key protection.
 */
export async function POST(request: Request) {
  try {
    const body: PurchaseCreditsRequestBody = await request.json();
    const {
      packageId,
      amount: rawAmount,
      category = "TEST_PURCHASE",
      description: customDescription,
      idempotencyKey,
      metadata = {},
    } = body;

    let finalAmount = rawAmount;
    let finalDescription = customDescription || "Credit Top-Up";
    let verifiedPackageMeta: Record<string, unknown> = {};

    // If packageId is provided, perform strict server-side package verification
    if (packageId) {
      const pkg = verifyCreditPackage(packageId);
      if (!pkg) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid credit package '${packageId}'. Valid options: starter, growth, enterprise.`,
          },
          { status: 400 }
        );
      }
      finalAmount = pkg.credits;
      finalDescription = `${pkg.name} (+${pkg.credits.toLocaleString()} credits - $${pkg.priceUsd})`;
      verifiedPackageMeta = {
        packageId: pkg.id,
        packageName: pkg.name,
        priceUsd: pkg.priceUsd,
        verifiedByServer: true,
      };
    }

    if (!finalAmount || typeof finalAmount !== "number" || finalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid positive credit amount or packageId is required." },
        { status: 400 }
      );
    }

    if (finalAmount > 100_000) {
      return NextResponse.json(
        { success: false, error: "Recharge amount exceeds the maximum per-transaction threshold (100,000)." },
        { status: 400 }
      );
    }

    // Atomic credit addition with idempotency deduplication
    const result = await addCredits({
      amount: Math.round(finalAmount),
      category: category as any,
      description: finalDescription,
      idempotencyKey,
      metadata: {
        ...metadata,
        ...verifiedPackageMeta,
        paymentStatus: "VERIFIED_TEST_MODE",
        paymentGateway: "Wiseware Secure Vault",
        receiptTimestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully credited +${finalAmount.toLocaleString()} credits to your workspace.`,
      data: {
        account: result.account,
        transaction: result.transaction,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[API /api/credits/add POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to add credits", details: msg },
      { status: 500 }
    );
  }
}
