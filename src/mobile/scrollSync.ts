export interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

export interface SourceScrollAnchor {
  line: number;
  top: number;
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

function interpolateAnchorValue(
  value: number,
  anchors: SourceScrollAnchor[],
  input: "line" | "top",
  output: "line" | "top",
): number {
  if (value <= anchors[0][input]) return anchors[0][output];

  for (let index = 1; index < anchors.length; index += 1) {
    const left = anchors[index - 1];
    const right = anchors[index];
    if (value > right[input]) continue;

    const range = right[input] - left[input];
    if (range <= 0) return right[output];
    const progress = (value - left[input]) / range;
    return left[output] + progress * (right[output] - left[output]);
  }

  return anchors[anchors.length - 1]?.[output] ?? 0;
}

export function calculateAnchoredScrollTop(
  sourceTop: number,
  sourceAnchors: SourceScrollAnchor[],
  targetAnchors: SourceScrollAnchor[],
): number | null {
  if (sourceAnchors.length < 2 || targetAnchors.length < 2) return null;

  const sourceLine = interpolateAnchorValue(
    sourceTop,
    sourceAnchors,
    "top",
    "line",
  );
  return interpolateAnchorValue(sourceLine, targetAnchors, "line", "top");
}

function getScrollRange(element: HTMLElement | HTMLTextAreaElement): number {
  return Math.max(0, element.scrollHeight - element.clientHeight);
}

function normalizeAnchors(
  anchors: SourceScrollAnchor[],
): SourceScrollAnchor[] {
  const byLine = new Map<number, number>();
  for (const anchor of anchors) {
    const existingTop = byLine.get(anchor.line);
    if (existingTop === undefined || anchor.top < existingTop) {
      byLine.set(anchor.line, anchor.top);
    }
  }
  return [...byLine]
    .map(([line, top]) => ({ line, top }))
    .sort((left, right) => left.line - right.line);
}

function buildPreviewAnchors(
  preview: HTMLElement,
  lineCount: number,
): SourceScrollAnchor[] {
  const range = getScrollRange(preview);
  const previewTop = preview.getBoundingClientRect().top;
  const anchors: SourceScrollAnchor[] = [{ line: 0, top: 0 }];

  preview.querySelectorAll<HTMLElement>("[data-source-line]").forEach((item) => {
    const line = Number(item.dataset.sourceLine);
    if (!Number.isInteger(line) || line <= 0 || line >= lineCount) return;
    const top =
      item.getBoundingClientRect().top - previewTop + preview.scrollTop;
    anchors.push({ line, top: Math.min(range, Math.max(0, top)) });
  });

  anchors.push({ line: lineCount, top: range });
  return normalizeAnchors(anchors);
}

function copyEditorLayout(
  editor: HTMLTextAreaElement,
  mirror: HTMLDivElement,
): void {
  const style = window.getComputedStyle(editor);
  Object.assign(mirror.style, {
    position: "fixed",
    left: "-100000px",
    top: "0",
    visibility: "hidden",
    pointerEvents: "none",
    width: `${editor.clientWidth}px`,
    height: "auto",
    boxSizing: "border-box",
    margin: "0",
    border: "0",
    padding: style.padding,
    font: style.font,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textTransform: style.textTransform,
    textIndent: style.textIndent,
    tabSize: style.tabSize,
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    wordBreak: style.wordBreak,
  });
}

function buildEditorAnchors(
  editor: HTMLTextAreaElement,
  anchorLines: number[],
  lineCount: number,
): SourceScrollAnchor[] {
  const mirror = document.createElement("div");
  copyEditorLayout(editor, mirror);
  const requestedLines = new Set(anchorLines);
  const markers = new Map<number, HTMLSpanElement>();
  const lines = editor.value.split("\n");

  lines.forEach((line, index) => {
    if (requestedLines.has(index)) {
      const marker = document.createElement("span");
      marker.style.display = "inline-block";
      marker.style.width = "0";
      marker.style.height = "0";
      mirror.append(marker);
      markers.set(index, marker);
    }
    mirror.append(document.createTextNode(line));
    if (index < lines.length - 1) mirror.append(document.createTextNode("\n"));
  });

  document.body.append(mirror);
  const range = getScrollRange(editor);
  const anchors = anchorLines
    .filter((line) => line > 0 && line < lineCount)
    .flatMap((line) => {
      const marker = markers.get(line);
      return marker
        ? [{ line, top: Math.min(range, Math.max(0, marker.offsetTop)) }]
        : [];
    });
  mirror.remove();

  return normalizeAnchors([
    { line: 0, top: 0 },
    ...anchors,
    { line: lineCount, top: range },
  ]);
}

export function bindSplitScrollSync(): () => void {
  const editor = document.querySelector<HTMLTextAreaElement>("#editor");
  const preview = document.querySelector<HTMLElement>("#preview");
  const workspace = document.querySelector<HTMLElement>("#workspace");
  if (!editor || !preview || !workspace) return () => {};

  let syncing = false;
  let anchorsDirty = true;
  let editorAnchors: SourceScrollAnchor[] = [];
  let previewAnchors: SourceScrollAnchor[] = [];

  const rebuildAnchors = (): void => {
    const lineCount = Math.max(1, editor.value.split("\n").length);
    previewAnchors = buildPreviewAnchors(preview, lineCount);
    editorAnchors = buildEditorAnchors(
      editor,
      previewAnchors.map((anchor) => anchor.line),
      lineCount,
    );
    anchorsDirty = false;
  };

  const sync = (
    source: HTMLElement | HTMLTextAreaElement,
    target: HTMLElement | HTMLTextAreaElement,
  ): void => {
    if (syncing || !workspace.classList.contains("view-split")) return;

    if (anchorsDirty) rebuildAnchors();
    const sourceAnchors = source === editor ? editorAnchors : previewAnchors;
    const targetAnchors = target === editor ? editorAnchors : previewAnchors;
    const anchoredTop = calculateAnchoredScrollTop(
      source.scrollTop,
      sourceAnchors,
      targetAnchors,
    );

    syncing = true;
    target.scrollTop =
      anchoredTop ?? calculateSyncedScrollTop(source, target);
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

  const markAnchorsDirty = (): void => {
    anchorsDirty = true;
  };
  window.addEventListener("resize", markAnchorsDirty);
  preview.addEventListener("load", markAnchorsDirty, true);

  return () => {
    markAnchorsDirty();
    syncFromEditor();
  };
}
