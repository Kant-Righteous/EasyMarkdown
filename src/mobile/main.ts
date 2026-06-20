import "./style.css";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { message, open, save } from "@tauri-apps/plugin-dialog";
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
} from "../shared/commands";
import {
  getContent,
  insertAtCursor,
  onEditorInput,
  redo,
  setContent,
  setContentPreservingView,
  undo,
} from "../shared/editor";
import { initI18n, t } from "../shared/i18n/i18n";
import { renderMarkdown } from "../shared/markdown/markdown";
import { renderMermaidDiagrams } from "../shared/markdown/mermaid";
import {
  bindPreviewBlockCopy,
  decoratePreviewCopyBlocks,
} from "../shared/markdown/previewBlockCopy";
import { bindTaskListInteraction } from "../shared/markdown/taskListInteraction";
import {
  getState,
  setState,
  subscribe,
  updateDirtyState,
  type ViewMode,
} from "../shared/state/state";
import { confirmUnsavedTransition } from "../shared/utils/fileTransition";
import { getRenameValidationError } from "../shared/utils/fileRename";
import {
  addRecentFile,
  removeRecentFile,
  replaceRecentFile,
} from "../shared/utils/recentFiles";
import {
  createSaveQueue,
  getSaveAsDefaultPath,
  performSave,
  type WriteConfirmation,
} from "../shared/utils/saveFlow";
import { bindPreviewLinks } from "./previewLinks";
import { bindMobileSidebar } from "./sidebar";
import { bindSplitScrollSync } from "./scrollSync";

const markdownFilters = [
  {
    name: "Markdown / Text",
    extensions: ["md", "markdown", "txt", "text/markdown", "text/plain"],
  },
];

const pdfFilters = [
  {
    name: "PDF",
    extensions: ["pdf", "application/pdf"],
  },
];

const enqueueSave = createSaveQueue();

function fileNameFromPath(path: string): string {
  const rawName = path.split(/[\\/]/).pop() || t("file.untitled");
  try {
    return decodeURIComponent(rawName);
  } catch {
    return rawName;
  }
}

function baseNameWithoutExtension(name: string): string {
  return name.replace(/\.[^.]+$/, "") || "EasyMarkdown";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function showError(action: string, error: unknown): Promise<void> {
  const text = t("file.actionFailed", {
    action,
    message: errorMessage(error),
  });
  if (isTauri()) {
    await message(text, { title: action, kind: "error" });
    return;
  }
  window.alert(text);
}

async function showInfo(text: string): Promise<void> {
  if (isTauri()) {
    await message(text, { title: "EasyMarkdown" });
    return;
  }
  window.alert(text);
}

async function prepareForFileTransition(): Promise<boolean> {
  return confirmUnsavedTransition({
    isDirty: getState().isDirty,
    prompt: async () => {
      if (!isTauri()) {
        return window.confirm(t("file.discardConfirm")) ? "discard" : "cancel";
      }
      const saveLabel = t("file.saveChanges");
      const discardLabel = t("file.discardChanges");
      const result = await message(t("file.unsavedMessage"), {
        title: t("file.unsavedTitle"),
        kind: "warning",
        buttons: {
          yes: saveLabel,
          no: discardLabel,
          cancel: t("file.cancelChanges"),
        },
      });
      if (result === saveLabel) return "save";
      if (result === discardLabel) return "discard";
      return "cancel";
    },
    save: saveFile,
  });
}

async function loadFile(path: string): Promise<void> {
  const content = await invoke<string>("read_file", { path });
  setContent(content);
  setState({
    currentFilePath: path,
    currentFileName: fileNameFromPath(path),
    isDirty: false,
    lastSavedContent: content,
  });
  addRecentFile(path);
  updatePreview();
}

async function openPathInCurrentWindow(
  path: string,
  options: { confirmUnsaved?: boolean; removeOnFailure?: boolean } = {},
): Promise<boolean> {
  const { confirmUnsaved = true, removeOnFailure = false } = options;
  if (confirmUnsaved && !(await prepareForFileTransition())) return false;

  try {
    await loadFile(path);
    return true;
  } catch (error) {
    if (removeOnFailure) removeRecentFile(path);
    await showError(t("file.openAction"), error);
    return false;
  }
}

async function newFile(): Promise<void> {
  if (!(await prepareForFileTransition())) return;
  setContent("");
  setState({
    currentFileName: t("file.untitled"),
    currentFilePath: null,
    isDirty: false,
    lastSavedContent: "",
  });
  updatePreview();
}

async function openFile(): Promise<void> {
  if (!(await prepareForFileTransition())) return;
  try {
    const path = await open({
      multiple: false,
      directory: false,
      pickerMode: "document",
      fileAccessMode: "scoped",
      filters: markdownFilters,
    });
    if (!path) return;
    await openPathInCurrentWindow(path, { confirmUnsaved: false });
  } catch (error) {
    await showError(t("file.openAction"), error);
  }
}

async function runSave(forceSaveAs: boolean): Promise<boolean> {
  const state = getState();
  const outcome = await performSave({
    path: forceSaveAs ? null : state.currentFilePath,
    selectPath: () =>
      save({
        defaultPath: getSaveAsDefaultPath(
          state.currentFilePath,
          state.currentFileName,
          t("file.untitled"),
        ),
        filters: markdownFilters,
      }),
    readContent: getContent,
    write: (path, content) =>
      invoke<WriteConfirmation>("write_file", { path, content }),
  });

  if (outcome.status === "cancelled") return false;
  if (outcome.status === "failed") {
    await showError(t("file.saveAction"), outcome.error);
    return false;
  }

  setState({
    currentFilePath: outcome.path,
    currentFileName: fileNameFromPath(outcome.path),
    isDirty: false,
    lastSavedContent: outcome.content,
  });
  addRecentFile(outcome.path);
  return true;
}

function saveFile(): Promise<boolean> {
  return enqueueSave(() => runSave(false));
}

function saveAsFile(): Promise<boolean> {
  return enqueueSave(() => runSave(true));
}

async function renameCurrentFile(): Promise<void> {
  const path = getState().currentFilePath;
  if (!path) {
    await showInfo("请先保存文件，再重命名。");
    return;
  }

  const currentName = fileNameFromPath(path);
  const newName = window.prompt(t("rename.name"), currentName);
  if (!newName || newName === currentName) return;

  const validationError = getRenameValidationError(newName);
  if (validationError) {
    await showInfo(t(`rename.${validationError}`));
    return;
  }

  try {
    const newPath = await invoke<string>("rename_file", {
      path,
      newName: newName.trim(),
    });
    replaceRecentFile(path, newPath);
    setState({
      currentFilePath: newPath,
      currentFileName: fileNameFromPath(newPath),
    });
  } catch (error) {
    await showError(t("rename.title"), error);
  }
}

async function exportPdf(): Promise<void> {
  try {
    const state = getState();
    const path = await save({
      defaultPath: `${baseNameWithoutExtension(state.currentFileName)}.pdf`,
      filters: pdfFilters,
    });
    if (!path) return;
    await invoke("export_markdown_pdf", {
      path,
      title: state.currentFileName,
      content: getContent(),
    });
  } catch (error) {
    await showError(t("menu.exportPdf"), error);
  }
}

const actions: Record<string, () => void | Promise<void>> = {
  new: newFile,
  open: openFile,
  save: () => void saveFile(),
  "save-as": () => void saveAsFile(),
  rename: renameCurrentFile,
  "export-pdf": exportPdf,
  undo,
  redo,
  h1: () => heading(1),
  h2: () => heading(2),
  h3: () => heading(3),
  h4: () => heading(4),
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

let previewTimer: number | undefined;
let syncPreviewScroll = (): void => {};
let refreshMobileOutline = (): void => {};

let mobileAiModeBound = false;

function bindMobileAiMode(): void {
  if (mobileAiModeBound) return;
  mobileAiModeBound = true;

  const toggle = document.querySelector<HTMLButtonElement>("#ai-mode-toggle");
  const aiBar = document.querySelector<HTMLElement>("#ai-bar");
  if (!toggle || !aiBar) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    aiBar.hidden = expanded;
  });

  aiBar.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      "[data-command]",
    );
    const command = button?.dataset.command;
    if (command === "ai-prompt") {
      insertAtCursor(`## ${t("ai.prompt")}\n\n`);
    } else if (command === "ai-response") {
      insertAtCursor(`## ${t("ai.response")}\n\n`);
    }
  });
}

function closeMobileMenus(): void {
  document.querySelectorAll<HTMLElement>("[data-mobile-menu]").forEach((menu) => {
    menu.hidden = true;
  });
  document
    .querySelectorAll<HTMLButtonElement>("[data-mobile-menu-trigger]")
    .forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
}

function toggleMobileMenu(name: string): void {
  const menu = document.querySelector<HTMLElement>(`[data-mobile-menu="${name}"]`);
  const shouldOpen = menu?.hidden ?? false;
  closeMobileMenus();
  if (!menu || !shouldOpen) return;
  menu.hidden = false;
  document
    .querySelector<HTMLButtonElement>(`[data-mobile-menu-trigger="${name}"]`)
    ?.setAttribute("aria-expanded", "true");
}

function updatePreview(): void {
  const preview = document.querySelector<HTMLElement>("#preview");
  if (!preview) return;
  preview.innerHTML = renderMarkdown(getContent());
  decoratePreviewCopyBlocks(preview);
  syncPreviewScroll();
  refreshMobileOutline();
  void renderMermaidDiagrams(preview).then(() => {
    decoratePreviewCopyBlocks(preview);
    syncPreviewScroll();
  });
}

function applyViewMode(viewMode: ViewMode = getState().viewMode): void {
  const workspace = document.querySelector<HTMLElement>("#workspace");
  if (!workspace) return;
  workspace.classList.toggle("view-edit", viewMode === "edit");
  workspace.classList.toggle("view-preview", viewMode === "preview");
  workspace.classList.toggle("view-split", viewMode === "split");
  document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewMode);
  });
}

function updateChrome(): void {
  const state = getState();
  const fileName = document.querySelector<HTMLElement>("#mobile-file-name");
  const saveState = document.querySelector<HTMLElement>("#mobile-save-state");
  if (fileName) fileName.textContent = state.currentFileName;
  if (saveState) {
    saveState.textContent = state.isDirty ? t("status.unsaved") : t("status.saved");
    saveState.classList.toggle("is-dirty", state.isDirty);
  }
  applyViewMode(state.viewMode);
}

function setDrawerOpen(open: boolean): void {
  const drawer = document.querySelector<HTMLElement>("[data-mobile-drawer]");
  if (!drawer) return;
  drawer.hidden = !open;
  drawer.classList.toggle("open", open);
}

function setDrawerTab(tab: "files" | "outline"): void {
  document
    .querySelectorAll<HTMLButtonElement>("[data-mobile-drawer-tab]")
    .forEach((button) => {
      button.classList.toggle("active", button.dataset.mobileDrawerTab === tab);
    });
  document
    .querySelectorAll<HTMLElement>("[data-mobile-drawer-panel]")
    .forEach((panel) => {
      panel.hidden = panel.dataset.mobileDrawerPanel !== tab;
    });
}

window.addEventListener("DOMContentLoaded", () => {
  initI18n("zh-CN");
  if (!getState().currentFilePath) {
    setState({ currentFileName: t("file.untitled") });
  }

  bindMobileAiMode();
  bindPreviewLinks();

  const preview = document.querySelector<HTMLElement>("#preview");
  if (preview) {
    bindTaskListInteraction(preview, getContent, setContentPreservingView);
    bindPreviewBlockCopy(preview);
  }

  refreshMobileOutline = bindMobileSidebar({
    openPath: (path) =>
      openPathInCurrentWindow(path, { removeOnFailure: true }),
    closeDrawer: () => setDrawerOpen(false),
  }).refreshOutline;
  syncPreviewScroll = bindSplitScrollSync();

  document.addEventListener("click", (event) => {
    const target = event.target as Element;

    const menuTrigger = target.closest<HTMLButtonElement>(
      "[data-mobile-menu-trigger]",
    );
    if (menuTrigger) {
      const name = menuTrigger.dataset.mobileMenuTrigger;
      if (name) toggleMobileMenu(name);
      return;
    }

    if (target.closest("[data-mobile-hide-tools]")) {
      document.querySelector<HTMLElement>(".mobile-app")?.classList.add("tools-hidden");
      closeMobileMenus();
      return;
    }

    if (target.closest("[data-mobile-show-tools]")) {
      document.querySelector<HTMLElement>(".mobile-app")?.classList.remove("tools-hidden");
      return;
    }

    if (target.closest("[data-mobile-drawer-open]")) {
      setDrawerOpen(true);
      closeMobileMenus();
      return;
    }

    if (target.closest("[data-mobile-drawer-close]")) {
      setDrawerOpen(false);
      return;
    }

    const drawer = document.querySelector<HTMLElement>("[data-mobile-drawer]");
    if (drawer && target === drawer) {
      setDrawerOpen(false);
      return;
    }

    const drawerTab = target.closest<HTMLButtonElement>("[data-mobile-drawer-tab]");
    if (drawerTab) {
      const tab = drawerTab.dataset.mobileDrawerTab;
      if (tab === "files" || tab === "outline") setDrawerTab(tab);
      return;
    }

    const commandButton = target.closest<HTMLButtonElement>("button[data-command]");
    if (commandButton) {
      const command = commandButton.dataset.command;
      if (command && actions[command]) {
        void actions[command]();
        closeMobileMenus();
      }
      return;
    }

    const viewButton = target.closest<HTMLButtonElement>("[data-view]");
    if (viewButton) {
      const view = viewButton.dataset.view;
      if (view === "edit" || view === "preview" || view === "split") {
        setState({ viewMode: view });
        closeMobileMenus();
      }
      return;
    }

    if (!target.closest("[data-mobile-menu]")) closeMobileMenus();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenus();
      setDrawerOpen(false);
    }
  });

  onEditorInput(() => {
    updateDirtyState(getContent());
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(updatePreview, 100);
  });

  subscribe(updateChrome);
  setState({ viewMode: "edit" });
  setContent("");
  updatePreview();
  updateChrome();
});
