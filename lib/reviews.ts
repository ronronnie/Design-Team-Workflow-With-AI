import { mkdir, readFile, appendFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ReviewRecord } from "./types";

const reviewLogPath = join(process.cwd(), "data", "local", "reviews.jsonl");

export async function saveReview(record: Omit<ReviewRecord, "createdAt">) {
  const saved = {
    ...record,
    createdAt: new Date().toISOString()
  };
  await mkdir(dirname(reviewLogPath), { recursive: true });
  await appendFile(reviewLogPath, `${JSON.stringify(saved)}\n`, "utf8");
  return saved;
}

export async function listReviews() {
  try {
    const content = await readFile(reviewLogPath, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as ReviewRecord);
  } catch (cause) {
    if (cause instanceof Error && "code" in cause && cause.code === "ENOENT") {
      return [];
    }
    throw cause;
  }
}
