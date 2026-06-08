import "./style.css";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ask } from "@tauri-apps/plugin-dialog";
import { getContent, onEditorInput, setContent } from "./editor";
import { renderMarkdown } from "./markdown";
import { bindShortcuts } from "./shortcuts";
import { getState, subscribe, updateDirtyState } from "./state";
import { bindToolbar } from "./toolbar";
import { bindAiMode } from "./ai-mode";
import { applyViewMode } from "./view";
import { getCloseAction } from "./close";

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

  if (path) path.textContent = state.currentFilePath ?? "未保存文件";
  if (dirty) {
    dirty.textContent = state.isDirty ? "未保存" : "已保存";
    dirty.classList.toggle("is-dirty", state.isDirty);
  }
  if (mode) {
    mode.textContent = {
      edit: "编辑",
      preview: "预览",
      split: "分屏",
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
  bindToolbar();
  bindShortcuts();
  bindAiMode();
  subscribe(updateChrome);
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

  getCurrentWindow().onCloseRequested(async (event) => {
    const isDirty = getState().isDirty;
    if (getCloseAction(isDirty) === "default") return;

    event.preventDefault();
    const saveFirst = await ask("文件尚未保存，是否保存后关闭？", {
      title: "未保存的更改",
      kind: "warning",
    });

    let saveSucceeded: boolean | undefined;
    if (saveFirst) {
      const { saveFile } = await import("./file");
      saveSucceeded = await saveFile();
    }

    if (getCloseAction(isDirty, saveFirst, saveSucceeded) === "destroy") {
      await getCurrentWindow().destroy();
    }
  });

  updateChrome();
});
