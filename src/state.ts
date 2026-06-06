export type ViewMode = "edit" | "preview" | "split";

export interface AppState {
  currentFilePath: string | null;
  currentFileName: string;
  isDirty: boolean;
  viewMode: ViewMode;
  lastSavedContent: string;
}

type StateListener = (state: Readonly<AppState>) => void;

const state: AppState = {
  currentFilePath: null,
  currentFileName: "未命名.md",
  isDirty: false,
  viewMode: "split",
  lastSavedContent: "",
};

const listeners = new Set<StateListener>();

export function getState(): Readonly<AppState> {
  return state;
}

export function setState(patch: Partial<AppState>): void {
  Object.assign(state, patch);
  listeners.forEach((listener) => listener(state));
}

export function subscribe(listener: StateListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
