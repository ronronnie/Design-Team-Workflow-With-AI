import { designSystemSpec } from "@/lib/design-system/spec";
import type {
  EmptyStateGeneration,
  FrameRepresentation,
  LintResult
} from "@/lib/types";

export function lintGeneration(
  generation: EmptyStateGeneration,
  representation: FrameRepresentation
): LintResult[] {
  const allowedComponents = new Set(designSystemSpec.components);
  const allowedFontSizes = new Set(designSystemSpec.tokens.typography.sizes);
  const allowedColors = new Set(
    Object.values(designSystemSpec.tokens.colors).map((color) => color.toUpperCase())
  );

  const unknownComponents = generation.componentPlan.filter(
    (component) => !allowedComponents.has(component)
  );
  const offScaleFontSizes = representation.tokenUsage.fontSizes.filter(
    (fontSize) => !allowedFontSizes.has(fontSize)
  );
  const offTokenColors = representation.tokenUsage.colors.filter(
    (color) => !allowedColors.has(color.toUpperCase())
  );

  return [
    {
      id: "required-empty-state",
      label: "Uses EmptyState component",
      status: generation.componentPlan.includes("EmptyState") ? "pass" : "fail",
      detail: generation.componentPlan.includes("EmptyState")
        ? "The generation uses the required EmptyState component."
        : "Empty-state expansions must include the EmptyState component."
    },
    {
      id: "component-whitelist",
      label: "Only design-system components",
      status: unknownComponents.length === 0 ? "pass" : "fail",
      detail:
        unknownComponents.length === 0
          ? "Every planned component exists in the design-system spec."
          : `Unknown components: ${unknownComponents.join(", ")}`
    },
    {
      id: "body-length",
      label: "Body copy length",
      status:
        generation.body.length <= designSystemSpec.emptyStatePattern.maxBodyLength
          ? "pass"
          : "warn",
      detail: `${generation.body.length}/${designSystemSpec.emptyStatePattern.maxBodyLength} characters.`
    },
    {
      id: "source-font-tokens",
      label: "Source frame font tokens",
      status: offScaleFontSizes.length === 0 ? "pass" : "warn",
      detail:
        offScaleFontSizes.length === 0
          ? "No off-scale font sizes detected in the source frame."
          : `Source uses off-scale font sizes: ${offScaleFontSizes.join(", ")}`
    },
    {
      id: "source-color-tokens",
      label: "Source frame color tokens",
      status: offTokenColors.length === 0 ? "pass" : "warn",
      detail:
        offTokenColors.length === 0
          ? "No off-token colors detected in the source frame."
          : `Source uses off-token colors: ${offTokenColors.join(", ")}`
    }
  ];
}
