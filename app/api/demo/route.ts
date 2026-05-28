import { NextResponse } from "next/server";
import { fetchFigmaFrame } from "@/lib/figma";
import { generateEmptyState } from "@/lib/generation";
import { lintGeneration } from "@/lib/linter";
import { toFrameRepresentation } from "@/lib/representation";
import type { FigmaInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as Partial<FigmaInput>;

    if (!input.figmaUrl) {
      return NextResponse.json(
        { error: "figmaUrl is required." },
        { status: 400 }
      );
    }

    const frame = await fetchFigmaFrame({
      figmaUrl: input.figmaUrl,
      nodeId: input.nodeId
    });
    const representation = toFrameRepresentation(frame);
    const generation = await generateEmptyState(representation);
    const lintResults = lintGeneration(generation, representation);

    return NextResponse.json({
      runId: crypto.randomUUID(),
      frame,
      representation,
      generation,
      lintResults
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
