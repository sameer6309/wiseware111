import { NextResponse } from "next/server";
import { getWorkflows, createWorkflow } from "@/lib/db-store";

export async function GET() {
  try {
    const workflows = await getWorkflows();
    return NextResponse.json({
      success: true,
      data: workflows,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load workflows";
    console.error("[API workflows] Error fetching workflows:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, triggerType, schedule, stepsCount } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Workflow name is required." },
        { status: 400 }
      );
    }

    const created = await createWorkflow({
      name: name.trim(),
      description,
      triggerType,
      schedule,
      stepsCount: typeof stepsCount === "number" ? stepsCount : 3,
    });

    return NextResponse.json({
      success: true,
      data: created,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create workflow";
    console.error("[API workflows] Error creating workflow:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
