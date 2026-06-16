import { getCurrentWindow } from "@tauri-apps/api/window";

const SUPPORTED_FILE_PATTERN = /\.(?:md|markdown|txt)$/i;

export function isSupportedDroppedFile(path: string): boolean {
  const fileName = path.split(/[\\/]/).pop() ?? "";
  return SUPPORTED_FILE_PATTERN.test(fileName);
}

export function selectDroppedFile(paths: readonly string[]): string | null {
  return paths.find(isSupportedDroppedFile) ?? null;
}

export async function bindFileDrop(
  openFile: (path: string) => Promise<boolean>,
): Promise<void> {
  const shell = document.querySelector<HTMLElement>("#workspace-shell");
  if (!shell) return;

  let supportedDrag = false;
  try {
    await getCurrentWindow().onDragDropEvent((event) => {
      if (event.payload.type === "enter") {
        supportedDrag = selectDroppedFile(event.payload.paths) !== null;
        shell.classList.toggle("is-file-drag-over", supportedDrag);
        return;
      }
      if (event.payload.type === "over") {
        shell.classList.toggle("is-file-drag-over", supportedDrag);
        return;
      }

      shell.classList.remove("is-file-drag-over");
      supportedDrag = false;
      if (event.payload.type !== "drop") return;

      const path = selectDroppedFile(event.payload.paths);
      if (path) void openFile(path);
    });
  } catch {
    // Regular browser development does not expose Tauri drag-drop events.
  }
}
