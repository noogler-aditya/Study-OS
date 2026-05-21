import { createSeedData } from "../data/seed";
import type { StudyOsData } from "../types";

/**
 * Storage layer for Study OS.
 * 
 * Primary: Electron IPC (writes to ~/Library/Application Support/Study OS/)
 * Fallback: None — the app is designed to run as a desktop app.
 * 
 * If running in browser dev mode (npm run dev), data is stored in
 * localStorage as a convenience but a warning is logged.
 */

const DEV_STORAGE_KEY = "study-os:v7:dev";

function isElectron(): boolean {
  return Boolean(window.studyOsDesktop);
}

export async function loadStudyOsData(): Promise<StudyOsData> {
  if (isElectron()) {
    const saved = await window.studyOsDesktop!.load();
    if (saved) return saved;
    // First launch — seed and persist
    const seed = createSeedData();
    await saveStudyOsData(seed);
    return seed;
  }

  // Dev-only fallback (npm run dev in browser)
  console.warn(
    "[Study OS] Running in browser dev mode. Data is stored in localStorage and may be lost. Use `npm run desktop:dev` for persistent storage."
  );
  const saved = window.localStorage.getItem(DEV_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as StudyOsData;
    } catch {
      console.error("[Study OS] Dev localStorage data corrupted. Reseeding.");
    }
  }
  const seed = createSeedData();
  window.localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

export async function saveStudyOsData(data: StudyOsData): Promise<void> {
  if (isElectron()) {
    await window.studyOsDesktop!.save(data);
    return;
  }

  // Dev-only fallback
  window.localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(data));
}

export async function resetStudyOsData(): Promise<StudyOsData> {
  const seed = createSeedData();
  await saveStudyOsData(seed);
  return seed;
}
