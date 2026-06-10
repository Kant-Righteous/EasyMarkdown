import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { message, open, save } from "@tauri-apps/plugin-dialog";
import { getContent, setContent } from "./editor";
import { getOpenDecision } from "./openFlow";
import { addRecentFile, removeRecentFile } from "./recentFiles";
import { getState, setState, updateDirtyState } from "./state";
import { t } from "./i18n";

const markdownFilters = [
  {
    name: "Markdown / Text",
    extensions: ["md", "markdown", "txt"],
  },
];

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

function confirmDiscardChanges(): boolean {
  return (
    !getState().isDirty ||
    window.confirm(t("file.discardConfirm"))
  );
}

function showError(action: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  window.alert(
    t("file.actionFailed", { action, message: errorMessage }),
  );
}

async function prepareForOpen(): Promise<boolean> {
  if (!getState().isDirty) return true;

  const saveLabel = t("file.saveAndOpen");
  const discardLabel = t("file.discardAndOpen");
  const result = await message(t("file.unsavedMessage"), {
    title: t("file.openTitle"),
    kind: "warning",
    buttons: {
      yes: saveLabel,
      no: discardLabel,
      cancel: t("file.cancelOpen"),
    },
  });

  const decision = getOpenDecision(result, {
    save: saveLabel,
    discard: discardLabel,
  });
  if (decision === "cancel") return false;
  return decision === "discard" || (await saveFile());
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
  if (confirmUnsaved && !(await prepareForOpen())) return false;

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
  if (!confirmDiscardChanges()) return;

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
  const path = await open({
    multiple: false,
    directory: false,
    filters: markdownFilters,
  });
  if (!path) return;

  await openPathInCurrentWindow(path);
}

async function writeCurrentFile(path: string): Promise<boolean> {
  const content = getContent();

  try {
    await invoke("write_file", { path, content });
    setState({
      currentFilePath: path,
      currentFileName: fileNameFromPath(path),
      lastSavedContent: content,
    });
    addRecentFile(path);
    updateDirtyState(getContent());
    await updateWindowTitle();
    return true;
  } catch (error) {
    showError(t("file.saveAction"), error);
    return false;
  }
}

export async function saveFile(): Promise<boolean> {
  const path = getState().currentFilePath;
  return path ? writeCurrentFile(path) : saveAsFile();
}

export async function saveAsFile(): Promise<boolean> {
  const state = getState();
  const path = await save({
    defaultPath: state.currentFilePath
      ? state.currentFileName
      : t("file.untitled"),
    filters: markdownFilters,
  });

  return path ? writeCurrentFile(path) : false;
}
