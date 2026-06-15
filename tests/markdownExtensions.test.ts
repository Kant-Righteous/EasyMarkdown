import test from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "../src/markdown.ts";

test("renders inline and block formulas with KaTeX", () => {
  const html = renderMarkdown(
    "Inline $x^2 + y^2 = z^2$.\n\n$$\n\\int_0^1 x^2\\,dx\n$$",
  );

  assert.match(html, /class="katex"/);
  assert.match(html, /class="katex-display"/);
  assert.doesNotMatch(html, />\$\$/);
});

test("renders footnote references and definitions", () => {
  const html = renderMarkdown(
    "正文脚注[^1]\n\n[^1]: 脚注内容",
  );

  assert.match(html, /class="footnote-ref"/);
  assert.match(html, /class="footnotes"/);
  assert.match(html, /脚注内容/);
  assert.doesNotMatch(
    html,
    /class="footnote-ref"[\s\S]*?data-external-link="true"/,
  );
});

test("renders enabled task-list checkboxes with source lines", () => {
  const html = renderMarkdown("- [ ] 待办\n- [x] 完成");

  assert.match(html, /class="task-list-container"/);
  assert.match(
    html,
    /<li[^>]*data-source-line="0"[^>]*class="task-list-item"/,
  );
  assert.match(
    html,
    /<li[^>]*data-source-line="1"[^>]*class="task-list-item"/,
  );
  assert.match(html, /<input[^>]*type="checkbox"/);
  assert.doesNotMatch(html, /<input[^>]*disabled/);
  assert.match(html, /<input[^>]*checked/);
});

test("renders marked text", () => {
  const html = renderMarkdown("这是 ==高亮内容==。");

  assert.match(html, /<mark>高亮内容<\/mark>/);
});

test("extended syntax keeps link safety and source anchors", () => {
  const html = renderMarkdown(
    "# 标题\n\n[链接](https://example.com)\n\n- [ ] 任务",
  );

  assert.match(html, /<h1 data-source-line="0">/);
  assert.match(html, /data-external-link="true"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test("marks quote, code and formula blocks with reusable copy source", () => {
  const html = renderMarkdown(
    "> quote **text**\n\n```ts\nconst value = 1;\n```\n\n$$\nx^2\n$$",
  );

  assert.match(
    html,
    /<blockquote[^>]*class="preview-copy-block"[^>]*data-copy-source="quote \*\*text\*\*"/,
  );
  assert.match(
    html,
    /<pre[^>]*class="preview-copy-block"[^>]*data-copy-source="const value = 1;\n"/,
  );
  assert.match(
    html,
    /class="katex-block preview-copy-block"[^>]*data-copy-source="x\^2\n"/,
  );
});
