import { getContent } from "./editor";
import { renderMarkdown } from "./markdown";
import { buildPrintHtml } from "./printTemplate";
import { getState } from "./state";

function showPrintFallback(html: string): void {
  document.querySelector(".print-fallback")?.remove();

  const container = document.createElement("div");
  container.className = "print-fallback";

  const header = document.createElement("div");
  header.className = "print-fallback-header";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "关闭打印预览";
  closeButton.addEventListener("click", () => container.remove());

  const iframe = document.createElement("iframe");
  iframe.title = "PDF 打印预览";
  iframe.srcdoc = html;

  header.append(closeButton);
  container.append(header, iframe);
  document.body.append(container);
}

export function exportPdf(): void {
  const state = getState();
  const html = buildPrintHtml({
    title: state.currentFilePath ? state.currentFileName : "EasyMarkdown",
    bodyHtml: renderMarkdown(getContent()),
  });

  showPrintFallback(html);
}
