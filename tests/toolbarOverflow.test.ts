import test from "node:test";
import assert from "node:assert/strict";
import {
  PROTECTED_FORMAT_COMMANDS,
  TOOLBAR_OVERFLOW_ORDER,
  canOverflowCommand,
} from "../src/toolbarOverflow.ts";

test("工具栏按确认顺序收纳低优先级命令", () => {
  assert.deepEqual(TOOLBAR_OVERFLOW_ORDER, [
    "italic",
    "underline",
    "strikethrough",
    "task-list",
    "footnote",
    "horizontal-rule",
    "table",
  ]);
});

test("标题、块级和指定高优先级命令不会被收纳", () => {
  const expected = [
    "h1",
    "h2",
    "h3",
    "bold",
    "highlight",
    "unordered-list",
    "ordered-list",
    "blockquote",
    "code-block",
    "formula-block",
    "chart",
    "link",
    "image",
    "inline-code",
    "inline-formula",
  ];

  assert.deepEqual([...PROTECTED_FORMAT_COMMANDS], expected);
  expected.forEach((command) => assert.equal(canOverflowCommand(command), false));
  TOOLBAR_OVERFLOW_ORDER.forEach((command) =>
    assert.equal(canOverflowCommand(command), true),
  );
});
