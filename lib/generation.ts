import { designSystemSpec } from "@/lib/design-system/spec";
import type {
  EmptyStateGeneration,
  FrameRepresentation
} from "@/lib/types";

export async function generateEmptyState(
  representation: FrameRepresentation
): Promise<EmptyStateGeneration> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return mockEmptyState(representation);
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
      max_tokens: 900,
      system:
        "You generate only valid JSON for design expansion proposals. Do not include markdown.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            task: "Generate one empty-state proposal for this Figma frame.",
            outputSchema: {
              expansionType: "empty_state",
              title: "string",
              body: "string",
              primaryAction: "string optional",
              secondaryAction: "string optional",
              componentPlan: ["string"],
              rationale: "string",
              confidence: "number between 0 and 1"
            },
            designSystemSpec,
            representation
          })
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic generation failed: ${response.status}`);
  }

  const payload = await response.json();
  const text = payload.content?.[0]?.text;
  if (!text) throw new Error("Anthropic returned an empty response.");

  return JSON.parse(text) as EmptyStateGeneration;
}

function mockEmptyState(
  representation: FrameRepresentation
): EmptyStateGeneration {
  const isCustomerTable = representation.visibleText
    .join(" ")
    .toLowerCase()
    .includes("customers");

  return {
    expansionType: "empty_state",
    title: isCustomerTable ? "No customers yet" : "Nothing to show yet",
    body: isCustomerTable
      ? "Invite your first customer or adjust the filters to find existing records."
      : "Create the first item or change the current filters to see results here.",
    primaryAction: isCustomerTable ? "Invite customer" : "Create item",
    secondaryAction: "Clear filters",
    componentPlan: ["PageShell", "DataTable", "EmptyState", "Button", "SecondaryButton"],
    rationale:
      "The source frame is a filterable data table with a primary creation action, so the empty state keeps the table context and offers create plus filter recovery paths.",
    confidence: 0.82
  };
}
