export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString || '—';
  }
}

export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;

    return formatDate(dateString);
  } catch {
    return dateString || '—';
  }
}

export function isOverdue(dateString?: string | null): boolean {
  if (!dateString) return false;
  try {
    const d = new Date(dateString);
    const now = new Date();
    // Compare date parts only
    return d < new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } catch {
    return false;
  }
}
