export const DEFAULT_PREVIEW_ZOOM = 1;
export const MIN_PREVIEW_ZOOM = 0.5;
export const MAX_PREVIEW_ZOOM = 2;
export const PREVIEW_ZOOM_STEP = 0.1;

const PREVIEW_ZOOM_STORAGE_KEY = "easymarkdown.preview-zoom.v1";
export type PreviewZoomAction = "decrease" | "increase" | "reset";

export function normalizePreviewZoom(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PREVIEW_ZOOM;
  return Math.min(MAX_PREVIEW_ZOOM, Math.max(MIN_PREVIEW_ZOOM, value));
}

export function parsePreviewZoomInput(value: string): number | null {
  const percentage = Number(value.trim().replace(/%$/, "").trim());
  if (!Number.isFinite(percentage) || value.trim() === "") return null;
  return normalizePreviewZoom(percentage / 100);
}

export function getNextPreviewZoom(
  currentZoom: number,
  wheelDelta: number,
): number {
  if (wheelDelta === 0) return normalizePreviewZoom(currentZoom);
  const direction = wheelDelta < 0 ? 1 : -1;
  const nextZoom =
    Math.round((currentZoom + direction * PREVIEW_ZOOM_STEP) * 10) / 10;
  return normalizePreviewZoom(nextZoom);
}

export function getPreviewZoomFromAction(
  currentZoom: number,
  action: PreviewZoomAction,
): number {
  if (action === "reset") return DEFAULT_PREVIEW_ZOOM;
  return getNextPreviewZoom(currentZoom, action === "increase" ? -1 : 1);
}

function loadPreviewZoom(): number {
  try {
    const storedZoom = window.localStorage.getItem(PREVIEW_ZOOM_STORAGE_KEY);
    return storedZoom === null
      ? DEFAULT_PREVIEW_ZOOM
      : normalizePreviewZoom(Number(storedZoom));
  } catch {
    return DEFAULT_PREVIEW_ZOOM;
  }
}

export function bindContentZoom(): void {
  const editor = document.querySelector<HTMLTextAreaElement>("#editor");
  const preview = document.querySelector<HTMLElement>("#preview");
  const zoomValue = document.querySelector<HTMLInputElement>("#zoom-value");
  if (!editor || !preview || !zoomValue) return;

  let zoom = loadPreviewZoom();
  const formatZoom = (): string => `${Math.round(zoom * 100)}%`;

  const applyZoom = (nextZoom: number): void => {
    zoom = normalizePreviewZoom(nextZoom);
    document.documentElement.style.setProperty("--content-zoom", String(zoom));
    editor.dataset.zoom = formatZoom();
    preview.dataset.zoom = formatZoom();
    zoomValue.value = formatZoom();
    try {
      window.localStorage.setItem(PREVIEW_ZOOM_STORAGE_KEY, String(zoom));
    } catch {
      // The zoom remains active for this session when storage is unavailable.
    }
  };

  applyZoom(zoom);

  const applyZoomInput = (): void => {
    const nextZoom = parsePreviewZoomInput(zoomValue.value);
    if (nextZoom === null) {
      zoomValue.value = formatZoom();
      return;
    }
    applyZoom(nextZoom);
  };

  zoomValue.addEventListener("focus", () => zoomValue.select());
  zoomValue.addEventListener("blur", applyZoomInput);
  zoomValue.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyZoomInput();
      zoomValue.blur();
    } else if (event.key === "Escape") {
      event.preventDefault();
      zoomValue.value = formatZoom();
      zoomValue.blur();
    }
  });

  const handleWheel = (event: WheelEvent): void => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    applyZoom(getNextPreviewZoom(zoom, event.deltaY));
  };

  [editor, preview].forEach((element) => {
    element.addEventListener(
      "wheel",
      handleWheel as EventListener,
      { passive: false },
    );
  });

  document
    .querySelectorAll<HTMLButtonElement>("[data-zoom-action]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.zoomAction as PreviewZoomAction;
        applyZoom(getPreviewZoomFromAction(zoom, action));
      });
    });

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && !event.altKey && !event.metaKey && event.key === "0") {
      event.preventDefault();
      applyZoom(DEFAULT_PREVIEW_ZOOM);
    }
  });
}

export function bindPreviewZoom(): void {
  bindContentZoom();
}
