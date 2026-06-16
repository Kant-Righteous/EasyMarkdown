export type SidebarTab = "files" | "outline";

export interface SidebarStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const SIDEBAR_OPEN_KEY = "easymarkdown.sidebar-open.v1";
export const SIDEBAR_WIDTH_KEY = "easymarkdown.sidebar-width.v1";
export const SIDEBAR_DEFAULT_WIDTH = 240;
export const SIDEBAR_MIN_WIDTH = 180;
export const SIDEBAR_MAX_WIDTH = 480;
const WORKSPACE_MIN_WIDTH = 320;

function defaultStorage(): SidebarStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadSidebarOpen(
  storage: SidebarStorage | null = defaultStorage(),
): boolean {
  if (!storage) return true;
  try {
    return storage.getItem(SIDEBAR_OPEN_KEY) !== "false";
  } catch {
    return true;
  }
}

export function saveSidebarOpen(
  open: boolean,
  storage: SidebarStorage | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(SIDEBAR_OPEN_KEY, String(open));
  } catch {
    // Storage failures should not block sidebar interaction.
  }
}

export function normalizeSidebarTab(value: unknown): SidebarTab {
  return value === "outline" ? "outline" : "files";
}

export function clampSidebarWidth(
  width: number,
  viewportWidth: number,
): number {
  const viewportMaximum = Math.max(
    SIDEBAR_MIN_WIDTH,
    viewportWidth - WORKSPACE_MIN_WIDTH,
  );
  const maximum = Math.min(SIDEBAR_MAX_WIDTH, viewportMaximum);
  return Math.round(Math.min(maximum, Math.max(SIDEBAR_MIN_WIDTH, width)));
}

export function loadSidebarWidth(
  storage: SidebarStorage | null = defaultStorage(),
  viewportWidth = window.innerWidth,
): number {
  if (!storage) return clampSidebarWidth(SIDEBAR_DEFAULT_WIDTH, viewportWidth);
  try {
    const width = Number(storage.getItem(SIDEBAR_WIDTH_KEY));
    return clampSidebarWidth(
      Number.isFinite(width) && width > 0 ? width : SIDEBAR_DEFAULT_WIDTH,
      viewportWidth,
    );
  } catch {
    return clampSidebarWidth(SIDEBAR_DEFAULT_WIDTH, viewportWidth);
  }
}

export function saveSidebarWidth(
  width: number,
  storage: SidebarStorage | null = defaultStorage(),
): void {
  if (!storage || !Number.isFinite(width)) return;
  try {
    storage.setItem(SIDEBAR_WIDTH_KEY, String(Math.round(width)));
  } catch {
    // Storage failures should not block sidebar interaction.
  }
}

export function getSidebarWidthFromPointer(
  clientX: number,
  shellLeft: number,
  viewportWidth: number,
): number {
  return clampSidebarWidth(clientX - shellLeft, viewportWidth);
}

export function isSameSidebarFilePath(
  firstPath: string | null,
  secondPath: string | null,
): boolean {
  if (firstPath === null || secondPath === null) {
    return firstPath === secondPath;
  }
  const normalize = (path: string): string =>
    path.replace(/\//g, "\\").toLocaleLowerCase();
  return normalize(firstPath) === normalize(secondPath);
}
