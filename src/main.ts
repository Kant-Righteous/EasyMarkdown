import "./style.css";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { message } from "@tauri-apps/plugin-dialog";
import { getContent, onEditorInput, setContent } from "./editor";
import { renderMarkdown } from "./markdown";
import { bindShortcuts } from "./shortcuts";
import { getState, setState, subscribe, updateDirtyState } from "./state";
import { bindToolbar } from "./toolbar";
import { bindAiMode } from "./ai-mode";
import { openPathInCurrentWindow, saveFile } from "./file";
import { parseOpenFilePath } from "./openFlow";
import { applyViewMode } from "./view";
import { getCloseAction, getCloseDecision } from "./close";
import { initI18n, subscribeLanguage, t } from "./i18n";
import { bindPreviewLinks } from "./previewLinks";
import { bindSplitScrollSync } from "./scrollSync";
import { runPdfExportWindow } from "./exportPdf";
import { bindContentZoom } from "./previewZoom";
import { bindSidebar } from "./sidebar";
import { bindSplitPane } from "./splitPane";
import { bindFileDrop } from "./fileDrop";
import { bindContextMenu } from "./contextMenu";

let previewTimer: number | undefined;
let syncPreviewScroll = (): void => {};
let refreshSidebarOutline = (): void => {};

function updatePreview(): void {
  const preview = document.querySelector<HTMLElement>("#preview");
  if (preview) {
    preview.innerHTML = renderMarkdown(getContent());
    syncPreviewScroll();
    refreshSidebarOutline();
  }
}

function updateChrome(): void {
  const state = getState();
  const path = document.querySelector<HTMLElement>("#status-path");
  const dirty = document.querySelector<HTMLElement>("#status-dirty");
  const mode = document.querySelector<HTMLElement>("#status-mode");

  if (path) path.textContent = state.currentFilePath ?? t("status.unsavedFile");
  if (dirty) {
    dirty.textContent = state.isDirty ? t("status.unsaved") : t("status.saved");
    dirty.classList.toggle("is-dirty", state.isDirty);
  }
  if (mode) {
    mode.textContent = {
      edit: t("view.edit"),
      preview: t("view.preview"),
      split: t("view.split"),
    }[state.viewMode];
  }

  document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.viewMode);
  });

  const dirtyMark = state.isDirty ? " *" : "";
  void getCurrentWindow().setTitle(
    `${state.currentFileName}${dirtyMark} - EasyMarkdown`,
  );
}

window.addEventListener("DOMContentLoaded", async () => {
  if (await runPdfExportWindow()) return;

  let installerLanguage: string | null = null;
  try {
    installerLanguage = await invoke<string | null>("take_installer_language");
  } catch {
    // Development in a regular browser falls back to the system language.
  }
  initI18n(installerLanguage);
  if (!getState().currentFilePath) {
    setState({ currentFileName: t("file.untitled") });
  }
  bindToolbar();
  bindContextMenu();
  bindShortcuts();
  bindAiMode();
  bindPreviewLinks();
  bindContentZoom();
  refreshSidebarOutline = bindSidebar().refreshOutline;
  bindSplitPane();
  void bindFileDrop((path) =>
    openPathInCurrentWindow(path, { removeOnFailure: true }),
  );
  syncPreviewScroll = bindSplitScrollSync();
  subscribe(updateChrome);
  subscribeLanguage(() => {
    if (!getState().currentFilePath) {
      setState({ currentFileName: t("file.untitled") });
    } else {
      updateChrome();
    }
  });
  applyViewMode(getState().viewMode);

  onEditorInput(() => {
    const content = getContent();
    updateDirtyState(content);
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(updatePreview, 100);
  });

  setContent("");
  updatePreview();
  updateChrome();

  const startupPath = parseOpenFilePath(window.location.search);
  if (startupPath) {
    void openPathInCurrentWindow(startupPath, {
      confirmUnsaved: false,
      removeOnFailure: true,
    });
  }

  getCurrentWindow().onCloseRequested(async (event) => {
    const isDirty = getState().isDirty;
    if (getCloseAction(isDirty) === "default") return;

    event.preventDefault();
    const saveLabel = t("close.saveAndClose");
    const discardLabel = t("close.discardAndClose");
    const result = await message(t("close.message"), {
      title: t("close.title"),
      kind: "warning",
      buttons: {
        yes: saveLabel,
        no: discardLabel,
        cancel: t("close.cancel"),
      },
    });
    const decision = getCloseDecision(result, {
      save: saveLabel,
      discard: discardLabel,
    });

    let saveSucceeded: boolean | undefined;
    if (decision === "save") {
      saveSucceeded = await saveFile();
    }

    if (getCloseAction(isDirty, decision, saveSucceeded) === "destroy") {
      await getCurrentWindow().destroy();
    }
  });

  updateChrome();
});
