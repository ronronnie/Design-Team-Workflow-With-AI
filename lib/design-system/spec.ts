import type { DesignSystemSpec } from "@/lib/types";

export const designSystemSpec: DesignSystemSpec = {
  tokens: {
    colors: {
      "text-primary": "#17191D",
      "text-secondary": "#626976",
      "surface": "#FFFFFF",
      "surface-muted": "#F6F7F9",
      "border": "#DFE3E8",
      "action-primary": "#0F766E"
    },
    spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
    typography: {
      families: ["Inter", "SF Pro", "Arial"],
      sizes: [12, 13, 14, 16, 18, 20, 24, 28, 32],
      weights: [400, 500, 600, 700]
    }
  },
  components: [
    "PageShell",
    "SectionHeader",
    "EmptyState",
    "Button",
    "SecondaryButton",
    "Icon",
    "DataTable",
    "FilterBar"
  ],
  emptyStatePattern: {
    requiredComponents: ["EmptyState"],
    optionalComponents: ["Icon", "Button", "SecondaryButton"],
    maxBodyLength: 140
  }
};
