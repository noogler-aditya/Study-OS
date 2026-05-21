export function todayIso(date = new Date()): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysIso(dateIso: string, days: number): string {
  const [year, month, day] = dateIso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function compareIso(a?: string, b?: string): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

export function isDue(dateIso: string | undefined, referenceIso = todayIso()): boolean {
  return Boolean(dateIso && compareIso(dateIso, referenceIso) <= 0);
}

export function formatShortDate(dateIso?: string): string {
  if (!dateIso) return "Not scheduled";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${dateIso}T00:00:00`));
}

export function getStreak(completedDates: string[], today = todayIso()): number {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const datesSet = new Set(completedDates);
  let streak = 0;
  let current = today;
  
  if (datesSet.has(current)) {
    while (datesSet.has(current)) {
      streak++;
      current = addDaysIso(current, -1);
    }
  } else {
    let yesterday = addDaysIso(current, -1);
    while (datesSet.has(yesterday)) {
      streak++;
      yesterday = addDaysIso(yesterday, -1);
    }
  }
  
  return streak;
}
