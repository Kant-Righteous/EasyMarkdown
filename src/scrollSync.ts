export interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

export function calculateSyncedScrollTop(
  source: ScrollMetrics,
  target: Pick<ScrollMetrics, "scrollHeight" | "clientHeight">,
): number {
  const sourceRange = Math.max(0, source.scrollHeight - source.clientHeight);
  const targetRange = Math.max(0, target.scrollHeight - target.clientHeight);
  if (sourceRange === 0 || targetRange === 0) return 0;

  const sourceTop = Math.min(Math.max(source.scrollTop, 0), sourceRange);
  return (sourceTop / sourceRange) * targetRange;
}

export function bindSplitScrollSync(): () => void {
  const editor = document.querySelector<HTMLTextAreaElement>("#editor");
  const preview = document.querySelector<HTMLElement>("#preview");
  const workspace = document.querySelector<HTMLElement>("#workspace");
  if (!editor || !preview || !workspace) return () => {};

  let syncing = false;

  const sync = (
    source: HTMLElement | HTMLTextAreaElement,
    target: HTMLElement | HTMLTextAreaElement,
  ): void => {
    if (syncing || !workspace.classList.contains("view-split")) return;

    syncing = true;
    target.scrollTop = calculateSyncedScrollTop(source, target);
    window.requestAnimationFrame(() => {
      syncing = false;
    });
  };

  const syncFromEditor = (): void => sync(editor, preview);
  editor.addEventListener("scroll", syncFromEditor);
  preview.addEventListener("scroll", () => sync(preview, editor));

  const viewObserver = new MutationObserver(() => {
    if (workspace.classList.contains("view-split")) {
      syncFromEditor();
    }
  });
  viewObserver.observe(workspace, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return syncFromEditor;
}
