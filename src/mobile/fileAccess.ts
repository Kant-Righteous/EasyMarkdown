import { invoke } from "@tauri-apps/api/core";
import {
  readTextFile as fsReadTextFile,
  writeTextFile as fsWriteTextFile,
} from "@tauri-apps/plugin-fs";
import type { WriteConfirmation } from "../shared/utils/saveFlow";

export interface MobileFileIo {
  invoke: <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
  readTextFile: (path: string) => Promise<string>;
  writeTextFile: (path: string, content: string) => Promise<void>;
}

const defaultIo: MobileFileIo = {
  invoke,
  readTextFile: fsReadTextFile,
  writeTextFile: fsWriteTextFile,
};

export function isUriDocumentReference(value: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "content:" || url.protocol === "file:";
  } catch {
    return false;
  }
}

export function fileNameFromDocumentReference(
  reference: string,
  fallback: string,
): string {
  try {
    const url = new URL(reference);
    if (url.protocol === "content:" || url.protocol === "file:") {
      const lastSegment = url.pathname.split("/").filter(Boolean).pop();
      const decoded = lastSegment ? decodeURIComponent(lastSegment) : "";
      return decoded.split(/[\\/:]/).filter(Boolean).pop() || url.hostname || fallback;
    }
  } catch {
    return reference.split(/[\\/]/).pop() || fallback;
  }
  return reference.split(/[\\/]/).pop() || fallback;
}

export async function readMobileDocument(
  reference: string,
  io: MobileFileIo = defaultIo,
): Promise<string> {
  if (isUriDocumentReference(reference)) {
    return io.readTextFile(reference);
  }
  return io.invoke<string>("read_file", { path: reference });
}

export async function openSelectedMobileDocument(
  reference: string | null,
  openReference: (reference: string) => Promise<boolean>,
): Promise<boolean> {
  if (!reference) return false;
  return openReference(reference);
}

export async function writeMobileDocument(
  reference: string,
  content: string,
  io: MobileFileIo = defaultIo,
): Promise<WriteConfirmation> {
  if (!isUriDocumentReference(reference)) {
    return io.invoke<WriteConfirmation>("write_file", {
      path: reference,
      content,
    });
  }

  await io.writeTextFile(reference, content);
  const savedContent = await io.readTextFile(reference);
  if (savedContent !== content) {
    throw new Error("Saved content verification failed");
  }
  return {
    path: reference,
    content: savedContent,
  };
}

export function getMobileSaveDefaultReference(
  currentReference: string | null,
  currentFileName: string,
  untitledFileName: string,
): string {
  if (isUriDocumentReference(currentReference)) {
    return currentFileName || untitledFileName;
  }
  return currentReference || currentFileName || untitledFileName;
}

export function getUnsupportedRenameMessage(reference: string | null): string | null {
  return isUriDocumentReference(reference)
    ? "Android 文档 URI 不支持可靠重命名，请使用“另存为”保存为新名称。"
    : null;
}
