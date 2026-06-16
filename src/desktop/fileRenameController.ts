import { invoke } from "@tauri-apps/api/core";
import { message } from "@tauri-apps/plugin-dialog";
import { getRenameValidationError } from "../shared/utils/fileRename";
import { t } from "../shared/i18n/i18n";
import { replaceRecentFile } from "../shared/utils/recentFiles";
import { getState, setState } from "../shared/state/state";

function getBaseName(path: string): string {
  return path.slice(Math.max(path.lastIndexOf("\\"), path.lastIndexOf("/")) + 1);
}

function requestRename(path: string): Promise<string | null> {
  const dialog = document.querySelector<HTMLDialogElement>("#rename-dialog");
  const form = document.querySelector<HTMLFormElement>("#rename-form");
  const input = document.querySelector<HTMLInputElement>("#rename-input");
  const error = document.querySelector<HTMLElement>("#rename-error");
  const cancel = document.querySelector<HTMLButtonElement>("#rename-cancel");
  if (!dialog || !form || !input || !error || !cancel) {
    return Promise.resolve(null);
  }

  const currentName = getBaseName(path);
  input.value = currentName;
  error.textContent = "";

  return new Promise((resolve) => {
    const finish = (value: string | null) => {
      form.removeEventListener("submit", handleSubmit);
      cancel.removeEventListener("click", handleCancel);
      dialog.removeEventListener("cancel", handleDialogCancel);
      if (dialog.open) dialog.close();
      resolve(value);
    };
    const handleSubmit = (event: SubmitEvent) => {
      event.preventDefault();
      const validationError = getRenameValidationError(input.value);
      if (validationError) {
        error.textContent = t(`rename.${validationError}`);
        input.focus();
        return;
      }
      finish(input.value.trim());
    };
    const handleCancel = () => finish(null);
    const handleDialogCancel = (event: Event) => {
      event.preventDefault();
      finish(null);
    };

    form.addEventListener("submit", handleSubmit);
    cancel.addEventListener("click", handleCancel);
    dialog.addEventListener("cancel", handleDialogCancel);
    dialog.showModal();
    input.focus();
    const extensionIndex = currentName.lastIndexOf(".");
    input.setSelectionRange(0, extensionIndex > 0 ? extensionIndex : currentName.length);
  });
}

export async function renameFile(path = getState().currentFilePath): Promise<boolean> {
  if (!path) return false;
  const newName = await requestRename(path);
  if (!newName || newName === getBaseName(path)) return false;

  try {
    const newPath = await invoke<string>("rename_file", { path, newName });
    replaceRecentFile(path, newPath);
    if (getState().currentFilePath === path) {
      setState({
        currentFilePath: newPath,
        currentFileName: getBaseName(newPath),
      });
    }
    return true;
  } catch (error) {
    await message(`${t("rename.failed")}\n${String(error)}`, {
      title: t("rename.title"),
      kind: "error",
    });
    return false;
  }
}
