import { create } from "zustand";
import type { Confidence, MockTest, StudyOsData, Topic, TopicStatus, VaultNote, FocusSession } from "../types";
import { completionPercent, weakTopics } from "../lib/analytics";
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
  startTopic: (topicId: string, confidence?: Confidence, manualDate?: string) => void;
  completeRevision: (topicId: string, confidence: Confidence, forgotten: boolean) => void;
  addMockTest: (mock: MockTest) => void;
  addVaultNote: (note: VaultNote) => void;
  deleteVaultNote: (noteId: string) => void;
  toggleTask: (taskId: string) => void;
  dashboard: () => {
    completionPercent: number;
    dueRevisions: Topic[];
    weakTopics: Topic[];
  };
  focusSession: FocusSession | null;
  startFocusSession: (taskId: string, subjectName: string, durationMinutes: number) => void;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  tickFocusSession: () => void;
  cancelFocusSession: () => void;
  clearCompletedFocusSession: () => void;
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
    mockTests: state.mockTests,
    vaultNotes: state.vaultNotes,
    completedDates: state.completedDates,
    todayTasksCompleted: state.todayTasksCompleted,
    lastActiveDate: state.lastActiveDate
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
  mockTests: [],
  vaultNotes: [],
  completedDates: [],
  todayTasksCompleted: [],
  lastActiveDate: "",
  focusSession: null,

  setActiveView: (activeView) => set({ activeView }),

  hydrate: async () => {
    try {
      const data = await loadStudyOsData();
      const today = todayIso();
      const lastActive = data.lastActiveDate || today;
      let todayTasks = data.todayTasksCompleted || [];
      
      if (lastActive !== today) {
        todayTasks = [];
      }
      
      set({ 
        ...data, 
        completedDates: data.completedDates || [],
        todayTasksCompleted: todayTasks,
        lastActiveDate: today,
        loading: false 
      });
    } catch (error) {
      console.error("[Study OS] Failed to load data:", error);
      set({ loading: false, saveStatus: "error", saveError: "Failed to load study data" });
    }
  },

  reset: async () => {
    try {
      const data = await resetStudyOsData();
      set({ 
        ...data, 
        completedDates: [],
        todayTasksCompleted: [],
        lastActiveDate: "",
        loading: false, 
        saveStatus: "saved", 
        saveError: null 
      });
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

  startTopic: (topicId, confidence = "medium", manualDate) => {
    const state = get();
    const today = todayIso();
    const topic = state.topics.find((t) => t.id === topicId);
    if (!topic) return;

    const revisionDate = manualDate || nextRevisionDate(today, confidence, topic.revisionCount);
    const next = {
      ...state,
      topics: state.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              status: "learning" as TopicStatus,
              confidence,
              studiedOn: today,
              nextRevisionOn: revisionDate,
              mastery: Math.max(t.mastery, 18)
            }
          : t
      )
    };
    set(next);
    void persist(next as StudyStore, set);
  },

  completeRevision: (topicId, confidence, forgotten) => {
    const state = get();
    const updatedTopic = completeRevisionTopic(
      state.topics.find((t) => t.id === topicId)!,
      confidence,
      todayIso(),
      forgotten
    );
    const next = {
      ...state,
      topics: state.topics.map((t) => (t.id === topicId ? updatedTopic : t))
    };
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

  toggleTask: (taskId) => {
    const state = get();
    const today = todayIso();
    const lastActive = state.lastActiveDate || today;
    let todayTasks = state.todayTasksCompleted || [];

    if (lastActive !== today) {
      todayTasks = [];
    }

    const isCompleted = todayTasks.includes(taskId);
    const nextTasks = isCompleted 
      ? todayTasks.filter((id) => id !== taskId) 
      : [...todayTasks, taskId];

    const totalTaskIds = ["discrete-math", "pds", "digital", "os", "dbms", "aptitude"];
    const allCompleted = totalTaskIds.every((id) => nextTasks.includes(id));

    let nextCompletedDates = state.completedDates || [];
    if (allCompleted) {
      if (!nextCompletedDates.includes(today)) {
        nextCompletedDates = [...nextCompletedDates, today];
      }
    } else {
      nextCompletedDates = nextCompletedDates.filter((date) => date !== today);
    }

    const next = {
      ...state,
      lastActiveDate: today,
      todayTasksCompleted: nextTasks,
      completedDates: nextCompletedDates
    };

    set(next);
    void persist(next as StudyStore, set);
  },

  dashboard: () => {
    const state = get();
    const today = todayIso();
    return {
      completionPercent: completionPercent(state.topics),
      dueRevisions: dueRevisionTopics(state.topics, today),
      weakTopics: weakTopics(state.topics)
    };
  },

  startFocusSession: (taskId, subjectName, durationMinutes) => {
    set({
      focusSession: {
        taskId,
        subjectName,
        durationMinutes,
        timeLeftSeconds: durationMinutes * 60,
        status: "running"
      }
    });
  },

  pauseFocusSession: () => {
    const session = get().focusSession;
    if (!session) return;
    set({
      focusSession: {
        ...session,
        status: "paused"
      }
    });
  },

  resumeFocusSession: () => {
    const session = get().focusSession;
    if (!session) return;
    set({
      focusSession: {
        ...session,
        status: "running"
      }
    });
  },

  tickFocusSession: () => {
    const session = get().focusSession;
    if (!session || session.status !== "running") return;
    const nextSeconds = session.timeLeftSeconds - 1;
    if (nextSeconds <= 0) {
      set({
        focusSession: {
          ...session,
          timeLeftSeconds: 0,
          status: "completed"
        }
      });
      // Automatically check the checklist task if it wasn't already checked!
      const todayTasks = get().todayTasksCompleted || [];
      if (!todayTasks.includes(session.taskId)) {
        get().toggleTask(session.taskId);
      }
    } else {
      set({
        focusSession: {
          ...session,
          timeLeftSeconds: nextSeconds
        }
      });
    }
  },

  cancelFocusSession: () => {
    set({ focusSession: null });
  },

  clearCompletedFocusSession: () => {
    set({ focusSession: null });
  }
}));
