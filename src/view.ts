import { setState, type ViewMode } from "./state";

export function applyViewMode(mode: ViewMode): void {
  const workspace = document.querySelector<HTMLElement>("#workspace");
  if (!workspace) return;

  workspace.classList.remove("view-edit", "view-preview", "view-split");
  workspace.classList.add(`view-${mode}`);
}

export function setViewMode(mode: ViewMode): void {
  applyViewMode(mode);
  setState({ viewMode: mode });
}
