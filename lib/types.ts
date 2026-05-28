export type FigmaInput = {
  figmaUrl: string;
  nodeId?: string;
};

export type FigmaFrame = {
  fileKey: string;
  nodeId: string;
  name: string;
  source: "figma" | "mock";
  mode: "real" | "mock";
  imageUrl?: string;
  node: FigmaNode;
};

export type FigmaNode = {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  componentId?: string;
  componentProperties?: Record<string, unknown>;
  layoutMode?: "HORIZONTAL" | "VERTICAL" | "NONE";
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  itemSpacing?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  cornerRadius?: number;
  opacity?: number;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: Array<{ type?: string; color?: Color; visible?: boolean }>;
  strokes?: Array<{ type?: string; color?: Color; visible?: boolean }>;
  strokeWeight?: number;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
  };
  characters?: string;
  children?: FigmaNode[];
};

export type Color = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

export type DesignSystemSpec = {
  tokens: {
    colors: Record<string, string>;
    spacing: number[];
    typography: {
      families: string[];
      sizes: number[];
      weights: number[];
    };
  };
  components: string[];
  emptyStatePattern: {
    requiredComponents: string[];
    optionalComponents: string[];
    maxBodyLength: number;
  };
};

export type FrameRepresentation = {
  frame: {
    id: string;
    name: string;
    width: number;
    height: number;
  };
  hierarchy: Array<{
    id: string;
    name: string;
    type: string;
    depth: number;
    componentId?: string;
    text?: string;
    bounds?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    layout?: {
      mode?: "HORIZONTAL" | "VERTICAL" | "NONE";
      primaryAxisAlignItems?: string;
      counterAxisAlignItems?: string;
      itemSpacing?: number;
      padding?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      };
    };
    typography?: {
      fontFamily?: string;
      fontSize?: number;
      fontWeight?: number;
    };
    colors?: string[];
  }>;
  summary: {
    nodeCount: number;
    textNodeCount: number;
    instanceCount: number;
    componentInstances: string[];
    likelyPrimaryAction?: string;
  };
  detectedPatterns: string[];
  visibleText: string[];
  tokenUsage: {
    colors: string[];
    fontSizes: number[];
  };
};

export type EmptyStateGeneration = {
  expansionType: "empty_state";
  title: string;
  body: string;
  primaryAction?: string;
  secondaryAction?: string;
  componentPlan: string[];
  rationale: string;
  confidence: number;
};

export type LintStatus = "pass" | "warn" | "fail";

export type LintResult = {
  id: string;
  label: string;
  status: LintStatus;
  detail: string;
};

export type DemoResponse = {
  runId: string;
  frame: FigmaFrame;
  representation: FrameRepresentation;
  generation: EmptyStateGeneration;
  lintResults: LintResult[];
};

export type ReviewDecision = "accept" | "edit" | "dismiss";

export type ReviewRecord = {
  runId: string;
  decision: ReviewDecision;
  notes: string;
  createdAt: string;
};
