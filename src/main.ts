import "./style.css";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ask } from "@tauri-apps/plugin-dialog";
import { getContent, onEditorInput, setContent } from "./editor";
import { renderMarkdown } from "./markdown";
import { bindShortcuts } from "./shortcuts";
import { getState, setState, subscribe, updateDirtyState } from "./state";
import { bindToolbar } from "./toolbar";
import { bindAiMode } from "./ai-mode";
import { openPathInCurrentWindow, saveFile } from "./file";
import { parseOpenFilePath } from "./openFlow";
import { applyViewMode } from "./view";
import { getCloseAction } from "./close";
import { initI18n, subscribeLanguage, t } from "./i18n";
import { bindPreviewLinks } from "./previewLinks";

let previewTimer: number | undefined;

function updatePreview(): void {
  const preview = document.querySelector<HTMLElement>("#preview");
  if (preview) {
    preview.innerHTML = renderMarkdown(getContent());
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

window.addEventListener("DOMContentLoaded", () => {
  initI18n();
  if (!getState().currentFilePath) {
    setState({ currentFileName: t("file.untitled") });
  }
  bindToolbar();
  bindShortcuts();
  bindAiMode();
  bindPreviewLinks();
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
    const saveFirst = await ask(t("close.message"), {
      title: t("close.title"),
      kind: "warning",
    });

    let saveSucceeded: boolean | undefined;
    if (saveFirst) {
      saveSucceeded = await saveFile();
    }

    if (getCloseAction(isDirty, saveFirst, saveSucceeded) === "destroy") {
      await getCurrentWindow().destroy();
    }
  });

  updateChrome();
});
