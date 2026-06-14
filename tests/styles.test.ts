import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const styles = await readFile(
  new URL("../src/style.css", import.meta.url),
  "utf8",
);
const printStyles = await readFile(
  new URL("../src/print.css", import.meta.url),
  "utf8",
);

test("预览区强调文本明确显示为斜体", () => {
  assert.match(
    styles,
    /#preview em\s*\{[^}]*font-style:\s*italic;[^}]*font-synthesis:\s*style;/s,
  );
});

test("加粗和斜体按钮内容水平居中", () => {
  assert.match(
    styles,
    /\.format-group button\[data-command="bold"\],[\s\S]*?\.format-group button\[data-command="italic"\][\s\S]*?\{[^}]*justify-content:\s*center;/,
  );
});

test("预览正文和块级内容使用对齐且有层次的固定宽度", () => {
  assert.match(
    styles,
    /\.workspace\.view-split\s*\{[^}]*--preview-text-width:\s*76rem;[^}]*--preview-block-width:\s*72rem;/s,
  );
  assert.match(
    styles,
    /\.workspace\.view-preview\s*\{[^}]*--preview-text-width:\s*96rem;[^}]*--preview-block-width:\s*90rem;/s,
  );
  assert.match(
    styles,
    /#preview > \*\s*\{[^}]*width:\s*min\(100%,\s*var\(--preview-text-width\)\);/s,
  );
  assert.match(
    styles,
    /#preview pre\s*\{[^}]*white-space:\s*pre-wrap;[^}]*overflow-wrap:\s*anywhere;/s,
  );
  assert.match(
    styles,
    /#preview blockquote\s*\{[^}]*width:\s*min\(100%,\s*var\(--preview-block-width\)\);[^}]*max-width:\s*100%;/s,
  );
  assert.match(
    styles,
    /#preview :is\(pre,\s*table,\s*\.mdx-card-group,\s*\.mdx-tabs-expanded\)\s*\{[^}]*width:\s*min\(100%,\s*var\(--preview-block-width\)\);/s,
  );
});

test("limited MDX components have preview and responsive styles", () => {
  assert.match(styles, /#preview \.mdx-icon\s*\{/);
  assert.match(styles, /#preview \.mdx-card-group\s*\{/);
  assert.match(styles, /#preview \.mdx-card\s*\{/);
  assert.match(styles, /#preview \.mdx-tab-section\s*\{/);
  assert.match(
    styles,
    /@media\s*\(max-width:\s*760px\)[\s\S]*#preview \.mdx-card-group\s*\{[\s\S]*grid-template-columns:\s*1fr;/,
  );
});

test("limited MDX components have print-safe styles", () => {
  assert.match(printStyles, /\.markdown-print-body \.mdx-icon\s*\{/);
  assert.match(printStyles, /\.markdown-print-body \.mdx-card-group\s*\{/);
  assert.match(
    printStyles,
    /\.markdown-print-body \.mdx-card[\s\S]*break-inside:\s*avoid;/,
  );
  assert.match(
    printStyles,
    /\.markdown-print-body \.mdx-tab-section[\s\S]*break-inside:\s*avoid;/,
  );
});

test("files and outline sidebar has desktop and responsive states", () => {
  assert.match(styles, /\.workspace-shell\s*\{/);
  assert.match(styles, /\.sidebar\s*\{/);
  assert.match(styles, /\.workspace-shell\.sidebar-closed \.sidebar\s*\{/);
  assert.match(styles, /\.sidebar-tab\[aria-selected="true"\]\s*\{/);
  assert.match(styles, /\.sidebar-file-actions\s*\{/);
  assert.match(styles, /\.outline-item\s*\{/);
  assert.match(
    styles,
    /@media\s*\(max-width:\s*860px\)[\s\S]*\.sidebar\s*\{[\s\S]*position:\s*absolute;/,
  );
});

test("sidebar has a draggable resize separator", () => {
  assert.match(styles, /\.sidebar-resizer\s*\{/);
  assert.match(styles, /cursor:\s*col-resize/);
  assert.match(styles, /\.workspace-shell\.is-resizing\s*\{/);
  assert.match(
    styles,
    /@media\s*\(max-width:\s*860px\)[\s\S]*\.sidebar-resizer\s*\{[\s\S]*display:\s*none;/,
  );
});

test("workspace keeps an explicit grid column when the sidebar closes", () => {
  assert.match(
    styles,
    /\.workspace\s*\{[^}]*grid-column:\s*3;/s,
  );
  assert.match(
    styles,
    /@media\s*\(max-width:\s*860px\)[\s\S]*?\.workspace\s*\{[^}]*grid-column:\s*1;/s,
  );
});

test("sidebar resize handle has a one-pixel visible divider", () => {
  assert.match(
    styles,
    /\.sidebar-resizer\s*\{[^}]*background:\s*var\(--bg-surface\);/s,
  );
  assert.match(
    styles,
    /\.sidebar-resizer::before\s*\{[^}]*width:\s*1px;/s,
  );
});

test("current sidebar file has a distinct selected state", () => {
  assert.match(styles, /\.sidebar-file-item\.is-current\s*\{/);
  assert.match(
    styles,
    /\.sidebar-file-item\.is-current\s*\{[^}]*box-shadow:/s,
  );
});

test("split view has a draggable divider and file-drop feedback", () => {
  assert.match(styles, /\.split-resizer\s*\{/);
  assert.match(styles, /\.workspace\.is-resizing-split\s*\{/);
  assert.match(styles, /\.workspace:not\(\.view-split\) \.split-resizer\s*\{/);
  assert.match(styles, /\.workspace-shell\.is-file-drag-over\s*\{/);
});

test("custom context menu and rename dialog have application styles", () => {
  assert.match(styles, /\.context-menu\s*\{/);
  assert.match(styles, /\.context-menu\[hidden\]\s*\{/);
  assert.match(styles, /\.rename-dialog\s*\{/);
});
