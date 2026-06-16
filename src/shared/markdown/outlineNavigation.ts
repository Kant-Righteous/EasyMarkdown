import type { ViewMode } from "../state/state";

export type OutlineNavigationSurface = "editor" | "preview";

export function getOutlineNavigationSurface(
  viewMode: ViewMode,
): OutlineNavigationSurface {
  return viewMode === "edit" ? "editor" : "preview";
}

export function getPreviewHeadingSelector(item: {
  level: number;
  line: number;
}): string {
  return `#preview h${item.level}[data-source-line="${item.line - 1}"]`;
}
