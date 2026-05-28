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
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: Array<{ type?: string; color?: Color; visible?: boolean }>;
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
    text?: string;
    bounds?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
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
