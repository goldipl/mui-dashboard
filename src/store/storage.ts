import { STATE_VERSION, type NewsroomState } from './reducer';

export const STORAGE_KEY = 'newsroom-dashboard/state';

/** Reads the persisted state. Returns `undefined` when nothing valid is stored. */
export function loadState(): NewsroomState | undefined {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as NewsroomState;
    if (parsed.version !== STATE_VERSION || !Array.isArray(parsed.articles)) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

/** Persists the state. Returns `false` when storage is unavailable or full. */
export function saveState(state: NewsroomState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage is not available, so there is nothing to clear.
  }
}
