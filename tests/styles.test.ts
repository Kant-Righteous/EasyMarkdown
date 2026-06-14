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

test("format toolbar remains single-line and uses consistent icon buttons", () => {
  assert.match(
    styles,
    /\.format-bar\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*100vw;[^}]*flex-wrap:\s*nowrap;[^}]*overflow:\s*visible;/s,
  );
  assert.match(
    styles,
    /\.format-command\s*\{[^}]*width:\s*30px;[^}]*height:\s*30px;/s,
  );
  assert.match(styles, /\.format-icon\s*\{/);
  assert.match(styles, /\.format-bar\.is-compact \.format-label\s*\{/);
  assert.match(styles, /\.format-overflow-panel\s*\{/);
});

test("format overflow menus use one aligned item layout", () => {
  assert.match(
    styles,
    /\.format-overflow-panel\s*\{[^}]*width:\s*190px;[^}]*min-width:\s*190px;/s,
  );
  assert.match(
    styles,
    /\.format-overflow-panel \.format-command\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*22px minmax\(0,\s*1fr\);[^}]*height:\s*34px;/s,
  );
  assert.match(
    styles,
    /\.format-overflow-panel :is\(\.format-icon,\s*\.format-symbol\)\s*\{[^}]*justify-self:\s*center;/s,
  );
  assert.match(
    styles,
    /\.format-menu-label\s*\{[^}]*text-align:\s*left;/s,
  );
});

test("preview styles cover all toolbar Markdown extensions", () => {
  assert.match(styles, /@import\s+"katex\/dist\/katex\.min\.css";/);
  assert.match(styles, /#preview \.katex-display\s*\{/);
  assert.match(styles, /#preview \.task-list-container\s*\{/);
  assert.match(styles, /#preview \.footnotes\s*\{/);
  assert.match(styles, /#preview mark\s*\{/);
  assert.match(styles, /#preview \.mermaid-diagram\s*\{/);
  assert.match(styles, /#preview \.mermaid-error\s*\{/);
});

test("print styles cover all toolbar Markdown extensions", () => {
  assert.match(printStyles, /\.markdown-print-body \.katex-display\s*\{/);
  assert.match(printStyles, /\.markdown-print-body \.task-list-container\s*\{/);
  assert.match(printStyles, /\.markdown-print-body \.footnotes\s*\{/);
  assert.match(printStyles, /\.markdown-print-body mark\s*\{/);
  assert.match(printStyles, /\.markdown-print-body \.mermaid-diagram\s*\{/);
  assert.match(printStyles, /\.markdown-print-body \.mermaid-error\s*\{/);
});
