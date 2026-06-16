import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../src/desktop/index.html", import.meta.url), "utf8");

test("sidebar toggle appears before the heading formatting group", () => {
  const toggleIndex = html.indexOf('id="sidebar-toggle"');
  const headingIndex = html.indexOf('data-i18n-aria-label="format.headingGroup"');

  assert.ok(toggleIndex >= 0);
  assert.ok(headingIndex >= 0);
  assert.ok(toggleIndex < headingIndex);
});

test("sidebar exposes files and outline tabs with panels", () => {
  assert.match(html, /id="sidebar"/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /data-sidebar-tab="files"/);
  assert.match(html, /data-sidebar-tab="outline"/);
  assert.match(html, /id="sidebar-files-panel"[^>]*role="tabpanel"/);
  assert.match(html, /id="sidebar-outline-panel"[^>]*role="tabpanel"/);
  assert.match(html, /id="sidebar-recent-files"/);
  assert.match(html, /id="sidebar-outline"/);
});

test("sidebar exposes an accessible resize separator", () => {
  assert.match(html, /id="sidebar-resizer"/);
  assert.match(html, /role="separator"/);
  assert.match(html, /aria-orientation="vertical"/);
  assert.match(html, /aria-controls="sidebar"/);
  assert.match(html, /tabindex="0"/);
});

test("split view exposes an accessible resize separator between panes", () => {
  const editorIndex = html.indexOf('class="editor-pane"');
  const resizerIndex = html.indexOf('id="split-resizer"');
  const previewIndex = html.indexOf('class="preview-pane"');

  assert.ok(editorIndex >= 0);
  assert.ok(resizerIndex > editorIndex);
  assert.ok(previewIndex > resizerIndex);
  assert.match(html, /id="split-resizer"[\s\S]*role="separator"/);
  assert.match(html, /id="split-resizer"[\s\S]*aria-orientation="vertical"/);
});

test("file menu and page expose rename and custom context menu controls", () => {
  assert.match(html, /data-command="rename"/);
  assert.match(html, /id="context-menu"[^>]*role="menu"/);
  assert.match(html, /id="rename-dialog"/);
  assert.match(html, /id="rename-input"/);
});

test("format toolbar exposes five groups and all confirmed commands", () => {
  const commands = [
    "h1",
    "h2",
    "h3",
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
  ];

  [
    "headingGroup",
    "emphasisGroup",
    "listGroup",
    "blockGroup",
    "insertGroup",
  ].forEach((group) => {
    assert.match(html, new RegExp(`data-format-group="${group}"`));
  });
  commands.forEach((command) => {
    assert.match(html, new RegExp(`data-command="${command}"`));
  });
  assert.equal(
    [...html.matchAll(/class="format-overflow-panel/g)].length,
    5,
  );
  assert.match(html, /class="format-icon"/);
});

test("quote and footnote commands use consistent line icons", () => {
  assert.match(
    html,
    /data-command="blockquote"[\s\S]*?<svg class="format-icon format-icon-quote"/,
  );
  assert.match(
    html,
    /data-command="footnote"[\s\S]*?<svg class="format-icon format-icon-footnote"/,
  );
  assert.doesNotMatch(
    html,
    /data-command="footnote"[^>]*>[\s\S]*?class="format-symbol format-footnote"/,
  );
});
