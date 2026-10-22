import { NextResponse } from "next/server";
import { getExploriumStatus, executeBusinessEnrichment } from "@/lib/explorium";
import { saveSystemLog, deductCredits } from "@/lib/db-store";
import type { EnrichmentRequest } from "@/lib/types";

/**
 * GET /api/enrich
 * Returns public connection status and capabilities of Explorium AgentSource.
 * Zero credit cost, server-side only check, never exposes the API key.
 */
export async function GET() {
  try {
    const status = getExploriumStatus();
    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: "Failed to read AgentSource configuration status", details: msg },
      { status: 500 }
    );
  }
}

/**
 * POST /api/enrich
 * Executes business data enrichment using Explorium AgentSource v2.
 * 
 * Enforces zero-credit protection:
 * - If authorizeCreditUsage !== true, returns zero-credit preview and schema validation.
 * - If authorizeCreditUsage === true, requires EXPLORIUM_API_KEY and performs live matching and enrichment.
 */
export async function POST(request: Request) {
  try {
    const body: EnrichmentRequest = await request.json();

    const { domain, name, url, linkedinUrl, enrichmentType, authorizeCreditUsage } = body;

    if (!domain && !name && !url && !linkedinUrl) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_INPUT",
          error: "A company domain (e.g. 'stripe.com') or company name is required.",
        },
        { status: 400 }
      );
    }

    // Atomic credit check and deduction if authorized for live enrichment (100 credits)
    if (authorizeCreditUsage === true) {
      const creditCost = 100;
      const deduction = await deductCredits({
        amount: creditCost,
        category: "B2B_ENRICHMENT",
        description: `B2B Entity Enrichment for ${domain || name || "Company"}`,
        metadata: { domain, name, enrichmentType },
      });

      if (!deduction.success) {
        return NextResponse.json(
          {
            success: false,
            code: "INSUFFICIENT_CREDITS",
            error: `Insufficient credits for live B2B enrichment (${creditCost} credits required, current balance: ${deduction.account.balance}). Please recharge credits in test mode.`,
            currentBalance: deduction.account.balance,
            requiredAmount: creditCost,
          },
          { status: 402 }
        );
      }
    }

    const result = await executeBusinessEnrichment({
      domain,
      name,
      url,
      linkedinUrl,
      enrichmentType,
      authorizeCreditUsage,
    });

    // Record audit event in Wiseware System Logs
    if (result.success && result.data) {
      await saveSystemLog({
        level: "INFO",
        source: "AgentSource",
        message: result.creditsUsed
          ? `[Live Enrichment] Enriched company data for ${result.data.matchedName} (${result.data.domain})`
          : `[Zero-Credit Preview] Generated preview data for ${result.data.matchedName} (${result.data.domain})`,
        metadata: {
          domain: result.data.domain,
          matchedName: result.data.matchedName,
          businessId: result.data.businessId,
          creditsUsed: result.creditsUsed,
          provider: result.provider,
        },
      });
    } else if (!result.success) {
      await saveSystemLog({
        level: "WARN",
        source: "AgentSource",
        message: `Business enrichment request failed: ${result.error}`,
        metadata: { domain, name, code: result.code },
      });
    }

    if (!result.success) {
      const statusCode =
        result.code === "MISSING_API_KEY" || result.code === "INVALID_INPUT"
          ? 400
          : result.code === "AUTH_ERROR"
          ? 401
          : result.code === "EXHAUSTED_CREDITS"
          ? 402
          : result.code === "NO_MATCH"
          ? 404
          : result.code === "RATE_LIMITED"
          ? 429
          : result.code === "SERVICE_UNAVAILABLE"
          ? 503
          : result.code === "TIMEOUT"
          ? 504
          : 500;

      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[API enrich] Error processing request:", msg);

    return NextResponse.json(
      {
        success: false,
        code: "SERVER_ERROR",
        error: "Failed to process business enrichment request.",
        details: msg,
      },
      { status: 500 }
    );
  }
}
