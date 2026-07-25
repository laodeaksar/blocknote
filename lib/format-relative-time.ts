export function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "Baru saja disimpan";
  if (seconds < 60) return `Disimpan ${seconds} dtk lalu`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Disimpan ${minutes} mnt lalu`;
  return `Disimpan ${Math.floor(minutes / 60)} jam lalu`;
}
