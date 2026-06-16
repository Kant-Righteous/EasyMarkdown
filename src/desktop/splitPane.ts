export const DEFAULT_SPLIT_RATIO = 50;
export const MIN_SPLIT_RATIO = 20;
export const MAX_SPLIT_RATIO = 80;

export function clampSplitRatio(ratio: number): number {
  return Math.min(MAX_SPLIT_RATIO, Math.max(MIN_SPLIT_RATIO, ratio));
}

export function getSplitRatioFromPointer(
  clientX: number,
  workspaceLeft: number,
  workspaceWidth: number,
): number {
  if (workspaceWidth <= 0) return DEFAULT_SPLIT_RATIO;
  return clampSplitRatio(
    ((clientX - workspaceLeft) / workspaceWidth) * 100,
  );
}

export function bindSplitPane(): void {
  const workspace = document.querySelector<HTMLElement>("#workspace");
  const resizer = document.querySelector<HTMLElement>("#split-resizer");
  if (!workspace || !resizer) return;

  let ratio = DEFAULT_SPLIT_RATIO;
  const applyRatio = (nextRatio: number): void => {
    ratio = clampSplitRatio(nextRatio);
    workspace.style.setProperty("--editor-ratio", `${ratio}fr`);
    workspace.style.setProperty("--preview-ratio", `${100 - ratio}fr`);
    resizer.setAttribute("aria-valuenow", String(Math.round(ratio)));
  };

  resizer.setAttribute("aria-valuemin", String(MIN_SPLIT_RATIO));
  resizer.setAttribute("aria-valuemax", String(MAX_SPLIT_RATIO));
  applyRatio(DEFAULT_SPLIT_RATIO);

  resizer.addEventListener("pointerdown", (event) => {
    if (
      (event.pointerType === "mouse" && event.button !== 0) ||
      !workspace.classList.contains("view-split") ||
      window.matchMedia("(max-width: 860px)").matches
    ) {
      return;
    }

    event.preventDefault();
    resizer.setPointerCapture(event.pointerId);
    workspace.classList.add("is-resizing-split");

    const updateRatio = (pointerEvent: PointerEvent): void => {
      const rect = workspace.getBoundingClientRect();
      applyRatio(
        getSplitRatioFromPointer(
          pointerEvent.clientX,
          rect.left,
          rect.width,
        ),
      );
    };
    const finishResize = (pointerEvent: PointerEvent): void => {
      if (resizer.hasPointerCapture(pointerEvent.pointerId)) {
        resizer.releasePointerCapture(pointerEvent.pointerId);
      }
      resizer.removeEventListener("pointermove", updateRatio);
      resizer.removeEventListener("pointerup", finishResize);
      resizer.removeEventListener("pointercancel", finishResize);
      workspace.classList.remove("is-resizing-split");
    };

    updateRatio(event);
    resizer.addEventListener("pointermove", updateRatio);
    resizer.addEventListener("pointerup", finishResize);
    resizer.addEventListener("pointercancel", finishResize);
  });

  resizer.addEventListener("keydown", (event) => {
    const step = event.shiftKey ? 10 : 2;
    let nextRatio: number | null = null;
    if (event.key === "ArrowLeft") nextRatio = ratio - step;
    if (event.key === "ArrowRight") nextRatio = ratio + step;
    if (event.key === "Home") nextRatio = MIN_SPLIT_RATIO;
    if (event.key === "End") nextRatio = MAX_SPLIT_RATIO;
    if (nextRatio === null) return;

    event.preventDefault();
    applyRatio(nextRatio);
  });
}
