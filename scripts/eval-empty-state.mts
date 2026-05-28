import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fetchFigmaFrame } from "../lib/figma.js";
import { generateEmptyState } from "../lib/generation.js";
import { lintGeneration } from "../lib/linter.js";
import { toFrameRepresentation } from "../lib/representation.js";

type EvalCase = {
  id: string;
  source: {
    figmaUrl: string;
    nodeId?: string;
  };
  expected: {
    mustUseComponents?: string[];
    mustMention?: string[];
    mustProvideFilterRecovery?: boolean;
    maxBodyLength?: number;
  };
};

const evalPath = join(process.cwd(), "eval", "eval_set.example.json");
const evalSet = JSON.parse(await readFile(evalPath, "utf8")) as EvalCase[];

let failures = 0;

for (const testCase of evalSet) {
  const frame = await fetchFigmaFrame(testCase.source);
  const representation = toFrameRepresentation(frame);
  const generation = await generateEmptyState(representation);
  const lintResults = lintGeneration(generation, representation);
  const caseFailures = scoreCase(testCase, generation, lintResults);

  if (caseFailures.length > 0) {
    failures += 1;
    console.log(`FAIL ${testCase.id}`);
    for (const failure of caseFailures) {
      console.log(`- ${failure}`);
    }
  } else {
    console.log(`PASS ${testCase.id}`);
  }
}

if (failures > 0) {
  process.exitCode = 1;
}

function scoreCase(
  testCase: EvalCase,
  generation: {
    title: string;
    body: string;
    secondaryAction?: string;
    componentPlan: string[];
  },
  lintResults: Array<{ status: string; label: string; detail: string }>
) {
  const failures: string[] = [];
  const combinedCopy = `${generation.title} ${generation.body}`.toLowerCase();

  for (const component of testCase.expected.mustUseComponents ?? []) {
    if (!generation.componentPlan.includes(component)) {
      failures.push(`Missing required component: ${component}`);
    }
  }

  for (const term of testCase.expected.mustMention ?? []) {
    if (!combinedCopy.includes(term.toLowerCase())) {
      failures.push(`Copy does not mention: ${term}`);
    }
  }

  if (
    testCase.expected.mustProvideFilterRecovery &&
    !generation.secondaryAction?.toLowerCase().includes("filter")
  ) {
    failures.push("Missing filter recovery action.");
  }

  if (
    testCase.expected.maxBodyLength &&
    generation.body.length > testCase.expected.maxBodyLength
  ) {
    failures.push(`Body copy is too long: ${generation.body.length}`);
  }

  for (const result of lintResults) {
    if (result.status === "fail") {
      failures.push(`Linter failed: ${result.label} - ${result.detail}`);
    }
  }

  return failures;
}
