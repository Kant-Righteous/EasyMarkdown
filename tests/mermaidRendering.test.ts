import test from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "../src/markdown.ts";

test("renders Mermaid fences as safe diagram placeholders", () => {
  const html = renderMarkdown(
    "```mermaid\nflowchart TD\n  A[<script>alert(1)</script>] --> B\n```",
  );

  assert.match(html, /class="mermaid-diagram(?: [^"]*)?"/);
  assert.match(html, /class="mermaid-diagram preview-copy-block"/);
  assert.match(
    html,
    /data-copy-source="flowchart TD\n  A\[&lt;script&gt;alert\(1\)&lt;\/script&gt;\] --&gt; B\n"/,
  );
  assert.match(html, /class="mermaid-source"/);
  assert.match(html, /data-source-line="0"/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});

test("keeps ordinary fenced code unchanged", () => {
  const html = renderMarkdown("```ts\nconst value = 1;\n```");

  assert.match(html, /<pre[^>]*data-source-line="0"/);
  assert.match(html, /<code class="language-ts">/);
  assert.doesNotMatch(html, /class="mermaid-diagram"/);
});
