import { create } from "zustand";
import type { Confidence, MockTest, StudyBlock, StudyOsData, Topic, TopicStatus, VaultNote } from "../types";
import { completionPercent, dailyStreak, weakTopics } from "../lib/analytics";
import { dueRevisionTopics, completeRevision as completeRevisionTopic, nextRevisionDate } from "../lib/revision";
import { loadStudyOsData, resetStudyOsData, saveStudyOsData } from "../lib/storage";
import { todayIso } from "../lib/date";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface StudyStore extends StudyOsData {
  loading: boolean;
  activeView: string;
  saveStatus: SaveStatus;
  saveError: string | null;
  setActiveView: (view: string) => void;
  hydrate: () => Promise<void>;
  reset: () => Promise<void>;
  updateTopic: (topicId: string, patch: Partial<Topic>) => void;
  startTopic: (topicId: string, confidence?: Confidence) => void;
  completeRevision: (topicId: string, confidence: Confidence, forgotten: boolean) => void;
  upsertStudyBlock: (block: StudyBlock) => void;
  toggleStudyBlock: (blockId: string) => void;
  deleteStudyBlock: (blockId: string) => void;
  addMockTest: (mock: MockTest) => void;
  addVaultNote: (note: VaultNote) => void;
  deleteVaultNote: (noteId: string) => void;
  dashboard: () => {
    completionPercent: number;
    dueRevisions: Topic[];
    weakTopics: Topic[];
    todayBlocks: StudyBlock[];
    upcomingMocks: StudyBlock[];
    streakDays: number;
  };
}

/**
 * Persist state to disk via Electron IPC.
 * Properly awaits the write and updates save status.
 */
async function persist(state: StudyStore, set: (partial: Partial<StudyStore>) => void) {
  const data: StudyOsData = {
    subjects: state.subjects,
    chapters: state.chapters,
    topics: state.topics,
    studyBlocks: state.studyBlocks,
    mockTests: state.mockTests,
    vaultNotes: state.vaultNotes
  };

  set({ saveStatus: "saving", saveError: null });

  try {
    await saveStudyOsData(data);
    set({ saveStatus: "saved" });
    // Reset to idle after a brief moment so the UI can flash "saved"
    setTimeout(() => set({ saveStatus: "idle" }), 1500);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save data";
    console.error("[Study OS] Save failed:", message);
    set({ saveStatus: "error", saveError: message });
  }
}

export const useStudyStore = create<StudyStore>((set, get) => ({
  loading: true,
  activeView: "dashboard",
  saveStatus: "idle" as SaveStatus,
  saveError: null,
  subjects: [],
  chapters: [],
  topics: [],
  studyBlocks: [],
  mockTests: [],
  vaultNotes: [],

  setActiveView: (activeView) => set({ activeView }),

  hydrate: async () => {
    try {
      const data = await loadStudyOsData();
      set({ ...data, loading: false });
    } catch (error) {
      console.error("[Study OS] Failed to load data:", error);
      set({ loading: false, saveStatus: "error", saveError: "Failed to load study data" });
    }
  },

  reset: async () => {
    try {
      const data = await resetStudyOsData();
      set({ ...data, loading: false, saveStatus: "saved", saveError: null });
      setTimeout(() => set({ saveStatus: "idle" }), 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reset data";
      set({ saveStatus: "error", saveError: message });
    }
  },

  updateTopic: (topicId, patch) => {
    const state = get();
    const next = { ...state, topics: state.topics.map((topic) => (topic.id === topicId ? { ...topic, ...patch } : topic)) };
    set(next);
    void persist(next as StudyStore, set);
  },

  startTopic: (topicId, confidence = "medium") => {
    const state = get();
    const today = todayIso();
    const next = {
      ...state,
      topics: state.topics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              status: "learning" as TopicStatus,
              confidence,
              studiedOn: today,
              nextRevisionOn: nextRevisionDate(today, confidence, topic.revisionCount),
              mastery: Math.max(topic.mastery, 18)
            }
          : topic
      )
    };
    set(next);
    void persist(next as StudyStore, set);
  },

  completeRevision: (topicId, confidence, forgotten) => {
    const state = get();
    const next = {
      ...state,
      topics: state.topics.map((topic) => (topic.id === topicId ? completeRevisionTopic(topic, confidence, todayIso(), forgotten) : topic))
    };
    set(next);
    void persist(next as StudyStore, set);
  },

  upsertStudyBlock: (block) => {
    const state = get();
    const exists = state.studyBlocks.some((item) => item.id === block.id);
    const next = { ...state, studyBlocks: exists ? state.studyBlocks.map((item) => (item.id === block.id ? block : item)) : [block, ...state.studyBlocks] };
    set(next);
    void persist(next as StudyStore, set);
  },

  toggleStudyBlock: (blockId) => {
    const state = get();
    const next = { ...state, studyBlocks: state.studyBlocks.map((block) => (block.id === blockId ? { ...block, completed: !block.completed } : block)) };
    set(next);
    void persist(next as StudyStore, set);
  },

  deleteStudyBlock: (blockId) => {
    const state = get();
    const next = { ...state, studyBlocks: state.studyBlocks.filter((block) => block.id !== blockId) };
    set(next);
    void persist(next as StudyStore, set);
  },

  addMockTest: (mock) => {
    const state = get();
    const weakTopicsFromSubjects = state.topics.map((topic) => (mock.weakSubjectIds.includes(topic.subjectId) ? { ...topic, status: "weak" as TopicStatus, confidence: "low" as Confidence } : topic));
    const next = { ...state, mockTests: [mock, ...state.mockTests], topics: weakTopicsFromSubjects };
    set(next);
    void persist(next as StudyStore, set);
  },

  addVaultNote: (note) => {
    const state = get();
    const next = { ...state, vaultNotes: [note, ...state.vaultNotes] };
    set(next);
    void persist(next as StudyStore, set);
  },

  deleteVaultNote: (noteId) => {
    const state = get();
    const next = { ...state, vaultNotes: state.vaultNotes.filter((note) => note.id !== noteId) };
    set(next);
    void persist(next as StudyStore, set);
  },

  dashboard: () => {
    const state = get();
    const today = todayIso();
    return {
      completionPercent: completionPercent(state.topics),
      dueRevisions: dueRevisionTopics(state.topics, today),
      weakTopics: weakTopics(state.topics),
      todayBlocks: state.studyBlocks.filter((block) => block.date === today).sort((a, b) => a.start.localeCompare(b.start)),
      upcomingMocks: state.studyBlocks.filter((block) => block.type === "mock" && block.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3),
      streakDays: dailyStreak(state.studyBlocks, today)
    };
  }
}));
