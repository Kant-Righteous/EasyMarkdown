import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open, save } from "@tauri-apps/plugin-dialog";
import { getContent, setContent } from "./editor";
import { getState, setState } from "./state";

const markdownFilters = [
  {
    name: "Markdown / Text",
    extensions: ["md", "markdown", "txt"],
  },
];

function fileNameFromPath(path: string): string {
  return path.split(/[\\/]/).pop() || "未命名.md";
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
    window.confirm("当前内容尚未保存。确定要放弃这些修改吗？")
  );
}

function showError(action: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  window.alert(`${action}失败：${message}`);
}

export async function newFile(): Promise<void> {
  if (!confirmDiscardChanges()) return;

  setContent("");
  setState({
    currentFilePath: null,
    currentFileName: "未命名.md",
    lastSavedContent: "",
    isDirty: false,
  });
  await updateWindowTitle();
}

export async function openFile(): Promise<void> {
  if (!confirmDiscardChanges()) return;

  const path = await open({
    multiple: false,
    directory: false,
    filters: markdownFilters,
  });
  if (!path) return;

  try {
    const content = await invoke<string>("read_file", { path });
    setContent(content);
    setState({
      currentFilePath: path,
      currentFileName: fileNameFromPath(path),
      lastSavedContent: content,
      isDirty: false,
    });
    await updateWindowTitle();
  } catch (error) {
    showError("打开文件", error);
  }
}

async function writeCurrentFile(path: string): Promise<boolean> {
  const content = getContent();

  try {
    await invoke("write_file", { path, content });
    setState({
      currentFilePath: path,
      currentFileName: fileNameFromPath(path),
      lastSavedContent: content,
      isDirty: false,
    });
    await updateWindowTitle();
    return true;
  } catch (error) {
    showError("保存文件", error);
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
    defaultPath: state.currentFileName,
    filters: markdownFilters,
  });

  return path ? writeCurrentFile(path) : false;
}
