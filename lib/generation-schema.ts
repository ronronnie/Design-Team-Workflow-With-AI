import type { EmptyStateGeneration } from "./types";

export function parseEmptyStateGeneration(value: unknown): EmptyStateGeneration {
  if (!isRecord(value)) {
    throw new Error("Generation output must be a JSON object.");
  }

  const expansionType = value.expansionType;
  const title = value.title;
  const body = value.body;
  const componentPlan = value.componentPlan;
  const rationale = value.rationale;
  const confidence = value.confidence;

  if (expansionType !== "empty_state") {
    throw new Error("Generation output must use expansionType empty_state.");
  }
  if (!isNonEmptyString(title)) {
    throw new Error("Generation output is missing a valid title.");
  }
  if (!isNonEmptyString(body)) {
    throw new Error("Generation output is missing a valid body.");
  }
  if (!Array.isArray(componentPlan) || !componentPlan.every(isNonEmptyString)) {
    throw new Error("Generation output must include a componentPlan string array.");
  }
  if (!isNonEmptyString(rationale)) {
    throw new Error("Generation output is missing a valid rationale.");
  }
  if (typeof confidence !== "number" || confidence < 0 || confidence > 1) {
    throw new Error("Generation output confidence must be a number from 0 to 1.");
  }

  return {
    expansionType,
    title,
    body,
    primaryAction: optionalString(value.primaryAction),
    secondaryAction: optionalString(value.secondaryAction),
    componentPlan,
    rationale,
    confidence
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}
