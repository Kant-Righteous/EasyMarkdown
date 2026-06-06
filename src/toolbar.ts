import {
  blockquote,
  bold,
  codeBlock,
  heading,
  horizontalRule,
  italic,
  link,
  orderedList,
  table,
  unorderedList,
} from "./commands";
import { exportPdf } from "./exportPdf";
import { newFile, openFile, saveAsFile, saveFile } from "./file";
import { setViewMode } from "./view";

const actions: Record<string, () => void | Promise<unknown>> = {
  new: newFile,
  open: openFile,
  save: saveFile,
  "save-as": saveAsFile,
  "export-pdf": exportPdf,
  h1: () => heading(1),
  h2: () => heading(2),
  h3: () => heading(3),
  bold,
  italic,
  "unordered-list": unorderedList,
  "ordered-list": orderedList,
  blockquote,
  "code-block": codeBlock,
  link,
  table,
  "horizontal-rule": horizontalRule,
};

export function bindToolbar(): void {
  document.querySelector("#toolbar")?.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      "button[data-command], button[data-view]",
    );
    if (!button) return;

    const command = button.dataset.command;
    const view = button.dataset.view;

    if (command && actions[command]) {
      void actions[command]();
    }

    if (view === "edit" || view === "preview" || view === "split") {
      setViewMode(view);
    }
  });
}
