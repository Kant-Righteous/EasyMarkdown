import { invoke } from "@tauri-apps/api/core";
import { message } from "@tauri-apps/plugin-dialog";
import { getContent, onEditorInput } from "./editor";
import {
  detachDeletedFile,
  openPathInCurrentWindow,
  openPathInNewWindow,
} from "./file";
import { subscribeLanguage, t } from "./i18n";
import {
  getVisibleOutlineItems,
  parseOutline,
  type OutlineItem,
} from "./outline";
import {
  getOutlineNavigationSurface,
  getPreviewHeadingSelector,
} from "./outlineNavigation";
import { getRecentDeleteDecision } from "./recentDelete";
import {
  loadRecentFiles,
  removeRecentFile,
  subscribeRecentFiles,
} from "./recentFiles";
import {
  clampSidebarWidth,
  getSidebarWidthFromPointer,
  isSameSidebarFilePath,
  loadSidebarOpen,
  loadSidebarWidth,
  normalizeSidebarTab,
  saveSidebarOpen,
  saveSidebarWidth,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  type SidebarTab,
} from "./sidebarState";
import { getState, subscribe } from "./state";

const NEW_WINDOW_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"></path></svg>';
const DELETE_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-1 12H8L7 9Zm3 2 .5 8h1l-.5-8h-1Zm3 0-.5 8h1l.5-8h-1Z"></path></svg>';
const CHEVRON_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9 5 5 5-5 1.4 1.4L12 16.8l-6.4-6.4L7 9Z"></path></svg>';

let activeTab: SidebarTab = "files";
let outlineItems: OutlineItem[] = [];
let sidebarWidth = SIDEBAR_DEFAULT_WIDTH;
let renderedCurrentFilePath: string | null = null;
const collapsedOutlineIds = new Set<string>();

function fileName(path: string): string {
  return path.split(/[\\/]/).pop() || path;
}

function setButtonLabel(button: HTMLButtonElement, key: string): void {
  const label = t(key);
  button.title = label;
  button.setAttribute("aria-label", label);
}

function createIconButton(
  icon: string,
  labelKey: string,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "sidebar-icon-button";
  button.innerHTML = icon;
  setButtonLabel(button, labelKey);
  return button;
}

async function requestRecentDelete(path: string): Promise<void> {
  const recordLabel = t("sidebar.removeRecord");
  const fileLabel = t("sidebar.deleteFile");
  const result = await message(t("sidebar.deleteMessage", { path }), {
    title: t("sidebar.deleteTitle"),
    kind: "warning",
    buttons: {
      yes: recordLabel,
      no: fileLabel,
      cancel: t("sidebar.cancelDelete"),
    },
  });
  const decision = getRecentDeleteDecision(result, {
    record: recordLabel,
    file: fileLabel,
  });

  if (decision === "record") {
    removeRecentFile(path);
    return;
  }
  if (decision !== "file") return;

  try {
    await invoke("delete_file", { path });
    removeRecentFile(path);
    await detachDeletedFile(path);
  } catch (error) {
    await message(
      t("sidebar.deleteFailed", {
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        title: t("sidebar.deleteTitle"),
        kind: "error",
      },
    );
  }
}

function renderRecentFiles(paths: readonly string[] = loadRecentFiles()): void {
  const container = document.querySelector<HTMLElement>(
    "#sidebar-recent-files",
  );
  if (!container) return;
  const currentFilePath = getState().currentFilePath;
  renderedCurrentFilePath = currentFilePath;
  container.replaceChildren();

  if (paths.length === 0) {
    const empty = document.createElement("div");
    empty.className = "sidebar-empty";
    empty.textContent = t("recent.empty");
    container.append(empty);
    return;
  }

  paths.forEach((path) => {
    const item = document.createElement("div");
    item.className = "sidebar-file-item";
    item.dataset.filePath = path;
    const isCurrent = isSameSidebarFilePath(path, currentFilePath);
    item.classList.toggle("is-current", isCurrent);

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "sidebar-file-open";
    openButton.title = path;
    if (isCurrent) openButton.setAttribute("aria-current", "page");
    const name = document.createElement("span");
    name.className = "sidebar-file-name";
    name.textContent = fileName(path);
    const fullPath = document.createElement("span");
    fullPath.className = "sidebar-file-path";
    fullPath.textContent = path;
    openButton.append(name, fullPath);
    openButton.addEventListener("click", () => {
      void openPathInCurrentWindow(path, { removeOnFailure: true });
    });

    const actions = document.createElement("div");
    actions.className = "sidebar-file-actions";
    const newWindow = createIconButton(
      NEW_WINDOW_ICON,
      "sidebar.openNewWindow",
    );
    newWindow.addEventListener("click", () => openPathInNewWindow(path));
    const deleteButton = createIconButton(
      DELETE_ICON,
      "sidebar.deleteRecent",
    );
    deleteButton.addEventListener("click", () => {
      void requestRecentDelete(path);
    });
    actions.append(newWindow, deleteButton);
    item.append(openButton, actions);
    container.append(item);
  });
}

function navigateToOutlineItem(item: OutlineItem): void {
  if (getOutlineNavigationSurface(getState().viewMode) === "preview") {
    document
      .querySelector<HTMLElement>(getPreviewHeadingSelector(item))
      ?.scrollIntoView({
      block: "start",
      behavior: "auto",
    });
    return;
  }

  const editor = document.querySelector<HTMLTextAreaElement>("#editor");
  if (!editor) return;
  editor.focus();
  editor.setSelectionRange(item.offset, item.offset);
  const lineHeight =
    Number.parseFloat(window.getComputedStyle(editor).lineHeight) || 25;
  editor.scrollTop = Math.max(0, (item.line - 2) * lineHeight);
}

function renderOutline(): void {
  const container = document.querySelector<HTMLElement>("#sidebar-outline");
  if (!container) return;
  outlineItems = parseOutline(getContent());
  const validIds = new Set(outlineItems.map((item) => item.id));
  collapsedOutlineIds.forEach((id) => {
    if (!validIds.has(id)) collapsedOutlineIds.delete(id);
  });
  container.replaceChildren();

  if (outlineItems.length === 0) {
    const empty = document.createElement("div");
    empty.className = "sidebar-empty";
    empty.textContent = t("sidebar.outlineEmpty");
    container.append(empty);
    return;
  }

  getVisibleOutlineItems(outlineItems, collapsedOutlineIds).forEach((item) => {
    const row = document.createElement("div");
    row.className = "outline-item";
    row.style.setProperty("--outline-level", String(item.level));

    if (item.hasChildren) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "outline-toggle";
      toggle.innerHTML = CHEVRON_ICON;
      const expanded = !collapsedOutlineIds.has(item.id);
      toggle.setAttribute("aria-expanded", String(expanded));
      setButtonLabel(toggle, expanded ? "sidebar.collapse" : "sidebar.expand");
      toggle.addEventListener("click", () => {
        if (collapsedOutlineIds.has(item.id)) {
          collapsedOutlineIds.delete(item.id);
        } else {
          collapsedOutlineIds.add(item.id);
        }
        renderOutline();
      });
      row.append(toggle);
    } else {
      const spacer = document.createElement("span");
      spacer.className = "outline-spacer";
      spacer.setAttribute("aria-hidden", "true");
      row.append(spacer);
    }

    const link = document.createElement("button");
    link.type = "button";
    link.className = "outline-link";
    link.textContent = item.text;
    link.title = item.text;
    link.addEventListener("click", () => navigateToOutlineItem(item));
    row.append(link);
    container.append(row);
  });
}

function setActiveTab(tab: SidebarTab): void {
  activeTab = tab;
  document
    .querySelectorAll<HTMLButtonElement>("[data-sidebar-tab]")
    .forEach((button) => {
      const selected = button.dataset.sidebarTab === tab;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  const filesPanel = document.querySelector<HTMLElement>(
    "#sidebar-files-panel",
  );
  const outlinePanel = document.querySelector<HTMLElement>(
    "#sidebar-outline-panel",
  );
  if (filesPanel) filesPanel.hidden = tab !== "files";
  if (outlinePanel) outlinePanel.hidden = tab !== "outline";
  if (tab === "outline") renderOutline();
}

function setSidebarOpen(open: boolean): void {
  const shell = document.querySelector<HTMLElement>("#workspace-shell");
  const sidebar = document.querySelector<HTMLElement>("#sidebar");
  const toggle = document.querySelector<HTMLButtonElement>("#sidebar-toggle");
  shell?.classList.toggle("sidebar-closed", !open);
  if (sidebar) {
    sidebar.setAttribute("aria-hidden", String(!open));
    sidebar.toggleAttribute("inert", !open);
  }
  toggle?.setAttribute("aria-expanded", String(open));
  saveSidebarOpen(open);
}

function bindSidebarResize(): void {
  const shell = document.querySelector<HTMLElement>("#workspace-shell");
  const resizer = document.querySelector<HTMLElement>("#sidebar-resizer");
  if (!shell || !resizer) return;

  const applyWidth = (width: number): void => {
    const clampedWidth = clampSidebarWidth(width, window.innerWidth);
    shell.style.setProperty("--sidebar-width", `${clampedWidth}px`);
    resizer.setAttribute("aria-valuemin", String(SIDEBAR_MIN_WIDTH));
    resizer.setAttribute(
      "aria-valuemax",
      String(clampSidebarWidth(SIDEBAR_MAX_WIDTH, window.innerWidth)),
    );
    resizer.setAttribute("aria-valuenow", String(clampedWidth));
  };

  sidebarWidth = loadSidebarWidth(undefined, window.innerWidth);
  applyWidth(sidebarWidth);

  resizer.addEventListener("pointerdown", (event) => {
    if (
      (event.pointerType === "mouse" && event.button !== 0) ||
      window.matchMedia("(max-width: 860px)").matches
    ) {
      return;
    }

    event.preventDefault();
    resizer.setPointerCapture(event.pointerId);
    shell.classList.add("is-resizing");

    const updateWidth = (pointerEvent: PointerEvent): void => {
      sidebarWidth = getSidebarWidthFromPointer(
        pointerEvent.clientX,
        shell.getBoundingClientRect().left,
        window.innerWidth,
      );
      applyWidth(sidebarWidth);
    };
    const finishResize = (pointerEvent: PointerEvent): void => {
      if (resizer.hasPointerCapture(pointerEvent.pointerId)) {
        resizer.releasePointerCapture(pointerEvent.pointerId);
      }
      resizer.removeEventListener("pointermove", updateWidth);
      resizer.removeEventListener("pointerup", finishResize);
      resizer.removeEventListener("pointercancel", finishResize);
      shell.classList.remove("is-resizing");
      saveSidebarWidth(sidebarWidth);
    };

    updateWidth(event);
    resizer.addEventListener("pointermove", updateWidth);
    resizer.addEventListener("pointerup", finishResize);
    resizer.addEventListener("pointercancel", finishResize);
  });

  resizer.addEventListener("keydown", (event) => {
    const step = event.shiftKey ? 40 : 12;
    let nextWidth: number | null = null;
    if (event.key === "ArrowLeft") nextWidth = sidebarWidth - step;
    if (event.key === "ArrowRight") nextWidth = sidebarWidth + step;
    if (event.key === "Home") nextWidth = SIDEBAR_MIN_WIDTH;
    if (event.key === "End") nextWidth = SIDEBAR_MAX_WIDTH;
    if (nextWidth === null) return;

    event.preventDefault();
    sidebarWidth = clampSidebarWidth(nextWidth, window.innerWidth);
    applyWidth(sidebarWidth);
    saveSidebarWidth(sidebarWidth);
  });

  window.addEventListener("resize", () => applyWidth(sidebarWidth));
}

export function bindSidebar(): { refreshOutline: () => void } {
  renderRecentFiles();
  renderOutline();
  setActiveTab(activeTab);
  bindSidebarResize();
  setSidebarOpen(loadSidebarOpen());

  subscribeRecentFiles(renderRecentFiles);
  subscribe((state) => {
    if (!isSameSidebarFilePath(state.currentFilePath, renderedCurrentFilePath)) {
      renderRecentFiles();
    }
  });
  subscribeLanguage(() => {
    renderRecentFiles();
    renderOutline();
  });
  onEditorInput(renderOutline);

  document
    .querySelector<HTMLButtonElement>("#sidebar-toggle")
    ?.addEventListener("click", (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      setSidebarOpen(button.getAttribute("aria-expanded") !== "true");
    });

  document
    .querySelector<HTMLElement>(".sidebar-tabs")
    ?.addEventListener("click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(
        "[data-sidebar-tab]",
      );
      if (!button) return;
      setActiveTab(normalizeSidebarTab(button.dataset.sidebarTab));
    });
  document
    .querySelector<HTMLElement>(".sidebar-tabs")
    ?.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const nextTab: SidebarTab =
        activeTab === "files" ? "outline" : "files";
      setActiveTab(nextTab);
      document
        .querySelector<HTMLButtonElement>(
          `[data-sidebar-tab="${nextTab}"]`,
        )
        ?.focus();
    });

  return { refreshOutline: renderOutline };
}
