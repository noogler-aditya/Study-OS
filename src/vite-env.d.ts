/// <reference types="vite/client" />

import type { StudyOsData } from "./types";

declare global {
  interface Window {
    studyOsDesktop?: {
      load: () => Promise<StudyOsData | null>;
      save: (data: StudyOsData) => Promise<void>;
    };
  }
}

export {};
