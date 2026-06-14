import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { save } from "@tauri-apps/plugin-dialog";
import { getContent } from "./editor";
import { renderMarkdownWithMermaid } from "./markdown";
import { buildPrintHtml } from "./printTemplate";
import { getState } from "./state";
import { t } from "./i18n";

const PRINT_JOB_PREFIX = "easymarkdown.print-job.";
const PRINT_JOB_PARAM = "printJob";

interface PrintJob {
  html: string;
  defaultPath: string;
}

function printJobKey(id: string): string {
  return `${PRINT_JOB_PREFIX}${id}`;
}

function defaultPdfName(): string {
  const name = getState().currentFileName.replace(/\.[^.]+$/, "");
  return `${name || "EasyMarkdown"}.pdf`;
}

function showExportError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  window.alert(t("print.exportFailed", { message }));
}

function createPrintWindow(job: PrintJob): void {
  const id = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const label = `pdf-${id}`;

  try {
    window.localStorage.setItem(printJobKey(id), JSON.stringify(job));
  } catch (error) {
    showExportError(error);
    return;
  }

  const printWindow = new WebviewWindow(label, {
    url: `/?${PRINT_JOB_PARAM}=${encodeURIComponent(id)}`,
    title: t("print.previewTitle"),
    visible: false,
    width: 900,
    height: 760,
  });

  void printWindow.once("tauri://error", (event) => {
    window.localStorage.removeItem(printJobKey(id));
    showExportError(event.payload);
  });
}

function takePrintJob(search: string): PrintJob | null {
  const id = new URLSearchParams(search).get(PRINT_JOB_PARAM);
  if (!id) return null;

  const key = printJobKey(id);
  try {
    const raw = window.localStorage.getItem(key);
    window.localStorage.removeItem(key);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" &&
      value !== null &&
      typeof (value as PrintJob).html === "string" &&
      typeof (value as PrintJob).defaultPath === "string"
    ) {
      return value as PrintJob;
    }
  } catch {
    window.localStorage.removeItem(key);
  }
  return null;
}

function applyPrintDocument(html: string): void {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const existingStyles = Array.from(
    document.head.querySelectorAll<HTMLLinkElement | HTMLStyleElement>(
      'link[rel="stylesheet"], style',
    ),
  );
  document.documentElement.lang = parsed.documentElement.lang;
  document.head.replaceChildren(
    ...existingStyles,
    ...Array.from(parsed.head.childNodes, (node) =>
      document.importNode(node, true),
    ),
  );
  document.body.replaceChildren(
    ...Array.from(parsed.body.childNodes, (node) =>
      document.importNode(node, true),
    ),
  );
}

async function waitForPrintAssets(): Promise<void> {
  if (document.fonts) await document.fonts.ready;

  await Promise.all(
    Array.from(document.images, (image) => {
      if (image.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const timeout = window.setTimeout(resolve, 5_000);
        const finish = (): void => {
          window.clearTimeout(timeout);
          resolve();
        };
        image.addEventListener("load", finish, { once: true });
        image.addEventListener("error", finish, { once: true });
      });
    }),
  );

  await new Promise<void>((resolve) =>
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => resolve()),
    ),
  );
}

export async function runPdfExportWindow(): Promise<boolean> {
  const hasPrintJob = new URLSearchParams(window.location.search).has(
    PRINT_JOB_PARAM,
  );
  if (!hasPrintJob) return false;

  const job = takePrintJob(window.location.search);
  if (!job) {
    await getCurrentWindow().destroy();
    return true;
  }

  try {
    applyPrintDocument(job.html);
    await waitForPrintAssets();
    const saveButton = document.querySelector<HTMLButtonElement>("#print-save");
    const cancelButton =
      document.querySelector<HTMLButtonElement>("#print-cancel");

    cancelButton?.addEventListener("click", () => {
      void getCurrentWindow().destroy();
    });
    saveButton?.addEventListener("click", async () => {
      const path = await save({
        defaultPath: job.defaultPath,
        filters: [{ name: "PDF", extensions: ["pdf"] }],
      });
      if (!path) return;

      saveButton.disabled = true;
      if (cancelButton) cancelButton.disabled = true;
      try {
        await invoke("print_to_pdf", { path });
        await getCurrentWindow().destroy();
      } catch (error) {
        saveButton.disabled = false;
        if (cancelButton) cancelButton.disabled = false;
        showExportError(error);
      }
    });
    await getCurrentWindow().show();
  } catch (error) {
    await getCurrentWindow().show();
    showExportError(error);
  }
  return true;
}

export async function exportPdf(): Promise<void> {
  const state = getState();
  const bodyHtml = await renderMarkdownWithMermaid(getContent());
  createPrintWindow({
    defaultPath: defaultPdfName(),
    html: buildPrintHtml({
      title: state.currentFilePath ? state.currentFileName : "EasyMarkdown",
      bodyHtml,
    }),
  });
}
