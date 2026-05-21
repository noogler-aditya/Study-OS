import type { MockTest, Topic } from "../types";
import { isDue, todayIso } from "./date";

export function completionPercent(topics: Topic[]): number {
  if (!topics.length) return 0;
  const completed = topics.filter((topic) => ["completed", "revising", "mastered"].includes(topic.status)).length;
  return Math.round((completed / topics.length) * 100);
}

export function revisionHealth(topics: Topic[], referenceIso = todayIso()): number {
  if (!topics.length) return 100;
  const due = topics.filter((topic) => isDue(topic.nextRevisionOn, referenceIso)).length;
  return Math.max(0, Math.round(100 - (due / topics.length) * 100));
}

export function weakTopics(topics: Topic[]): Topic[] {
  return topics
    .filter((topic) => topic.status === "weak" || (topic.forgotten && topic.studiedOn))
    .slice(0, 8);
}

export function mockTrend(mockTests: MockTest[]): number {
  if (mockTests.length < 2) return 0;
  const sorted = [...mockTests].sort((a, b) => a.date.localeCompare(b.date));
  const previous = sorted[sorted.length - 2];
  const latest = sorted[sorted.length - 1];
  return Math.round((latest.score / latest.maxScore - previous.score / previous.maxScore) * 100);
}

