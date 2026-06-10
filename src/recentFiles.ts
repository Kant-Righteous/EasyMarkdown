export const RECENT_FILES_KEY = "easymarkdown.recent-files.v1";
const RECENT_FILES_LIMIT = 10;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

type Listener = (paths: readonly string[]) => void;
const listeners = new Set<Listener>();

function defaultStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizePath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const path = value.trim();
  return /^[A-Za-z]:[\\/]/.test(path) ||
    /^\\\\[^\\]/.test(path) ||
    path.startsWith("/")
    ? path
    : null;
}

function parse(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const values: unknown = JSON.parse(raw);
    if (!Array.isArray(values)) return [];
    return [
      ...new Set(
        values
          .map(normalizePath)
          .filter((path): path is string => path !== null),
      ),
    ].slice(0, RECENT_FILES_LIMIT);
  } catch {
    return [];
  }
}

export function loadRecentFiles(storage = defaultStorage()): string[] {
  if (!storage) return [];
  try {
    return parse(storage.getItem(RECENT_FILES_KEY));
  } catch {
    return [];
  }
}

function persist(paths: string[], storage: StorageLike | null): void {
  if (!storage) return;
  try {
    storage.setItem(RECENT_FILES_KEY, JSON.stringify(paths));
  } catch {
    return;
  }
  listeners.forEach((listener) => listener(paths));
}

export function addRecentFile(
  value: string,
  storage = defaultStorage(),
): string[] {
  const path = normalizePath(value);
  if (!path) return loadRecentFiles(storage);
  const paths = [
    path,
    ...loadRecentFiles(storage).filter((item) => item !== path),
  ].slice(0, RECENT_FILES_LIMIT);
  persist(paths, storage);
  return paths;
}

export function removeRecentFile(
  path: string,
  storage = defaultStorage(),
): void {
  persist(
    loadRecentFiles(storage).filter((item) => item !== path),
    storage,
  );
}

export function clearRecentFiles(storage = defaultStorage()): void {
  if (!storage) return;
  try {
    storage.removeItem(RECENT_FILES_KEY);
  } catch {
    return;
  }
  listeners.forEach((listener) => listener([]));
}

export function subscribeRecentFiles(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function bindRecentFilesStorageSync(): void {
  window.addEventListener("storage", (event) => {
    if (event.key !== RECENT_FILES_KEY && event.key !== null) return;
    const paths = event.key === null ? [] : parse(event.newValue);
    listeners.forEach((listener) => listener(paths));
  });
}
