export type Confidence = "low" | "medium" | "high";
export type TopicStatus = "not-started" | "learning" | "completed" | "revising" | "weak" | "mastered";
export type VaultNoteType = "formula" | "mistake" | "insight" | "revision-summary" | "forgotten-concept";

export interface Subject {
  id: string;
  name: string;
  color: string;
  targetWeight: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  order: number;
}

export interface Topic {
  id: string;
  chapterId: string;
  subjectId: string;
  name: string;
  status: TopicStatus;
  confidence: Confidence;
  studiedOn?: string;
  revisionCount: number;
  nextRevisionOn?: string;
  forgotten: boolean;
  pyqSolved: number;
  pyqTotal: number;
  mastery: number;
}



export interface MockTest {
  id: string;
  name: string;
  date: string;
  score: number;
  maxScore: number;
  attempted: number;
  accuracy: number;
  sillyMistakes: number;
  conceptualMistakes: number;
  timeIssues: number;
  weakSubjectIds: string[];
  notes: string;
}

export interface VaultNote {
  id: string;
  type: VaultNoteType;
  title: string;
  body: string;
  subjectId?: string;
  topicId?: string;
  mockTestId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyOsData {
  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];
  mockTests: MockTest[];
  vaultNotes: VaultNote[];
  completedDates?: string[];
  todayTasksCompleted?: string[];
  lastActiveDate?: string;
}

export interface DashboardSummary {
  completionPercent: number;
  weakTopics: Topic[];
  dueRevisions: Topic[];
}
