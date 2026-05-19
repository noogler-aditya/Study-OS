import { describe, expect, it } from "vitest";
import { completionPercent, mockTrend } from "../src/lib/analytics";
import { completeRevision, dueRevisionTopics, nextRevisionDate, revisionIntervalDays } from "../src/lib/revision";
import { createSeedData } from "../src/data/seed";
import type { Topic } from "../src/types";

describe("revision engine", () => {
  it("uses deterministic confidence intervals", () => {
    expect(revisionIntervalDays("low", 0)).toBe(1);
    expect(revisionIntervalDays("medium", 0)).toBe(3);
    expect(revisionIntervalDays("high", 0)).toBe(7);
    expect(revisionIntervalDays("high", 2)).toBe(21);
  });

  it("calculates next revision dates", () => {
    expect(nextRevisionDate("2026-05-18", "medium", 1)).toBe("2026-05-24");
  });

  it("marks completed revisions and expands the schedule", () => {
    const topic: Topic = {
      id: "test-topic",
      chapterId: "ch-1",
      subjectId: "sub-1",
      name: "Test Topic",
      status: "learning",
      confidence: "medium",
      studiedOn: "2026-05-16",
      revisionCount: 1,
      nextRevisionOn: "2026-05-17",
      forgotten: false,
      pyqSolved: 5,
      pyqTotal: 40,
      mastery: 35
    };
    const updated = completeRevision(topic, "high", "2026-05-18", false);
    expect(updated.revisionCount).toBe(2);
    expect(updated.nextRevisionOn).toBe("2026-06-08");
  });

  it("finds overdue revision topics", () => {
    const topic: Topic = {
      id: "due-topic",
      chapterId: "ch-1",
      subjectId: "sub-1",
      name: "Due Topic",
      status: "revising",
      confidence: "medium",
      studiedOn: "2026-05-10",
      revisionCount: 1,
      nextRevisionOn: "2026-05-17",
      forgotten: false,
      pyqSolved: 0,
      pyqTotal: 40,
      mastery: 20
    };
    expect(dueRevisionTopics([topic], "2026-05-18").length).toBe(1);
  });
});

describe("analytics", () => {
  it("rolls syllabus completion into a percentage", () => {
    const data = createSeedData();
    // Fresh seed — nothing completed
    expect(completionPercent(data.topics)).toBe(0);
  });

  it("shows mock trend between the latest two tests", () => {
    const mock1 = {
      id: "mock-1",
      name: "Mock 1",
      date: "2026-05-11",
      score: 41,
      maxScore: 100,
      attempted: 47,
      accuracy: 64,
      sillyMistakes: 6,
      conceptualMistakes: 12,
      timeIssues: 8,
      weakSubjectIds: [],
      notes: ""
    };
    const mock2 = { ...mock1, id: "mock-2", date: "2026-05-18", score: 51 };
    expect(mockTrend([mock1, mock2])).toBe(10);
  });
});
