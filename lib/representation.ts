import type { FigmaFrame, FigmaNode, FrameRepresentation } from "@/lib/types";

export function toFrameRepresentation(frame: FigmaFrame): FrameRepresentation {
  const rootBounds = frame.node.absoluteBoundingBox ?? {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };
  const hierarchy: FrameRepresentation["hierarchy"] = [];
  const visibleText: string[] = [];
  const fontSizes = new Set<number>();
  const colors = new Set<string>();

  walk(frame.node, 0, (node, depth) => {
    if (node.visible === false) return;

    const item: FrameRepresentation["hierarchy"][number] = {
      id: node.id,
      name: node.name,
      type: node.type,
      depth
    };

    if (node.characters) {
      item.text = node.characters;
      visibleText.push(node.characters);
    }

    if (node.absoluteBoundingBox) {
      item.bounds = node.absoluteBoundingBox;
    }

    if (node.style?.fontSize) {
      fontSizes.add(node.style.fontSize);
    }

    for (const fill of node.fills ?? []) {
      if (fill.visible === false || !fill.color) continue;
      colors.add(toHex(fill.color));
    }

    hierarchy.push(item);
  });

  return {
    frame: {
      id: frame.node.id,
      name: frame.node.name,
      width: rootBounds.width,
      height: rootBounds.height
    },
    hierarchy,
    detectedPatterns: detectPatterns(hierarchy),
    visibleText,
    tokenUsage: {
      colors: [...colors],
      fontSizes: [...fontSizes].sort((a, b) => a - b)
    }
  };
}

function walk(
  node: FigmaNode,
  depth: number,
  visitor: (node: FigmaNode, depth: number) => void
) {
  visitor(node, depth);
  for (const child of node.children ?? []) {
    walk(child, depth + 1, visitor);
  }
}

function detectPatterns(hierarchy: FrameRepresentation["hierarchy"]): string[] {
  const names = hierarchy.map((item) => item.name.toLowerCase());
  const patterns = new Set<string>();

  if (names.some((name) => name.includes("table"))) patterns.add("data_table");
  if (names.some((name) => name.includes("filter"))) patterns.add("filterable_list");
  if (names.some((name) => name.includes("button"))) patterns.add("primary_action");
  if (hierarchy.some((item) => item.type === "TEXT")) patterns.add("text_content");

  return [...patterns];
}

function toHex(color: { r: number; g: number; b: number }) {
  const channel = (value: number) =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();

  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
}
