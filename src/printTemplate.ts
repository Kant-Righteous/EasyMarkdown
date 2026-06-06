import printStyles from "./print.css?raw";

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

export function buildPrintHtml(options: {
  title: string;
  bodyHtml: string;
}): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.title)}</title>
  <style>${printStyles}</style>
</head>
<body>
  <article class="markdown-print-body">${options.bodyHtml}</article>
  <button class="print-button" onclick="window.print()">打印 / 保存为 PDF</button>
  <script>
    window.addEventListener("load", function () {
      setTimeout(function () { window.print(); }, 300);
    });
  </script>
</body>
</html>`;
}
