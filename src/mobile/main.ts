import "./style.css";
import { bold, blockquote, heading, link, unorderedList } from "../shared/commands";
import {
  getContent,
  onEditorInput,
  setContent,
  setContentPreservingView,
} from "../shared/editor";
import { initI18n, t } from "../shared/i18n/i18n";
import { renderMarkdown } from "../shared/markdown/markdown";
import { decoratePreviewCopyBlocks } from "../shared/markdown/previewBlockCopy";
import { bindTaskListInteraction } from "../shared/markdown/taskListInteraction";
import { getState, setState, subscribe, updateDirtyState } from "../shared/state/state";

const actions: Record<string, () => void> = {
  h1: () => heading(1),
  bold,
  "unordered-list": unorderedList,
  blockquote,
  link,
};

function updatePreview(): void {
  const preview = document.querySelector<HTMLElement>("#preview");
  if (!preview) return;
  preview.innerHTML = renderMarkdown(getContent());
  decoratePreviewCopyBlocks(preview);
}

function applyViewMode(): void {
  const workspace = document.querySelector<HTMLElement>("#workspace");
  if (!workspace) return;
  const { viewMode } = getState();
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
  applyViewMode();
}

window.addEventListener("DOMContentLoaded", () => {
  initI18n("zh-CN");
  if (!getState().currentFilePath) {
    setState({ currentFileName: t("file.untitled") });
  }

  const preview = document.querySelector<HTMLElement>("#preview");
  if (preview) {
    bindTaskListInteraction(preview, getContent, setContentPreservingView);
  }

  document.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      "button[data-command], button[data-view]",
    );
    if (!button) return;

    const command = button.dataset.command;
    if (command && actions[command]) actions[command]();

    const view = button.dataset.view;
    if (view === "edit" || view === "preview" || view === "split") {
      setState({ viewMode: view });
    }
  });

  onEditorInput(() => {
    updateDirtyState(getContent());
    updatePreview();
  });

  subscribe(updateChrome);
  setContent("");
  updatePreview();
  updateChrome();
});
