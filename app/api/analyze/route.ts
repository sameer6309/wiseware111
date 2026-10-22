import { NextResponse } from "next/server";
import { runAIAnalysis } from "@/lib/ai-provider";
import { saveInference, getCreditAccount, deductCredits } from "@/lib/db-store";

export interface AnalysisRequest {
  prompt: string;
  model?: string;
  category?: string;
}

export interface AnalysisResponse {
  id: string;
  timestamp: string;
  model: string;
  category: string;
  latencyMs: number;
  tokensUsed: number;
  confidenceScore: number;
  sentiment: "Positive" | "Neutral" | "Constructive" | "Critical";
  summary: string;
  keyInsights: string[];
  extractedEntities: string[];
  recommendations: string[];
  isRealAI?: boolean;
  provider?: string;
  creditsUsed?: number;
  creditsRemaining?: number;
}

export async function POST(request: Request) {
  try {
    const body: AnalysisRequest = await request.json();
    const { prompt, model = "Wiseware Neural-v4", category = "General Insight" } = body;

    // Strict input validation
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "A valid prompt or input inquiry is required for AI analysis." },
        { status: 400 }
      );
    }

    if (prompt.length > 5000) {
      return NextResponse.json(
        { success: false, error: "Prompt exceeds maximum allowed length of 5000 characters." },
        { status: 400 }
      );
    }

    // 1. Balance pre-flight verification: ensure account has sufficient credits
    const creditCost = 25; // Base compute cost per analysis
    const account = await getCreditAccount();

    if (account.balance < creditCost) {
      return NextResponse.json(
        {
          success: false,
          code: "INSUFFICIENT_CREDITS",
          error: `Insufficient credits to run AI analysis (${creditCost} credits required, current balance: ${account.balance}). Please recharge credits in test mode.`,
          currentBalance: account.balance,
          requiredAmount: creditCost,
        },
        { status: 402 }
      );
    }

    // 2. Execute analysis through provider service (real AI if configured, otherwise transparent Demo Engine)
    const result = await runAIAnalysis({
      prompt: prompt.trim(),
      model,
      category,
    });

    // 3. Deduct the correct credit amount ONLY upon successful analysis completion
    const deduction = await deductCredits({
      amount: creditCost,
      category: "AI_INFERENCE",
      description: `Inference compute with ${model} (${result.id})`,
      idempotencyKey: `inf-deduct-${result.id}`,
      metadata: {
        inferenceId: result.id,
        model: result.model,
        tokensUsed: result.tokensUsed,
      },
    });

    const finalRemaining = deduction.success ? deduction.account.balance : account.balance - creditCost;

    // 4. Persist inference record to database (or in-memory store if DB credentials not yet configured)
    await saveInference({
      code: result.id,
      prompt: prompt.trim(),
      modelName: result.model,
      category: result.category,
      latencyMs: result.latencyMs,
      tokensUsed: result.tokensUsed,
      confidenceScore: result.confidenceScore,
      sentiment: result.sentiment,
      summary: result.summary,
      keyInsights: result.keyInsights,
      extractedEntities: result.extractedEntities,
      recommendations: result.recommendations,
      status: "Completed",
      isRealAI: result.isRealAI,
    });

    // 5. Build strongly-typed AnalysisResponse payload with exact credits telemetry
    const responsePayload: AnalysisResponse = {
      id: result.id,
      timestamp: result.timestamp,
      model: result.model,
      category: result.category,
      latencyMs: result.latencyMs,
      tokensUsed: result.tokensUsed,
      confidenceScore: result.confidenceScore,
      sentiment: result.sentiment,
      summary: result.summary,
      keyInsights: result.keyInsights,
      extractedEntities: result.extractedEntities,
      recommendations: result.recommendations,
      isRealAI: result.isRealAI,
      provider: result.provider,
      creditsUsed: creditCost,
      creditsRemaining: finalRemaining,
    };

    return NextResponse.json({ success: true, data: responsePayload });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[API analyze] Error processing inference:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process AI analysis", details: message },
      { status: 500 }
    );
  }
}
