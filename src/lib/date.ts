export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}

export function isFutureRelease(date: Date, now: Date = new Date()): boolean {
  return date.getTime() > now.getTime();
}
