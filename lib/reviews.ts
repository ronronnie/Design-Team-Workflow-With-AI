import type { ReviewDecision } from "@/lib/types";

type ReviewRecord = {
  runId: string;
  decision: ReviewDecision;
  notes: string;
  createdAt: string;
};

const reviews: ReviewRecord[] = [];

export function saveReview(record: Omit<ReviewRecord, "createdAt">) {
  const saved = {
    ...record,
    createdAt: new Date().toISOString()
  };
  reviews.push(saved);
  return saved;
}

export function listReviews() {
  return reviews;
}
