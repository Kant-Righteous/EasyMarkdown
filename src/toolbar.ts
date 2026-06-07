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
import { redo, undo } from "./editor";
import { setViewMode } from "./view";

const actions: Record<string, () => void | Promise<unknown>> = {
  new: newFile,
  open: openFile,
  save: saveFile,
  "save-as": saveAsFile,
  "export-pdf": exportPdf,
  undo,
  redo,
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

let toolbarBound = false;

function closeMenus(): void {
  document.querySelectorAll<HTMLElement>("[data-menu]").forEach((menu) => {
    menu.hidden = true;
  });
  document
    .querySelectorAll<HTMLButtonElement>("[data-menu-trigger]")
    .forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
}

function toggleMenu(trigger: HTMLButtonElement): void {
  const menuName = trigger.dataset.menuTrigger;
  const menu = document.querySelector<HTMLElement>(`[data-menu="${menuName}"]`);
  const shouldOpen = menu?.hidden ?? false;

  closeMenus();
  if (!menu || !shouldOpen) return;

  menu.hidden = false;
  trigger.setAttribute("aria-expanded", "true");
}

export function bindToolbar(): void {
  if (toolbarBound) return;
  toolbarBound = true;

  document.querySelector("#toolbar")?.addEventListener("click", (event) => {
    const target = event.target as Element;
    const trigger = target.closest<HTMLButtonElement>("[data-menu-trigger]");
    if (trigger) {
      toggleMenu(trigger);
      return;
    }

    const button = (event.target as Element).closest<HTMLButtonElement>(
      "button[data-command], button[data-view]",
    );
    if (!button) return;

    const command = button.dataset.command;
    const view = button.dataset.view;

    if (command && actions[command]) {
      closeMenus();
      void actions[command]();
    }

    if (view === "edit" || view === "preview" || view === "split") {
      setViewMode(view);
    }
  });

  document.addEventListener("click", (event) => {
    if (!(event.target as Element).closest(".dropdown")) {
      closeMenus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenus();
    }
  });
}
