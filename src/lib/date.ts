export function formatDate(value: string): string {
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

export function isFutureRelease(value: string, now: Date = new Date()): boolean {
  const [year, month, day] = value.split('-').map(Number);
  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth() + 1;

  if (!month) return year > nowYear;
  if (!day) return year > nowYear || (year === nowYear && month > nowMonth);

  const release = Date.UTC(year, month - 1, day, 23, 59, 59);
  return release > now.getTime();
}

// Offer.availabilityStarts should only be emitted when we know an actual day.
// A month/year or year-only publication value is valid schema.org data but is
// not precise enough to assert a storefront availability start date.
export function exactPublicationDate(value: string): string | undefined {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}
