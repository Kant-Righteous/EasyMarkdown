import test from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "../src/markdown.ts";

test("renders Icon in a heading without exposing component source", () => {
  const html = renderMarkdown(
    '## <Icon icon="rectangle-list" iconType="solid" color="#ffffff" size={36} /> Overview',
  );

  assert.match(html, /<h2(?:\s[^>]*)?>/);
  assert.match(html, /class="mdx-icon/);
  assert.match(html, /Overview/);
  assert.doesNotMatch(html, /&lt;Icon|<Icon/);
});

test("renders cards and Markdown content", () => {
  const html = renderMarkdown(`
<CardGroup cols={2}>
  <Card title="Context Length" icon="database">
    **128K**
  </Card>
</CardGroup>`);

  assert.match(html, /class="mdx-card-group mdx-card-group--cols-2"/);
  assert.match(html, /class="mdx-card"/);
  assert.match(html, /Context Length/);
  assert.match(html, /<strong>128K<\/strong>/);
  assert.doesNotMatch(html, /&lt;Card|<Card/);
});

test("expands every tab as a readable section", () => {
  const html = renderMarkdown(`
<Tabs>
  <Tab title="Web Development">First</Tab>
  <Tab title="AI Assistant">Second</Tab>
</Tabs>`);

  assert.match(html, /class="mdx-tab-section"/);
  assert.match(html, /Web Development/);
  assert.match(html, /AI Assistant/);
  assert.match(html, /First/);
  assert.match(html, /Second/);
  assert.doesNotMatch(html, /&lt;Tabs|&lt;Tab|<Tabs|<Tab/);
});

test("keeps approved HTML and filters unsafe attributes and URLs", () => {
  const html = renderMarkdown(`
<div style={{display: 'flex', gap: '12px', position: 'fixed', background: 'url(javascript:alert(1))'}} onclick="alert(1)">
  <h3 style={{fontSize: '18px', color: 'white'}}>Title</h3>
  <p style={{lineHeight: '1.4'}}>Body</p>
</div>
<img src="https://example.com/image.png" alt="Chart" width="1280" onerror="alert(1)" />
<video src="javascript:alert(1)" controls />
<u>Underlined</u>`);

  assert.match(html, /<div class="mdx-html"/);
  assert.match(html, /display:flex/);
  assert.match(html, /gap:12px/);
  assert.match(html, /<h3/);
  assert.match(html, /font-size:18px/);
  assert.match(html, /<p/);
  assert.match(html, /<img /);
  assert.match(html, /src="https:\/\/example\.com\/image\.png"/);
  assert.match(html, /<u>Underlined<\/u>/);
  assert.doesNotMatch(html, /onclick|onerror|position:|url\(|javascript:/);
});

test("does not execute expressions, scripts, or unknown component wrappers", () => {
  const html = renderMarkdown(`
<Unknown onClick={() => alert(1)}>
  Readable **content**
</Unknown>
<script>alert(1)</script>
<Icon icon={"database"} size={dangerous()} />
`);

  assert.match(html, /Readable/);
  assert.match(html, /<strong>content<\/strong>/);
  assert.doesNotMatch(html, /<script|onClick|alert\(1\)|dangerous\(\)/);
});

test("does not transform MDX inside fenced or inline code", () => {
  const html = renderMarkdown(`
\`<Icon icon="database" />\`

\`\`\`mdx
<Card title="Example">Body</Card>
\`\`\`
`);

  assert.match(html, /<code>&lt;Icon icon=&quot;database&quot; \/&gt;<\/code>/);
  assert.match(html, /&lt;Card title=&quot;Example&quot;&gt;Body&lt;\/Card&gt;/);
  assert.doesNotMatch(html, /class="mdx-icon/);
  assert.doesNotMatch(html, /class="mdx-card"/);
});

test("preserves standard Markdown angle autolinks", () => {
  const html = renderMarkdown(
    "<https://example.com/docs> <hello@example.com>",
  );

  assert.match(html, /href="https:\/\/example\.com\/docs"/);
  assert.match(html, /href="mailto:hello@example\.com"/);
});

test("renders fenced code inside expanded tabs without leaking placeholders", () => {
  const html = renderMarkdown(`
<Tabs>
  <Tab title="cURL">
    \`\`\`bash
    curl https://example.com
    \`\`\`
  </Tab>
</Tabs>`);

  assert.match(html, /<pre(?:\s[^>]*)?><code class="language-bash">/);
  assert.match(html, /curl https:\/\/example\.com/);
  assert.doesNotMatch(html, /EASYMDXPLACEHOLDER/);
});

test("keeps source line anchors around expanded MDX blocks", () => {
  const html = renderMarkdown(
    '<Card title="Example">\nBody\n</Card>\n\n## After',
  );

  assert.match(html, /class="mdx-card" data-source-line="0"/);
  assert.match(html, /<h2 data-source-line="4">After<\/h2>/);
});
