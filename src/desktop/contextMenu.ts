import { invoke } from "@tauri-apps/api/core";
import { getSelection, replaceSelection, undo } from "../shared/editor";
import { exportPdf } from "./exportPdf";
import { saveAsFile } from "./file";
import { renameFile } from "./fileRenameController";
import { t } from "../shared/i18n/i18n";
import { getState } from "../shared/state/state";

interface ContextMenuItem {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  separatorBefore?: boolean;
  run: () => void | Promise<unknown>;
}

function editorElement(): HTMLTextAreaElement | null {
  return document.querySelector<HTMLTextAreaElement>("#editor");
}

async function copySelection(cut: boolean): Promise<void> {
  const editor = editorElement();
  if (!editor) return;
  editor.focus();
  const selectedText = getSelection().text;
  if (!selectedText) return;
  await navigator.clipboard.writeText(selectedText);
  if (cut) replaceSelection("");
}

async function pasteClipboard(): Promise<void> {
  replaceSelection(await navigator.clipboard.readText());
}

function editorItems(): ContextMenuItem[] {
  const hasSelection = getSelection().text.length > 0;
  return [
    {
      label: t("context.emoji"),
      shortcut: "Win+.",
      run: () => invoke("open_emoji_picker"),
    },
    {
      label: t("context.undo"),
      shortcut: "Ctrl+Z",
      separatorBefore: true,
      run: undo,
    },
    {
      label: t("context.cut"),
      shortcut: "Ctrl+X",
      disabled: !hasSelection,
      run: () => copySelection(true),
    },
    {
      label: t("context.copy"),
      shortcut: "Ctrl+C",
      disabled: !hasSelection,
      run: () => copySelection(false),
    },
    {
      label: t("context.paste"),
      shortcut: "Ctrl+V",
      run: pasteClipboard,
    },
    {
      label: t("context.pastePlain"),
      shortcut: "Ctrl+Shift+V",
      run: pasteClipboard,
    },
    {
      label: t("context.selectAll"),
      shortcut: "Ctrl+A",
      run: () => editorElement()?.select(),
    },
    {
      label: t("context.inspect"),
      separatorBefore: true,
      run: () => invoke("open_devtools"),
    },
  ];
}

function generalItems(targetPath: string | null): ContextMenuItem[] {
  return [
    {
      label: t("context.refresh"),
      shortcut: "Ctrl+R",
      run: () => window.location.reload(),
    },
    {
      label: t("context.saveAs"),
      separatorBefore: true,
      run: saveAsFile,
    },
    {
      label: t("context.print"),
      shortcut: "Ctrl+P",
      run: exportPdf,
    },
    {
      label: t("context.rename"),
      disabled: !targetPath,
      run: () => renameFile(targetPath),
    },
    {
      label: t("context.inspect"),
      separatorBefore: true,
      run: () => invoke("open_devtools"),
    },
  ];
}

function positionMenu(menu: HTMLElement, clientX: number, clientY: number): void {
  const margin = 8;
  const bounds = menu.getBoundingClientRect();
  menu.style.left = `${Math.max(margin, Math.min(clientX, window.innerWidth - bounds.width - margin))}px`;
  menu.style.top = `${Math.max(margin, Math.min(clientY, window.innerHeight - bounds.height - margin))}px`;
}

export function bindContextMenu(): void {
  const menu = document.querySelector<HTMLElement>("#context-menu");
  if (!menu) return;

  const close = () => {
    menu.hidden = true;
    menu.replaceChildren();
  };

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    close();

    const target = event.target as Element;
    const isEditor = Boolean(target.closest("#editor"));
    const sidebarItem = target.closest<HTMLElement>("[data-file-path]");
    const targetPath = sidebarItem?.dataset.filePath ?? getState().currentFilePath;
    const items = isEditor ? editorItems() : generalItems(targetPath);

    items.forEach((item) => {
      if (item.separatorBefore) {
        const separator = document.createElement("div");
        separator.className = "context-menu-separator";
        separator.setAttribute("role", "separator");
        menu.append(separator);
      }
      const button = document.createElement("button");
      button.type = "button";
      button.disabled = item.disabled ?? false;
      button.setAttribute("role", "menuitem");
      const label = document.createElement("span");
      label.textContent = item.label;
      button.append(label);
      if (item.shortcut) {
        const shortcut = document.createElement("span");
        shortcut.className = "context-menu-shortcut";
        shortcut.textContent = item.shortcut;
        button.append(shortcut);
      }
      button.addEventListener("click", () => {
        close();
        void item.run();
      });
      menu.append(button);
    });

    menu.hidden = false;
    positionMenu(menu, event.clientX, event.clientY);
    menu.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  });

  document.addEventListener("pointerdown", (event) => {
    if (!menu.hidden && !(event.target as Element).closest("#context-menu")) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
  window.addEventListener("blur", close);
  window.addEventListener("resize", close);
  document.addEventListener("scroll", close, true);
}
