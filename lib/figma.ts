import type { FigmaFrame, FigmaInput, FigmaNode } from "@/lib/types";

export async function fetchFigmaFrame(input: FigmaInput): Promise<FigmaFrame> {
  const parsed = parseFigmaInput(input);
  const accessToken = process.env.FIGMA_ACCESS_TOKEN;

  if (!accessToken || parsed.fileKey === "FILE_KEY" || parsed.mode === "mock") {
    return mockFrame(parsed.fileKey, parsed.nodeId);
  }

  const nodeUrl = new URL(
    `https://api.figma.com/v1/files/${parsed.fileKey}/nodes`
  );
  nodeUrl.searchParams.set("ids", parsed.nodeId);

  const nodeResponse = await fetch(nodeUrl, {
    headers: {
      "X-Figma-Token": accessToken
    }
  });

  if (!nodeResponse.ok) {
    throw new Error(`Figma node fetch failed: ${nodeResponse.status}`);
  }

  const nodePayload = await nodeResponse.json();
  const node = nodePayload.nodes?.[parsed.nodeId]?.document as
    | FigmaNode
    | undefined;

  if (!node) {
    throw new Error("Figma did not return a document for that node ID.");
  }

  const imageUrl = await fetchFigmaImageUrl(parsed.fileKey, parsed.nodeId, accessToken);

  return {
    fileKey: parsed.fileKey,
    nodeId: parsed.nodeId,
    name: node.name,
    source: "figma",
    mode: "real",
    imageUrl,
    node
  };
}

function parseFigmaInput(input: FigmaInput): {
  fileKey: string;
  nodeId: string;
  mode: "real" | "mock";
} {
  const explicitNodeId = normalizeNodeId(input.nodeId);

  try {
    const url = new URL(input.figmaUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const fileKey = parts[1] ?? "FILE_KEY";
    const nodeFromUrl = normalizeNodeId(url.searchParams.get("node-id"));

    return {
      fileKey,
      nodeId: explicitNodeId || nodeFromUrl || "123:456",
      mode: fileKey === "FILE_KEY" ? "mock" : "real"
    };
  } catch {
    return {
      fileKey: "FILE_KEY",
      nodeId: explicitNodeId || "123:456",
      mode: "mock"
    };
  }
}

function normalizeNodeId(value?: string | null) {
  return value?.trim().replaceAll("-", ":") ?? "";
}

async function fetchFigmaImageUrl(
  fileKey: string,
  nodeId: string,
  accessToken: string
): Promise<string | undefined> {
  const imageUrl = new URL(`https://api.figma.com/v1/images/${fileKey}`);
  imageUrl.searchParams.set("ids", nodeId);
  imageUrl.searchParams.set("format", "png");

  const imageResponse = await fetch(imageUrl, {
    headers: {
      "X-Figma-Token": accessToken
    }
  });

  if (!imageResponse.ok) return undefined;

  const imagePayload = await imageResponse.json();
  return imagePayload.images?.[nodeId];
}

function mockFrame(fileKey: string, nodeId: string): FigmaFrame {
  return {
    fileKey,
    nodeId,
    name: "Customers table concept",
    source: "mock",
    mode: "mock",
    node: {
      id: nodeId,
      name: "Customers table concept",
      type: "FRAME",
      absoluteBoundingBox: { x: 0, y: 0, width: 1280, height: 800 },
      children: [
        {
          id: "1:1",
          name: "Header",
          type: "FRAME",
          absoluteBoundingBox: { x: 32, y: 28, width: 1216, height: 64 },
          children: [
            {
              id: "1:2",
              name: "Title",
              type: "TEXT",
              characters: "Customers",
              style: { fontFamily: "Inter", fontSize: 28, fontWeight: 700 },
              absoluteBoundingBox: { x: 32, y: 32, width: 180, height: 36 }
            },
            {
              id: "1:3",
              name: "Invite button",
              type: "INSTANCE",
              absoluteBoundingBox: { x: 1112, y: 32, width: 136, height: 40 }
            }
          ]
        },
        {
          id: "2:1",
          name: "Filters",
          type: "INSTANCE",
          absoluteBoundingBox: { x: 32, y: 112, width: 1216, height: 56 }
        },
        {
          id: "3:1",
          name: "Customer data table",
          type: "INSTANCE",
          absoluteBoundingBox: { x: 32, y: 188, width: 1216, height: 548 },
          children: [
            {
              id: "3:2",
              name: "Column label",
              type: "TEXT",
              characters: "Name",
              style: { fontFamily: "Inter", fontSize: 13, fontWeight: 600 },
              absoluteBoundingBox: { x: 56, y: 210, width: 80, height: 20 }
            }
          ]
        }
      ]
    }
  };
}
