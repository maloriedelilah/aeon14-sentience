export function formatDate(value?: string): string | undefined {
  if (!value) return undefined;
  if (/^\d{4}$/.test(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(Date.UTC(year, month - 1, 1)));
  }
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, day)));
}

export function isFutureRelease(value?: string, now: Date = new Date()): boolean {
  if (!value) return false;
  const [year, month, day] = value.split('-').map(Number);
  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth() + 1;

  if (!month) return year > nowYear;
  if (!day) return year > nowYear || (year === nowYear && month > nowMonth);

  const release = Date.UTC(year, month - 1, day, 23, 59, 59);
  return release > now.getTime();
}

export function exactPublicationDate(value?: string): string | undefined {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}
