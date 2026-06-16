import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { message, open, save } from "@tauri-apps/plugin-dialog";
import { getContent, setContent } from "../shared/editor";
import {
  buildOpenFileUrl,
  createRecentWindowLabel,
  getOpenDecision,
  getOpenTarget,
} from "../shared/utils/openFlow";
import { addRecentFile, removeRecentFile } from "../shared/utils/recentFiles";
import {
  createSaveQueue,
  getSaveAsDefaultPath,
  performSave,
  type WriteConfirmation,
} from "../shared/utils/saveFlow";
import { confirmUnsavedTransition } from "../shared/utils/fileTransition";
import { getState, setState, updateDirtyState } from "../shared/state/state";
import { t } from "../shared/i18n/i18n";

const markdownFilters = [
  {
    name: "Markdown / Text",
    extensions: ["md", "markdown", "txt"],
  },
];

const enqueueSave = createSaveQueue();

function fileNameFromPath(path: string): string {
  return path.split(/[\\/]/).pop() || t("file.untitled");
}

async function updateWindowTitle(): Promise<void> {
  const state = getState();
  const dirtyMark = state.isDirty ? " *" : "";
  await getCurrentWindow().setTitle(
    `${state.currentFileName}${dirtyMark} - EasyMarkdown`,
  );
}

function showError(action: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  window.alert(
    t("file.actionFailed", { action, message: errorMessage }),
  );
}

async function prepareForFileTransition(): Promise<boolean> {
  return confirmUnsavedTransition({
    isDirty: getState().isDirty,
    prompt: async () => {
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
      return getOpenDecision(result, {
        save: saveLabel,
        discard: discardLabel,
      });
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
    lastSavedContent: content,
  });
  updateDirtyState(getContent());
  addRecentFile(path);
  await updateWindowTitle();
}

export async function openPathInCurrentWindow(
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
    showError(t("file.openAction"), error);
    return false;
  }
}

export async function newFile(): Promise<void> {
  if (!(await prepareForFileTransition())) return;

  setContent("");
  setState({
    currentFilePath: null,
    currentFileName: t("file.untitled"),
    lastSavedContent: "",
  });
  updateDirtyState(getContent());
  await updateWindowTitle();
}

export async function openFile(): Promise<void> {
  const currentLabel = t("file.openCurrentWindow");
  const newWindowLabel = t("file.openNewWindow");
  const result = await message(t("file.openTargetMessage"), {
    title: t("file.openTitle"),
    buttons: {
      yes: currentLabel,
      no: newWindowLabel,
      cancel: t("file.cancelOpen"),
    },
  });
  const target = getOpenTarget(result, {
    current: currentLabel,
    newWindow: newWindowLabel,
  });
  if (target === "cancel") return;

  const path = await open({
    multiple: false,
    directory: false,
    filters: markdownFilters,
  });
  if (!path) return;

  if (target === "current") {
    await openPathInCurrentWindow(path);
  } else {
    openPathInNewWindow(path);
  }
}

export function openPathInNewWindow(path: string): void {
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
    window.alert(
      t("recent.newWindowFailed", { message: String(event.payload) }),
    );
  });
}

export async function detachDeletedFile(path: string): Promise<void> {
  const state = getState();
  const samePath =
    state.currentFilePath?.toLocaleLowerCase() === path.toLocaleLowerCase();
  if (!samePath) return;

  setState({
    currentFilePath: null,
    currentFileName: t("file.untitled"),
    lastSavedContent: "",
  });
  updateDirtyState(getContent());
  await updateWindowTitle();
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
    showError(t("file.saveAction"), outcome.error);
    return false;
  }

  setState({
    currentFilePath: outcome.path,
    currentFileName: fileNameFromPath(outcome.path),
    lastSavedContent: outcome.content,
  });
  updateDirtyState(getContent());

  try {
    addRecentFile(outcome.path);
  } catch (error) {
    console.error("Failed to update recent files after saving", error);
  }

  try {
    await updateWindowTitle();
  } catch (error) {
    console.error("Failed to update window title after saving", error);
  }

  return true;
}

export async function saveFile(): Promise<boolean> {
  return enqueueSave(() => runSave(false));
}

export async function saveAsFile(): Promise<boolean> {
  return enqueueSave(() => runSave(true));
}
