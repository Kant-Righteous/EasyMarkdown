import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [mainSource, editorSource, interactionSource] = await Promise.all([
  readFile(new URL("../src/desktop/main.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/shared/editor.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/shared/markdown/taskListInteraction.ts", import.meta.url), "utf8"),
]);

test("application binds preview task-list interaction", () => {
  assert.match(mainSource, /bindTaskListInteraction\(/);
  assert.match(mainSource, /setContentPreservingView/);
});

test("preview task changes use the editor notification path", () => {
  assert.match(editorSource, /export function setContentPreservingView/);
  assert.match(interactionSource, /toggleTaskAtSourceLine/);
  assert.match(interactionSource, /data-source-line/);
});
