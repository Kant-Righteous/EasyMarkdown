import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
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
import {
  newFile,
  openFile,
  openPathInCurrentWindow,
  saveAsFile,
  saveFile,
} from "./file";
import { redo, undo } from "./editor";
import { buildOpenFileUrl, createRecentWindowLabel } from "./openFlow";
import {
  bindRecentFilesStorageSync,
  clearRecentFiles,
  loadRecentFiles,
  subscribeRecentFiles,
} from "./recentFiles";
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

function closeSubmenus(): void {
  document.querySelectorAll<HTMLElement>(".submenu-panel").forEach((panel) => {
    panel.hidden = true;
  });
  document
    .querySelectorAll<HTMLButtonElement>(".submenu-trigger")
    .forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
}

function closeMenus(): void {
  document.querySelectorAll<HTMLElement>("[data-menu]").forEach((menu) => {
    menu.hidden = true;
  });
  document
    .querySelectorAll<HTMLButtonElement>("[data-menu-trigger]")
    .forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
  closeSubmenus();
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

function setSubmenuOpen(
  trigger: HTMLButtonElement,
  shouldOpen: boolean,
): void {
  const panel = trigger.nextElementSibling as HTMLElement | null;
  if (!panel?.classList.contains("submenu-panel")) return;
  if (panel.classList.contains("recent-files-panel")) {
    if (shouldOpen) closeSubmenus();
  } else {
    document
      .querySelectorAll<HTMLElement>(".recent-action-panel")
      .forEach((item) => (item.hidden = true));
    document
      .querySelectorAll<HTMLButtonElement>(
        ".recent-files-panel .submenu-trigger",
      )
      .forEach((item) => item.setAttribute("aria-expanded", "false"));
  }

  panel.hidden = !shouldOpen;
  trigger.setAttribute("aria-expanded", String(shouldOpen));
}

function closeSubmenuTree(submenu: HTMLElement): void {
  submenu
    .querySelectorAll<HTMLElement>(".submenu-panel")
    .forEach((panel) => (panel.hidden = true));
  submenu
    .querySelectorAll<HTMLButtonElement>(".submenu-trigger")
    .forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
}

function createMenuButton(text: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.setAttribute("role", "menuitem");
  return button;
}

function renderRecentFiles(
  paths: readonly string[] = loadRecentFiles(),
): void {
  const menu = document.querySelector<HTMLElement>("#recent-files-menu");
  if (!menu) return;
  menu.replaceChildren();

  if (paths.length === 0) {
    const empty = document.createElement("div");
    empty.className = "menu-empty";
    empty.textContent = "暂无最近文件";
    menu.append(empty);
    return;
  }

  paths.forEach((path) => {
    const item = document.createElement("div");
    item.className = "submenu";

    const trigger = createMenuButton("");
    trigger.className = "submenu-trigger";
    trigger.title = path;
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");

    const name = document.createElement("span");
    name.className = "recent-file-name";
    name.textContent = path.split(/[\\/]/).pop() || path;
    const arrow = document.createElement("span");
    arrow.className = "submenu-arrow";
    arrow.textContent = "›";
    arrow.setAttribute("aria-hidden", "true");
    trigger.append(name, arrow);

    const actions = document.createElement("div");
    actions.className = "dropdown-panel submenu-panel recent-action-panel";
    actions.setAttribute("role", "menu");
    actions.hidden = true;

    const current = createMenuButton("在当前窗口打开");
    current.dataset.recentAction = "current";
    current.dataset.path = path;
    const newWindow = createMenuButton("在新窗口打开");
    newWindow.dataset.recentAction = "new";
    newWindow.dataset.path = path;
    actions.append(current, newWindow);
    item.append(trigger, actions);
    menu.append(item);
  });

  const separator = document.createElement("div");
  separator.className = "menu-separator";
  separator.setAttribute("role", "separator");
  const clear = createMenuButton("清空最近记录");
  clear.dataset.recentAction = "clear";
  menu.append(separator, clear);
}

function openInNewWindow(path: string): void {
  const windowLabel = createRecentWindowLabel();
  const webview = new WebviewWindow(windowLabel, {
    url: buildOpenFileUrl(path),
    title: `${path.split(/[\\/]/).pop() || path} - EasyMarkdown`,
    width: 1200,
    height: 760,
    minWidth: 760,
    minHeight: 500,
  });
  void webview.once("tauri://error", (event) => {
    window.alert(`创建新窗口失败：${String(event.payload)}`);
  });
}

export function bindToolbar(): void {
  if (toolbarBound) return;
  toolbarBound = true;
  renderRecentFiles();
  subscribeRecentFiles(renderRecentFiles);
  bindRecentFilesStorageSync();

  const toolbar = document.querySelector<HTMLElement>("#toolbar");

  const openHoveredSubmenu = (event: Event): void => {
    const trigger = (event.target as Element).closest<HTMLButtonElement>(
      ".submenu-trigger",
    );
    if (trigger) setSubmenuOpen(trigger, true);
  };

  toolbar?.addEventListener("pointerover", openHoveredSubmenu);
  toolbar?.addEventListener("focusin", openHoveredSubmenu);

  toolbar?.addEventListener("pointerout", (event) => {
    const submenu = (event.target as Element).closest<HTMLElement>(".submenu");
    const nextTarget = event.relatedTarget as Node | null;
    if (!submenu || (nextTarget && submenu.contains(nextTarget))) return;
    closeSubmenuTree(submenu);
  });

  toolbar?.addEventListener("focusout", (event) => {
    const submenu = (event.target as Element).closest<HTMLElement>(".submenu");
    const nextTarget = event.relatedTarget as Node | null;
    if (!submenu || (nextTarget && submenu.contains(nextTarget))) return;
    closeSubmenuTree(submenu);
  });

  toolbar?.addEventListener("click", (event) => {
    const target = event.target as Element;
    const trigger = target.closest<HTMLButtonElement>("[data-menu-trigger]");
    if (trigger) {
      toggleMenu(trigger);
      return;
    }

    const submenuTrigger =
      target.closest<HTMLButtonElement>(".submenu-trigger");
    if (submenuTrigger) {
      setSubmenuOpen(submenuTrigger, true);
      return;
    }

    const recentAction =
      target.closest<HTMLButtonElement>("[data-recent-action]");
    if (recentAction) {
      const action = recentAction.dataset.recentAction;
      const path = recentAction.dataset.path;
      closeMenus();

      if (action === "clear") {
        clearRecentFiles();
      } else if (action === "current" && path) {
        void openPathInCurrentWindow(path, { removeOnFailure: true });
      } else if (action === "new" && path) {
        openInNewWindow(path);
      }
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
