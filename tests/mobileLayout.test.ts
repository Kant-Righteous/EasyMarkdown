import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, source, fileAccessSource, styles] = await Promise.all([
  readFile(new URL("../src/mobile/index.html", import.meta.url), "utf8"),
  readFile(new URL("../src/mobile/main.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/mobile/fileAccess.ts", import.meta.url), "utf8"),
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
  assert.match(html, /id="mobile-recent-files"/);
  assert.match(html, /id="mobile-outline"/);
  assert.doesNotMatch(html, /产品说明\.md|开发计划\.md|主要功能|任务清单|附录/);
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
  assert.match(fileAccessSource, /@tauri-apps\/plugin-fs/);
  assert.match(fileAccessSource, /read_file/);
  assert.match(fileAccessSource, /write_file/);
  assert.match(fileAccessSource, /readTextFile/);
  assert.match(fileAccessSource, /writeTextFile/);
  assert.match(source, /rename_file/);
  assert.match(source, /export_markdown_pdf/);
  assert.doesNotMatch(source, /open: \(\) => undefined/);
  assert.doesNotMatch(source, /"save-as": \(\) => undefined/);
  assert.doesNotMatch(source, /"export-pdf": \(\) => undefined/);
  assert.match(source, /data-mobile-menu-trigger/);
  assert.match(source, /data-mobile-drawer-open/);
  assert.match(source, /data-mobile-hide-tools/);
  assert.match(source, /bindMobileSidebar/);
  assert.match(source, /bindMobileAiMode/);
  assert.match(source, /bindPreviewLinks/);
  assert.match(source, /bindSplitScrollSync/);
  assert.match(source, /bindTaskListInteraction/);
  assert.match(source, /decoratePreviewCopyBlocks/);
  assert.match(source, /addRecentFile/);
  assert.match(source, /replaceRecentFile/);
  assert.doesNotMatch(source, /\.\.\/desktop|\/desktop\//);
});

test("mobile AI and sidebar markup are dynamic containers", () => {
  assert.match(html, /id="ai-mode-toggle"/);
  assert.match(html, /id="ai-bar"/);
  assert.match(html, /data-command="ai-prompt"/);
  assert.match(html, /data-command="ai-response"/);
  assert.match(html, /id="mobile-recent-files"/);
  assert.match(html, /id="mobile-outline"/);
  assert.doesNotMatch(html, /class="mobile-drawer-item">[^<]+\.md<\/div>/);
  assert.doesNotMatch(html, /class="mobile-drawer-item mobile-outline-child">/);
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

test("mobile preview constrains rich Markdown and MDX content", () => {
  assert.match(styles, /#preview\s*\{[^}]*width:\s*min\(100%, 72ch\)/s);
  assert.match(styles, /#preview\s*\{[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(styles, /#preview h1\s*\{[^}]*font-size:\s*28px/s);
  assert.match(styles, /#preview a\s*\{[^}]*word-break:\s*break-word/s);
  assert.match(styles, /#preview img,\s*#preview svg,\s*#preview canvas,\s*#preview video,\s*#preview iframe\s*\{[^}]*max-width:\s*100%/s);
  assert.match(styles, /#preview table\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(styles, /#preview \.mdx-icon\s*\{/);
  assert.match(styles, /#preview \.mdx-icon svg\s*\{[^}]*width:\s*100%/s);
  assert.match(styles, /#preview \.mdx-card-group\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(styles, /#preview \.mdx-card\s*\{/);
  assert.match(styles, /#preview \.mdx-tabs-expanded\s*\{/);
  assert.match(styles, /#preview \.mdx-tab-section\s*\{/);
  assert.match(styles, /#preview \.mdx-html\s*\{/);
  assert.match(styles, /#preview video\.mdx-media,\s*#preview img\.mdx-media\s*\{/);
});
