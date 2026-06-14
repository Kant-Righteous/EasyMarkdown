# Limited MDX Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Safely render the attached Z.AI MDX sample with icons and cards, expand tabs for print-friendly reading, and release the application as version `1.1.0`.

**Architecture:** Add a small parser that recognizes only approved MDX components and HTML tags, converts them to fixed HTML structures, and never evaluates JavaScript. Keep `renderMarkdown()` as the single entry point used by preview and PDF, with shared classes styled separately for screen and print.

**Tech Stack:** TypeScript, `markdown-it`, Node test runner, CSS, Vite, Tauri 2

---

### Task 1: Define restricted MDX behavior with failing tests

**Files:**
- Create: `tests/limitedMdx.test.ts`
- Test: `tests/limitedMdx.test.ts`

- [ ] **Step 1: Add tests for supported components**

Cover these observable behaviors through `renderMarkdown()`:

```ts
test("renders Icon in a heading without exposing component source", () => {
  const html = renderMarkdown(
    '## <Icon icon="rectangle-list" iconType="solid" color="#ffffff" size={36} /> Overview',
  );
  assert.match(html, /<h2>/);
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
});

test("expands every tab as a readable section", () => {
  const html = renderMarkdown(`
<Tabs>
  <Tab title="Web Development">First</Tab>
  <Tab title="AI Assistant">Second</Tab>
</Tabs>`);
  assert.match(html, /Web Development/);
  assert.match(html, /AI Assistant/);
  assert.match(html, /First/);
  assert.match(html, /Second/);
  assert.doesNotMatch(html, /<Tabs|<Tab/);
});
```

- [ ] **Step 2: Add security and degradation tests**

Verify script/event attributes, dangerous URLs, JavaScript expressions, and unknown component wrappers do not reach executable HTML. Verify fenced and inline code retain literal component text.

- [ ] **Step 3: Run the focused tests and confirm RED**

Run:

```powershell
npm test -- tests/limitedMdx.test.ts
```

Expected: failures because the current renderer escapes or displays component source.

### Task 2: Implement the restricted MDX parser

**Files:**
- Create: `src/limitedMdx.ts`
- Modify: `src/markdown.ts`
- Test: `tests/limitedMdx.test.ts`

- [ ] **Step 1: Add a parser with explicit component boundaries**

Create:

```ts
export function preprocessLimitedMdx(source: string): string;
```

The function must:

- protect fenced code and inline code before component conversion;
- parse quoted strings and numeric brace attributes without evaluation;
- convert `Icon`, `CardGroup`, `Card`, `Tabs`, and `Tab`;
- unwrap unknown capitalized component containers while preserving readable children;
- escape all attribute-derived text;
- clamp `cols` to `1..4` and icon size to `12..64`;
- reject unsafe colors and unknown icon names.

- [ ] **Step 2: Render icons from an internal SVG map**

Provide fixed SVG paths for the sample icon names:

```text
rectangle-list, list-ol, table-cells, arrow-down-from-line, list,
bars-sort, rectangle-code, arrow-down-right, arrow-down-left,
arrow-down-arrow-up, maximize, brain, function, database, code
```

Unknown names use a fixed generic icon. No source-provided SVG markup is accepted.

- [ ] **Step 3: Wire preprocessing into `renderMarkdown()`**

Enable `markdown-it` HTML only for generated, subsequently sanitized markup:

```ts
export function renderMarkdown(source: string): string {
  return sanitizeRenderedHtml(renderer.render(preprocessLimitedMdx(source)));
}
```

The sanitizer must retain only generated classes and the approved HTML/attributes required by the sample.

- [ ] **Step 4: Run the focused tests and confirm GREEN**

Run:

```powershell
npm test -- tests/limitedMdx.test.ts
```

Expected: all restricted MDX tests pass.

### Task 3: Support safe sample HTML

**Files:**
- Modify: `src/limitedMdx.ts`
- Modify: `tests/limitedMdx.test.ts`

- [ ] **Step 1: Add failing tests for safe HTML**

Test safe `img`, `video`, `u`, `div`, `h3`, and `p` markup. Test that `onclick`, `javascript:`, `style` values containing `url()`/`expression()`, and non-whitelisted CSS properties are removed.

- [ ] **Step 2: Verify the new tests fail**

Run:

```powershell
npm test -- tests/limitedMdx.test.ts
```

Expected: safe sample HTML is escaped or unsupported attributes remain.

- [ ] **Step 3: Implement tag and style allowlists**

Allow only:

```text
tags: div, h3, p, u, img, video
URLs: http, https
CSS: display, gap, align-items, justify-content, width, height,
     border-radius, background, color, font-weight, font-size,
     flex, flex-shrink, margin, line-height
```

Reject event attributes and any CSS value containing `url(`, `expression(`, `javascript:`, or control characters.

- [ ] **Step 4: Confirm focused tests pass**

Run:

```powershell
npm test -- tests/limitedMdx.test.ts
```

Expected: all tests pass.

### Task 4: Add screen and print presentation

**Files:**
- Modify: `src/style.css`
- Modify: `src/print.css`
- Modify: `tests/styles.test.ts`

- [ ] **Step 1: Add failing style contract tests**

Assert the styles define:

```text
.mdx-icon
.mdx-card-group
.mdx-card
.mdx-tab-section
```

Also assert responsive single-column card layout and print page-break protection.

- [ ] **Step 2: Run style tests and confirm RED**

Run:

```powershell
npm test -- tests/styles.test.ts
```

Expected: missing selector failures.

- [ ] **Step 3: Add preview and print CSS**

Screen styling provides responsive grids, readable cards, aligned inline icons, media sizing, and expanded tab sections. Print styling uses static grids where space allows and avoids splitting cards/tab sections across pages.

- [ ] **Step 4: Run style tests and confirm GREEN**

Run:

```powershell
npm test -- tests/styles.test.ts
```

Expected: all style tests pass.

### Task 5: Update release version to 1.1.0

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src-tauri/tauri.conf.json`
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/Cargo.lock`
- Create: `tests/version.test.ts`

- [ ] **Step 1: Add a failing version consistency test**

Read the JSON/TOML/lock files and assert the root package and Tauri application package versions equal `1.1.0`.

- [ ] **Step 2: Run the version test and confirm RED**

Run:

```powershell
npm test -- tests/version.test.ts
```

Expected: current `1.0.0` values fail.

- [ ] **Step 3: Update only application version fields**

Set EasyMarkdown package/config values to `1.1.0`. Do not alter dependency versions.

- [ ] **Step 4: Run the version test and confirm GREEN**

Run:

```powershell
npm test -- tests/version.test.ts
```

Expected: all version assertions pass.

### Task 6: Verify the complete sample and application

**Files:**
- Modify: `tests/limitedMdx.test.ts`
- Reference: attached `pasted-text.txt`

- [ ] **Step 1: Add a representative integration fixture**

Use the supported component patterns from the attachment in a test string and assert no supported MDX source tags remain while all section/card/tab titles remain present.

- [ ] **Step 2: Run the full automated suite**

Run:

```powershell
npm test
npm run build
```

Expected: zero test failures and successful TypeScript/Vite build.

- [ ] **Step 3: Start the local app and inspect with the in-app browser**

Run the Vite development server, open its local URL with Browser, insert/load the complete attached sample, and verify:

- headings include icons;
- cards form responsive grids;
- every tab is expanded;
- images/video placeholders do not expose unsafe markup;
- no supported MDX tags are shown as source;
- narrow viewport falls back to one card per row.

- [ ] **Step 4: Review the final diff**

Run:

```powershell
git diff --stat
git status --short
```

Confirm changes are limited to the agreed parser, styles, tests, documentation, and version files, preserving unrelated user work.
