import { getContent, onEditorInput } from "../shared/editor";
import { subscribeLanguage, t } from "../shared/i18n/i18n";
import {
  getVisibleOutlineItems,
  parseOutline,
  type OutlineItem,
} from "../shared/markdown/outline";
import {
  getOutlineNavigationSurface,
  getPreviewHeadingSelector,
} from "../shared/markdown/outlineNavigation";
import { isSameSidebarFilePath } from "../shared/state/sidebarState";
import { getState, subscribe } from "../shared/state/state";
import {
  bindRecentFilesStorageSync,
  loadRecentFiles,
  subscribeRecentFiles,
} from "../shared/utils/recentFiles";

const CHEVRON_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9 5 5 5-5"></path></svg>';

interface MobileSidebarOptions {
  openPath: (path: string) => Promise<boolean>;
  closeDrawer: () => void;
}

let sidebarBound = false;
let storageSyncBound = false;
let outlineItems: OutlineItem[] = [];
const collapsedOutlineIds = new Set<string>();

function fileName(path: string): string {
  const name = path.split(/[\\/]/).pop() || path;
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

function renderRecentFiles(paths: readonly string[] = loadRecentFiles()): void {
  const container = document.querySelector<HTMLElement>("#mobile-recent-files");
  if (!container) return;

  container.replaceChildren();
  if (paths.length === 0) {
    const empty = document.createElement("div");
    empty.className = "mobile-drawer-empty";
    empty.textContent = t("recent.empty");
    container.append(empty);
    return;
  }

  const currentFilePath = getState().currentFilePath;
  paths.forEach((path) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mobile-drawer-item mobile-recent-file";
    button.dataset.mobileRecentPath = path;
    button.title = path;
    button.classList.toggle(
      "is-current",
      isSameSidebarFilePath(path, currentFilePath),
    );

    const name = document.createElement("span");
    name.className = "mobile-recent-name";
    name.textContent = fileName(path);
    const fullPath = document.createElement("span");
    fullPath.className = "mobile-recent-path";
    fullPath.textContent = path;
    button.append(name, fullPath);
    container.append(button);
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
  const container = document.querySelector<HTMLElement>("#mobile-outline");
  if (!container) return;

  outlineItems = parseOutline(getContent());
  const validIds = new Set(outlineItems.map((item) => item.id));
  collapsedOutlineIds.forEach((id) => {
    if (!validIds.has(id)) collapsedOutlineIds.delete(id);
  });

  container.replaceChildren();
  if (outlineItems.length === 0) {
    const empty = document.createElement("div");
    empty.className = "mobile-drawer-empty";
    empty.textContent = t("sidebar.outlineEmpty");
    container.append(empty);
    return;
  }

  getVisibleOutlineItems(outlineItems, collapsedOutlineIds).forEach((item) => {
    const row = document.createElement("div");
    row.className = "mobile-drawer-item mobile-outline-item";
    row.style.setProperty("--outline-indent", `${(item.level - 1) * 14}px`);

    if (item.hasChildren) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "mobile-outline-toggle";
      toggle.innerHTML = CHEVRON_ICON;
      toggle.dataset.mobileOutlineToggle = item.id;
      const expanded = !collapsedOutlineIds.has(item.id);
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.setAttribute(
        "aria-label",
        t(expanded ? "sidebar.collapse" : "sidebar.expand"),
      );
      row.append(toggle);
    } else {
      const spacer = document.createElement("span");
      spacer.className = "mobile-outline-spacer";
      spacer.setAttribute("aria-hidden", "true");
      row.append(spacer);
    }

    const link = document.createElement("button");
    link.type = "button";
    link.className = "mobile-outline-link";
    link.dataset.mobileOutlineLink = item.id;
    link.title = item.text;
    const text = document.createElement("span");
    text.className = "mobile-outline-text";
    text.textContent = item.text;
    link.append(text);
    row.append(link);
    container.append(row);
  });
}

export function bindMobileSidebar(
  options: MobileSidebarOptions,
): { refreshOutline: () => void; refreshRecentFiles: () => void } {
  renderRecentFiles();
  renderOutline();

  if (!storageSyncBound) {
    bindRecentFilesStorageSync();
    storageSyncBound = true;
  }

  if (!sidebarBound) {
    sidebarBound = true;
    subscribeRecentFiles(renderRecentFiles);
    subscribe(() => renderRecentFiles());
    subscribeLanguage(() => {
      renderRecentFiles();
      renderOutline();
    });
    onEditorInput(renderOutline);
  }

  document
    .querySelector<HTMLElement>("#mobile-recent-files")
    ?.addEventListener("click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(
        "[data-mobile-recent-path]",
      );
      const path = button?.dataset.mobileRecentPath;
      if (!path) return;
      void options.openPath(path).then((opened) => {
        if (opened) options.closeDrawer();
      });
    });

  document
    .querySelector<HTMLElement>("#mobile-outline")
    ?.addEventListener("click", (event) => {
      const target = event.target as Element;
      const toggle = target.closest<HTMLButtonElement>(
        "[data-mobile-outline-toggle]",
      );
      if (toggle) {
        const id = toggle.dataset.mobileOutlineToggle;
        if (!id) return;
        if (collapsedOutlineIds.has(id)) {
          collapsedOutlineIds.delete(id);
        } else {
          collapsedOutlineIds.add(id);
        }
        renderOutline();
        return;
      }

      const link = target.closest<HTMLButtonElement>(
        "[data-mobile-outline-link]",
      );
      const id = link?.dataset.mobileOutlineLink;
      const item = outlineItems.find((candidate) => candidate.id === id);
      if (!item) return;
      navigateToOutlineItem(item);
      options.closeDrawer();
    });

  return {
    refreshOutline: renderOutline,
    refreshRecentFiles: renderRecentFiles,
  };
}
