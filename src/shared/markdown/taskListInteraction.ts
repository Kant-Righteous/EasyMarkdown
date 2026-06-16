const TASK_MARKER = /^(\s*(?:[-+*]|\d+[.)])\s+\[)[ xX](\])/;

export function toggleTaskAtSourceLine(
  markdown: string,
  sourceLine: number,
  checked: boolean,
): string {
  if (!Number.isInteger(sourceLine) || sourceLine < 0) return markdown;

  const parts = markdown.split(/(\r\n|\n|\r)/);
  const lineIndex = sourceLine * 2;
  if (lineIndex >= parts.length) return markdown;

  const line = parts[lineIndex];
  const replacement = checked ? "x" : " ";
  const updatedLine = line.replace(TASK_MARKER, `$1${replacement}$2`);
  if (updatedLine === line) return markdown;

  parts[lineIndex] = updatedLine;
  return parts.join("");
}

export function bindTaskListInteraction(
  preview: HTMLElement,
  getMarkdown: () => string,
  setMarkdown: (markdown: string) => void,
): () => void {
  const handleChange = (event: Event): void => {
    const target = event.target;
    if (
      !(target instanceof HTMLInputElement) ||
      !target.classList.contains("task-list-item-checkbox")
    ) {
      return;
    }

    const taskItem = target.closest<HTMLElement>(
      ".task-list-item[data-source-line]",
    );
    const sourceLine = Number(taskItem?.dataset.sourceLine);
    if (!Number.isInteger(sourceLine)) {
      target.checked = !target.checked;
      return;
    }

    const markdown = getMarkdown();
    const updated = toggleTaskAtSourceLine(
      markdown,
      sourceLine,
      target.checked,
    );
    if (updated === markdown) {
      target.checked = !target.checked;
      return;
    }

    setMarkdown(updated);
  };

  preview.addEventListener("change", handleChange);
  return () => preview.removeEventListener("change", handleChange);
}
