export function formatTime(iso: string | undefined | null): string {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleString();
}

export function formatDistance(cm: number): string {
  return `${cm.toFixed(1)} cm`;
}
