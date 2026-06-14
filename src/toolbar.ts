import {
  blockquote,
  bold,
  chart,
  codeBlock,
  footnote,
  formulaBlock,
  heading,
  highlight,
  horizontalRule,
  image,
  inlineCode,
  inlineFormula,
  italic,
  link,
  orderedList,
  strikethrough,
  table,
  taskList,
  underline,
  unorderedList,
} from "./commands";
import { exportPdf } from "./exportPdf";
import {
  newFile,
  openFile,
  openPathInCurrentWindow,
  openPathInNewWindow,
  saveAsFile,
  saveFile,
} from "./file";
import { redo, undo } from "./editor";
import { renameFile } from "./fileRenameController";
import {
  bindRecentFilesStorageSync,
  clearRecentFiles,
  loadRecentFiles,
  subscribeRecentFiles,
} from "./recentFiles";
import { setViewMode } from "./view";
import {
  normalizeLanguage,
  setLanguage,
  subscribeLanguage,
  t,
} from "./i18n";
import { getState, subscribe } from "./state";
import { TOOLBAR_OVERFLOW_ORDER } from "./toolbarOverflow";

const actions: Record<string, () => void | Promise<unknown>> = {
  new: newFile,
  open: openFile,
  save: saveFile,
  "save-as": saveAsFile,
  rename: renameFile,
  "export-pdf": exportPdf,
  undo,
  redo,
  h1: () => heading(1),
  h2: () => heading(2),
  h3: () => heading(3),
  bold,
  italic,
  underline,
  strikethrough,
  highlight,
  "unordered-list": unorderedList,
  "ordered-list": orderedList,
  "task-list": taskList,
  blockquote,
  "code-block": codeBlock,
  "formula-block": formulaBlock,
  chart,
  link,
  image,
  table,
  "horizontal-rule": horizontalRule,
  "inline-code": inlineCode,
  "inline-formula": inlineFormula,
  footnote,
};

let toolbarBound = false;
const submenuCloseTimers = new WeakMap<HTMLElement, number>();
const SUBMENU_CLOSE_DELAY = 240;

interface FormatGroupElements {
  primary: HTMLElement;
  panel: HTMLElement;
  trigger: HTMLButtonElement;
  buttons: HTMLButtonElement[];
}

function bindFormatOverflow(): () => void {
  const bar = document.querySelector<HTMLElement>(".format-bar");
  if (!bar) return () => {};

  const groups = Array.from(
    bar.querySelectorAll<HTMLElement>("[data-format-group]"),
  )
    .map<FormatGroupElements | null>((group) => {
      const primary = group.querySelector<HTMLElement>(".format-primary");
      const panel = group.querySelector<HTMLElement>(
        ".format-overflow-panel",
      );
      const trigger = group.querySelector<HTMLButtonElement>(
        ".format-overflow-trigger",
      );
      if (!primary || !panel || !trigger) return null;
      return {
        primary,
        panel,
        trigger,
        buttons: Array.from(
          primary.querySelectorAll<HTMLButtonElement>(
            ".format-command[data-command]",
          ),
        ),
      };
    })
    .filter((group): group is FormatGroupElements => group !== null);

  const groupByCommand = new Map<string, FormatGroupElements>();
  groups.forEach((group) => {
    group.buttons.forEach((button) => {
      const command = button.dataset.command;
      if (command) groupByCommand.set(command, group);
    });
  });

  const restoreButtons = (): void => {
    groups.forEach((group) => {
      group.buttons.forEach((button) => {
        button.querySelector(".format-menu-label")?.remove();
        button.removeAttribute("role");
        group.primary.append(button);
      });
      group.trigger.hidden = true;
      group.trigger.setAttribute("aria-expanded", "false");
      group.panel.hidden = true;
      group.panel.classList.remove("opens-left");
    });
    bar.classList.remove("is-compact");
  };

  const moveToOverflow = (command: string): void => {
    const group = groupByCommand.get(command);
    const button = group?.buttons.find(
      (item) => item.dataset.command === command,
    );
    if (!group || !button) return;

    const label = document.createElement("span");
    label.className = "format-menu-label";
    const translationKey = button.dataset.i18nTitle;
    label.textContent = translationKey ? t(translationKey) : button.title;
    button.append(label);
    button.setAttribute("role", "menuitem");
    group.panel.append(button);
    group.trigger.hidden = false;
  };

  const overflows = (): boolean => {
    const barBounds = bar.getBoundingClientRect();
    return Array.from(bar.children).some(
      (child) =>
        (child as HTMLElement).getBoundingClientRect().right >
        barBounds.right + 1,
    );
  };

  const update = (): void => {
    restoreButtons();
    if (!overflows()) return;

    bar.classList.add("is-compact");
    for (const command of TOOLBAR_OVERFLOW_ORDER) {
      if (!overflows()) break;
      moveToOverflow(command);
    }
  };

  let frame = 0;
  const scheduleUpdate = (): void => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(update);
  };

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(scheduleUpdate).observe(bar);
  } else {
    window.addEventListener("resize", scheduleUpdate);
  }
  scheduleUpdate();
  return scheduleUpdate;
}

function cancelSubmenuClose(submenu: HTMLElement): void {
  const timer = submenuCloseTimers.get(submenu);
  if (timer !== undefined) {
    window.clearTimeout(timer);
    submenuCloseTimers.delete(submenu);
  }
}

function cancelSubmenuCloseForTarget(target: Element): void {
  let submenu = target.closest<HTMLElement>(".submenu");
  while (submenu) {
    cancelSubmenuClose(submenu);
    submenu = submenu.parentElement?.closest<HTMLElement>(".submenu") ?? null;
  }
}

function scheduleSubmenuClose(submenu: HTMLElement): void {
  cancelSubmenuClose(submenu);
  const timer = window.setTimeout(() => {
    submenuCloseTimers.delete(submenu);
    closeSubmenuTree(submenu);
  }, SUBMENU_CLOSE_DELAY);
  submenuCloseTimers.set(submenu, timer);
}

function closeSubmenus(): void {
  document
    .querySelectorAll<HTMLElement>(".submenu")
    .forEach(cancelSubmenuClose);
  document.querySelectorAll<HTMLElement>(".submenu-panel").forEach((panel) => {
    panel.hidden = true;
    panel.classList.remove("opens-left");
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
  panel.classList.remove("opens-left");
  if (shouldOpen && panel.getBoundingClientRect().right > window.innerWidth - 8) {
    panel.classList.add("opens-left");
  }
  trigger.setAttribute("aria-expanded", String(shouldOpen));
}

function closeSubmenuTree(submenu: HTMLElement): void {
  cancelSubmenuClose(submenu);
  submenu
    .querySelectorAll<HTMLElement>(".submenu-panel")
    .forEach((panel) => {
      panel.hidden = true;
      panel.classList.remove("opens-left");
    });
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
    empty.textContent = t("recent.empty");
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

    const current = createMenuButton(t("recent.openCurrent"));
    current.dataset.recentAction = "current";
    current.dataset.path = path;
    const newWindow = createMenuButton(t("recent.openNew"));
    newWindow.dataset.recentAction = "new";
    newWindow.dataset.path = path;
    actions.append(current, newWindow);
    item.append(trigger, actions);
    menu.append(item);
  });

  const separator = document.createElement("div");
  separator.className = "menu-separator";
  separator.setAttribute("role", "separator");
  const clear = createMenuButton(t("recent.clear"));
  clear.dataset.recentAction = "clear";
  menu.append(separator, clear);
}

export function bindToolbar(): void {
  if (toolbarBound) return;
  toolbarBound = true;
  renderRecentFiles();
  subscribeRecentFiles(renderRecentFiles);
  bindRecentFilesStorageSync();

  const updateFileActions = () => {
    const renameButton = document.querySelector<HTMLButtonElement>(
      '[data-command="rename"]',
    );
    if (renameButton) renameButton.disabled = !getState().currentFilePath;
  };
  updateFileActions();
  subscribe(updateFileActions);

  const toolbar = document.querySelector<HTMLElement>("#toolbar");
  const updateFormatOverflow = bindFormatOverflow();
  subscribeLanguage(() => {
    renderRecentFiles();
    updateFormatOverflow();
  });

  const openHoveredSubmenu = (event: Event): void => {
    const target = event.target as Element;
    cancelSubmenuCloseForTarget(target);
    const trigger = target.closest<HTMLButtonElement>(
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
    scheduleSubmenuClose(submenu);
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

    const languageOption =
      target.closest<HTMLButtonElement>("[data-language]");
    if (languageOption) {
      setLanguage(normalizeLanguage(languageOption.dataset.language));
      closeMenus();
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
        openPathInNewWindow(path);
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
    if (
      !(event.target as Element).closest(
        ".dropdown, .format-overflow",
      )
    ) {
      closeMenus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenus();
    }
  });
}
