import test from "node:test";
import assert from "node:assert/strict";
import { buildPrintDocument } from "../src/shared/markdown/printDocument.ts";

const printStyles = `
@page { size: A4; }
pre { overflow-wrap: anywhere; }
body { print-color-adjust: exact; }
`;

test("打印文档包含正文和导出预览操作栏", () => {
  const html = buildPrintDocument({
    title: "Guide <Draft>",
    bodyHtml: "<h1>Guide</h1><p>Readable text</p>",
    language: "en",
    styles: printStyles,
    saveLabel: "Save as PDF",
    cancelLabel: "Cancel",
  });

  assert.match(html, /<html lang="en">/);
  assert.match(html, /<title>Guide &lt;Draft&gt;<\/title>/);
  assert.match(html, /class="markdown-print-body"/);
  assert.match(html, /Readable text/);
  assert.match(html, /id="print-save">Save as PDF<\/button>/);
  assert.match(html, /id="print-cancel">Cancel<\/button>/);
  assert.doesNotMatch(html, /window\.print/);
});

test("打印模板包含 A4 排版与代码换行规则", () => {
  const html = buildPrintDocument({
    title: "文档",
    bodyHtml: "<pre><code>long command</code></pre>",
    language: "zh-CN",
    styles: printStyles,
    saveLabel: "保存为 PDF",
    cancelLabel: "取消",
  });

  assert.match(html, /@page\s*\{[^}]*size:\s*A4/s);
  assert.match(html, /overflow-wrap:\s*anywhere/);
  assert.match(html, /print-color-adjust:\s*exact/);
});
