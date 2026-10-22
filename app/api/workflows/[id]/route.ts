import { NextResponse } from "next/server";
import { updateWorkflowStatus, triggerWorkflowRun } from "@/lib/db-store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, status } = body;

    if (action === "trigger") {
      const runResult = await triggerWorkflowRun(id);
      if (!runResult) {
        return NextResponse.json(
          { success: false, error: "Workflow not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: runResult });
    }

    if (status && (status === "ACTIVE" || status === "PAUSED")) {
      const updated = await updateWorkflowStatus(id, status);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Workflow not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or status payload" },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update workflow";
    console.error("[API workflows/[id]] Error updating workflow:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
