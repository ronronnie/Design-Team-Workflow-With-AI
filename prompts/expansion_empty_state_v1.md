Generate one empty-state expansion for the supplied Figma frame representation.

Use this JSON shape:

{
  "expansionType": "empty_state",
  "title": "string",
  "body": "string",
  "primaryAction": "string optional",
  "secondaryAction": "string optional",
  "componentPlan": ["string"],
  "rationale": "string",
  "confidence": 0.0
}

Focus on:
- What the user expected to see in the source frame.
- Whether the empty state is true zero-data, filtered-zero, permission-zero, or error-adjacent.
- The smallest useful next action.
- Maintaining the existing page context.
