/** Format an ISO date string into a short human-readable form. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

/** Format an ISO date string with time. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

/** Return first `n` chars of a string, appending ellipsis if truncated. */
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n).trimEnd() + '…' : str
}

/** Combine class names, filtering out falsy values. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
