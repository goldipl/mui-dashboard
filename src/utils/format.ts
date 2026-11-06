import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const compactFormatter = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const numberFormatter = new Intl.NumberFormat('en');

export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatDate(iso: string | undefined, pattern = 'MMM D, YYYY'): string {
  return iso ? dayjs(iso).format(pattern) : '—';
}

export function formatDateTime(iso: string | undefined): string {
  return formatDate(iso, 'MMM D, YYYY HH:mm');
}

export function formatRelative(iso: string | undefined): string {
  return iso ? dayjs(iso).fromNow() : '—';
}

/** Formats seconds as `m:ss` or `h:mm:ss`. */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

export function formatFileSize(kilobytes: number): string {
  if (kilobytes >= 1024 * 1024) return `${(kilobytes / 1024 / 1024).toFixed(1)} GB`;
  if (kilobytes >= 1024) return `${(kilobytes / 1024).toFixed(1)} MB`;
  return `${Math.round(kilobytes)} KB`;
}

/** Converts an ISO date into the value expected by `<input type="datetime-local">`. */
export function toDateTimeLocal(iso: string | undefined): string {
  return iso ? dayjs(iso).format('YYYY-MM-DDTHH:mm') : '';
}

export function fromDateTimeLocal(value: string): string | undefined {
  return value ? dayjs(value).toISOString() : undefined;
}
