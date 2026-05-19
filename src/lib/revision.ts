import type { Confidence, Topic } from "../types";
import { addDaysIso, isDue, todayIso } from "./date";

const baseIntervals: Record<Confidence, number> = {
  low: 1,
  medium: 3,
  high: 7
};

export function revisionIntervalDays(confidence: Confidence, revisionCount: number): number {
  const multiplier = Math.max(1, revisionCount + 1);
  return baseIntervals[confidence] * multiplier;
}

export function nextRevisionDate(studiedOn: string, confidence: Confidence, revisionCount: number): string {
  return addDaysIso(studiedOn, revisionIntervalDays(confidence, revisionCount));
}

export function completeRevision(topic: Topic, confidence: Confidence, completedOn = todayIso(), forgotten = false): Topic {
  const revisionCount = topic.revisionCount + 1;
  return {
    ...topic,
    status: forgotten || confidence === "low" ? "weak" : revisionCount >= 3 && confidence === "high" ? "mastered" : "revising",
    confidence,
    forgotten,
    studiedOn: topic.studiedOn ?? completedOn,
    revisionCount,
    nextRevisionOn: nextRevisionDate(completedOn, confidence, revisionCount),
    mastery: Math.min(100, topic.mastery + (confidence === "high" ? 18 : confidence === "medium" ? 10 : 4))
  };
}

export function dueRevisionTopics(topics: Topic[], referenceIso = todayIso()): Topic[] {
  return topics
    .filter((topic) => isDue(topic.nextRevisionOn, referenceIso))
    .sort((a, b) => (a.nextRevisionOn ?? "").localeCompare(b.nextRevisionOn ?? ""));
}
