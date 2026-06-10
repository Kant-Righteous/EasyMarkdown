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

export function buildPrintDocument(options: {
  title: string;
  bodyHtml: string;
  language: string;
  styles: string;
  saveLabel: string;
  cancelLabel: string;
}): string {
  return `<!doctype html>
<html lang="${escapeHtml(options.language)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.title)}</title>
  <style>${options.styles}</style>
</head>
<body>
  <header class="print-preview-toolbar">
    <span class="print-preview-title">${escapeHtml(options.title)}</span>
    <span class="print-preview-actions">
      <button type="button" id="print-cancel">${escapeHtml(options.cancelLabel)}</button>
      <button type="button" id="print-save">${escapeHtml(options.saveLabel)}</button>
    </span>
  </header>
  <article class="markdown-print-body">${options.bodyHtml}</article>
</body>
</html>`;
}
