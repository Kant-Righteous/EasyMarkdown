import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [mainSource, exportSource] = await Promise.all([
  readFile(new URL("../src/desktop/main.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/desktop/exportPdf.ts", import.meta.url), "utf8"),
]);

test("live preview enhances Mermaid diagrams after Markdown rendering", () => {
  assert.match(
    mainSource,
    /renderMermaidDiagrams\(preview\)/,
  );
});

test("PDF export awaits Mermaid-enhanced HTML", () => {
  assert.match(
    exportSource,
    /await renderMarkdownWithMermaid\(getContent\(\)\)/,
  );
});
