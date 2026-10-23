/** Deterministic helpers so mock data is stable between reloads. */

let seed = 42;
export function rand(): number {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
export function resetSeed(s = 42) {
  seed = s;
}
export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
export function between(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}
export function round1(n: number) {
  return Math.round(n * 10) / 10;
}

const DAY = 86_400_000;
/** ISO timestamp `days` from now (negative = past). */
export function daysFromNow(days: number, hour = 10, minute = 0): string {
  const d = new Date(Date.now() + days * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
/** YYYY-MM-DD `days` from now in local time. */
export function dateKey(days: number): string {
  const d = new Date(Date.now() + days * DAY);
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dd}`;
}
export function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}
export function avatar(n: number): string {
  return `https://i.pravatar.cc/200?img=${n}`;
}

let counter = 1000;
export function uid(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`;
}
export function otp(): string {
  return `${between(1000, 9999)}`;
}
