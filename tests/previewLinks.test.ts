import test from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "../src/markdown.ts";
import { getBrowserUrl } from "../src/externalUrl.ts";

test("Markdown 链接标记为由系统浏览器处理", () => {
  const html = renderMarkdown("[EasyMarkdown](https://example.com/docs)");

  assert.match(html, /data-external-link="true"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test("危险协议不会渲染为可点击链接", () => {
  const html = renderMarkdown("[危险链接](javascript:alert('xss'))");

  assert.doesNotMatch(html, /<a\b/);
});

test("只允许系统浏览器支持的外部链接协议", () => {
  assert.equal(
    getBrowserUrl("https://example.com/docs"),
    "https://example.com/docs",
  );
  assert.equal(
    getBrowserUrl("mailto:hello@example.com"),
    "mailto:hello@example.com",
  );
  assert.equal(getBrowserUrl("./relative.md"), null);
  assert.equal(getBrowserUrl("file:///C:/secret.txt"), null);
});

test("预览块包含对应的 Markdown 源码行锚点", () => {
  const html = renderMarkdown(
    "# Title\n\nParagraph\n\n```ts\nconst value = 1;\n```",
  );

  assert.match(html, /<h1 data-source-line="0">/);
  assert.match(html, /<p data-source-line="2">Paragraph<\/p>/);
  assert.match(html, /<pre data-source-line="4"><code class="language-ts">/);
});
