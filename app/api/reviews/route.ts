import { NextResponse } from "next/server";
import { listReviews, saveReview } from "@/lib/reviews";
import type { ReviewDecision } from "@/lib/types";

const decisions = new Set<ReviewDecision>(["accept", "edit", "dismiss"]);

export async function GET() {
  return NextResponse.json({ reviews: listReviews() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    runId?: string;
    decision?: ReviewDecision;
    notes?: string;
  };

  if (!body.runId || !body.decision || !decisions.has(body.decision)) {
    return NextResponse.json(
      { error: "runId and a valid decision are required." },
      { status: 400 }
    );
  }

  const saved = saveReview({
    runId: body.runId,
    decision: body.decision,
    notes: body.notes ?? ""
  });

  return NextResponse.json({ review: saved });
}
