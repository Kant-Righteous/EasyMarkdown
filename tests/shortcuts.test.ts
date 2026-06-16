import test from "node:test";
import assert from "node:assert/strict";
import { getShortcutAction } from "../src/shared/utils/shortcutAction.ts";

const ctrlEvent = (key: string) => ({
  key,
  ctrlKey: true,
  metaKey: false,
  altKey: false,
});

test("Ctrl 快捷键映射到唯一动作", () => {
  assert.equal(getShortcutAction(ctrlEvent("s")), "save");
  assert.equal(getShortcutAction(ctrlEvent("z")), "undo");
  assert.equal(getShortcutAction(ctrlEvent("y")), "redo");
  assert.equal(getShortcutAction(ctrlEvent("b")), "bold");
  assert.equal(getShortcutAction(ctrlEvent("i")), "italic");
  assert.equal(getShortcutAction(ctrlEvent("k")), "link");
});

test("Meta、Alt 和未知按键不触发动作", () => {
  assert.equal(
    getShortcutAction({
      key: "s",
      ctrlKey: false,
      metaKey: true,
      altKey: false,
    }),
    null,
  );
  assert.equal(
    getShortcutAction({
      key: "s",
      ctrlKey: true,
      metaKey: false,
      altKey: true,
    }),
    null,
  );
  assert.equal(getShortcutAction(ctrlEvent("q")), null);
});
