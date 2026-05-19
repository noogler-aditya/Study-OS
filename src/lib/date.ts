export function todayIso(date = new Date()): string {
  return date.toISOString().slice(0, 10);
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
