export function isBeforeCutoff(date = new Date()): boolean {
  return date.getHours() < 22;
}

export function nextDeliveryDate(date = new Date()): string {
  const next = new Date(date);
  if (!isBeforeCutoff(date)) next.setDate(next.getDate() + 1);
  next.setDate(next.getDate() + 1);
  return next.toISOString().slice(0, 10);
}

export function formatDate(value: string): string {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
