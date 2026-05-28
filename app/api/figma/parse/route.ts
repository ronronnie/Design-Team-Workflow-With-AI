import { NextResponse } from "next/server";
import { parseFigmaInput } from "@/lib/figma";
import type { FigmaInput } from "@/lib/types";

export async function POST(request: Request) {
  const input = (await request.json()) as Partial<FigmaInput>;

  if (!input.figmaUrl) {
    return NextResponse.json(
      { error: "figmaUrl is required." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    parsed: parseFigmaInput({
      figmaUrl: input.figmaUrl,
      nodeId: input.nodeId
    }),
    hasFigmaToken: Boolean(process.env.FIGMA_ACCESS_TOKEN)
  });
}
