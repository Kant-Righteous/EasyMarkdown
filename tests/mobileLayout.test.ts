import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, source, styles] = await Promise.all([
  readFile(new URL("../src/mobile/index.html", import.meta.url), "utf8"),
  readFile(new URL("../src/mobile/main.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/mobile/style.css", import.meta.url), "utf8"),
]);

test("mobile shell follows the confirmed V4 top and view layout", () => {
  assert.match(html, /class="mobile-app"/);
  assert.match(html, /class="mobile-top"/);
  assert.match(html, /class="mobile-doc-row"/);
  assert.match(html, /id="mobile-file-name"/);
  assert.match(html, /id="mobile-save-state"/);
  assert.match(html, /class="mobile-action-row"/);
  assert.match(html, /data-mobile-drawer-open/);
  assert.match(html, /data-mobile-menu-trigger="file"/);
  assert.match(html, /AI 对话保存模式/);
  assert.match(html, /data-command="undo"/);
  assert.match(html, /data-command="redo"/);
  assert.match(html, /data-command="save"/);
  assert.ok(html.indexOf('data-view="preview"') < html.indexOf('data-view="split"'));
  assert.ok(html.indexOf('data-view="split"') < html.indexOf('data-view="edit"'));
});

test("mobile file menu, drawer, outline tree and toolbar controls exist", () => {
  ["new", "open", "save-as", "rename", "export-pdf"].forEach((command) => {
    assert.match(html, new RegExp(`data-command="${command}"`));
  });
  assert.doesNotMatch(html, /最近打开/);
  assert.match(html, /data-mobile-drawer/);
  assert.match(html, /文档导航/);
  assert.match(html, /data-mobile-drawer-tab="files"/);
  assert.match(html, /data-mobile-drawer-tab="outline"/);
  assert.match(html, /mobile-outline-parent/);
  assert.match(html, /class="mobile-outline-toggle"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /class="mobile-outline-children"/);
  assert.match(html, /mobile-outline-child/);
  assert.match(html, /data-mobile-hide-tools/);
  assert.match(html, /data-mobile-show-tools/);
});

test("mobile bottom toolbar exposes five categories and confirmed commands", () => {
  ["heading", "font", "list", "block", "insert"].forEach((panel) => {
    assert.match(html, new RegExp(`data-mobile-menu-trigger="${panel}"`));
    assert.match(html, new RegExp(`data-mobile-menu="${panel}"`));
  });
  [
    "h1",
    "h2",
    "h3",
    "h4",
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "highlight",
    "unordered-list",
    "ordered-list",
    "task-list",
    "blockquote",
    "code-block",
    "formula-block",
    "chart",
    "link",
    "image",
    "table",
    "horizontal-rule",
    "inline-code",
    "inline-formula",
    "footnote",
  ].forEach((command) => {
    assert.match(html, new RegExp(`data-command="${command}"`));
  });
});

test("mobile script binds V4 interactions without importing desktop code", () => {
  assert.match(source, /@tauri-apps\/plugin-dialog/);
  assert.match(source, /invoke/);
  assert.match(source, /read_file/);
  assert.match(source, /write_file/);
  assert.match(source, /rename_file/);
  assert.match(source, /export_markdown_pdf/);
  assert.doesNotMatch(source, /open: \(\) => undefined/);
  assert.doesNotMatch(source, /"save-as": \(\) => undefined/);
  assert.doesNotMatch(source, /"export-pdf": \(\) => undefined/);
  assert.match(source, /data-mobile-menu-trigger/);
  assert.match(source, /data-mobile-drawer-open/);
  assert.match(source, /data-mobile-hide-tools/);
  assert.match(source, /data-mobile-outline-toggle/);
  assert.match(source, /bindTaskListInteraction/);
  assert.match(source, /decoratePreviewCopyBlocks/);
  assert.doesNotMatch(source, /\.\.\/desktop|\/desktop\//);
});

test("mobile styles include drawer, bottom menus, split divider and safe area", () => {
  assert.match(styles, /\.mobile-drawer-backdrop\s*\{/);
  assert.match(styles, /\.mobile-bottom-menu\s*\{/);
  assert.match(styles, /\.mobile-tools\s*\{/);
  assert.match(styles, /\.mobile-show-tools\s*\{/);
  assert.match(styles, /\.mobile-split-divider\s*\{/);
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
  assert.match(styles, /\.mobile-app\.tools-hidden \.mobile-tools\s*\{/);
  assert.match(styles, /\.mobile-ai-button\s*\{[^}]*max-width:\s*190px/s);
  assert.match(styles, /\.mobile-primary\s*\{[^}]*flex:\s*0 0 52px/s);
});
