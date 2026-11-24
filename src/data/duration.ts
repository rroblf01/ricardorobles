export const CURRENT = "Actualidad";

/** Parses "MM/YYYY" into a month index (year * 12 + month). */
function toMonthIndex(value: string): number {
  const [month, year] = value.split("/").map(Number);
  return year * 12 + (month - 1);
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Time spent between two "MM/YYYY" dates, counting both the start and end
 * month (as LinkedIn does). `end` may be "Actualidad", meaning `now`.
 */
export function formatDuration(start: string, end: string, now: Date = new Date()): string {
  const endIndex = end === CURRENT ? now.getFullYear() * 12 + now.getMonth() : toMonthIndex(end);
  const total = Math.max(1, endIndex - toMonthIndex(start) + 1);
  const years = Math.floor(total / 12);
  const months = total % 12;

  const parts = [];
  if (years > 0) parts.push(plural(years, "año", "años"));
  if (months > 0) parts.push(plural(months, "mes", "meses"));
  return parts.join(" y ");
}
