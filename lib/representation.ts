import type { FigmaFrame, FigmaNode, FrameRepresentation } from "./types";

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
  const componentInstances = new Set<string>();
  const primaryActionCandidates: string[] = [];

  walk(frame.node, 0, (node, depth) => {
    if (node.visible === false) return;

    const item: FrameRepresentation["hierarchy"][number] = {
      id: node.id,
      name: node.name,
      type: node.type,
      depth
    };

    if (node.componentId) {
      item.componentId = node.componentId;
    }

    if (node.characters) {
      item.text = node.characters;
      visibleText.push(node.characters);
      if (isActionLike(node.name)) {
        primaryActionCandidates.push(node.characters);
      }
    }

    if (node.absoluteBoundingBox) {
      item.bounds = node.absoluteBoundingBox;
    }

    if (node.layoutMode || node.itemSpacing !== undefined || hasPadding(node)) {
      item.layout = {
        mode: node.layoutMode,
        primaryAxisAlignItems: node.primaryAxisAlignItems,
        counterAxisAlignItems: node.counterAxisAlignItems,
        itemSpacing: node.itemSpacing,
        padding: {
          top: node.paddingTop,
          right: node.paddingRight,
          bottom: node.paddingBottom,
          left: node.paddingLeft
        }
      };
    }

    if (node.style) {
      item.typography = {
        fontFamily: node.style.fontFamily,
        fontSize: node.style.fontSize,
        fontWeight: node.style.fontWeight
      };
    }

    if (node.style?.fontSize !== undefined) {
      fontSizes.add(node.style.fontSize);
    }

    const nodeColors = new Set<string>();
    for (const fill of node.fills ?? []) {
      if (fill.visible === false || !fill.color) continue;
      const color = toHex(fill.color);
      colors.add(color);
      nodeColors.add(color);
    }

    for (const stroke of node.strokes ?? []) {
      if (stroke.visible === false || !stroke.color) continue;
      const color = toHex(stroke.color);
      colors.add(color);
      nodeColors.add(color);
    }

    if (nodeColors.size > 0) {
      item.colors = [...nodeColors];
    }

    if (node.type === "INSTANCE") {
      componentInstances.add(node.name);
      if (isActionLike(node.name)) {
        primaryActionCandidates.push(readableActionName(node.name));
      }
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
    summary: {
      nodeCount: hierarchy.length,
      textNodeCount: hierarchy.filter((item) => item.type === "TEXT").length,
      instanceCount: hierarchy.filter((item) => item.type === "INSTANCE").length,
      componentInstances: [...componentInstances],
      likelyPrimaryAction: primaryActionCandidates[0]
    },
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

function hasPadding(node: FigmaNode) {
  return (
    node.paddingTop !== undefined ||
    node.paddingRight !== undefined ||
    node.paddingBottom !== undefined ||
    node.paddingLeft !== undefined
  );
}

function isActionLike(name: string) {
  return /button|cta|action|submit|save|create|add|invite/i.test(name);
}

function readableActionName(name: string) {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b(button|cta|action|primary|secondary)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toHex(color: { r: number; g: number; b: number }) {
  const channel = (value: number) =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();

  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
}
