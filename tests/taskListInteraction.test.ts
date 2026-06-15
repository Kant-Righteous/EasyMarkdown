import test from "node:test";
import assert from "node:assert/strict";
import { toggleTaskAtSourceLine } from "../src/taskListInteraction.ts";

test("checks the task at the requested source line", () => {
  const markdown = "- [ ] 第一项\n- [ ] 第二项";

  assert.equal(
    toggleTaskAtSourceLine(markdown, 1, true),
    "- [ ] 第一项\n- [x] 第二项",
  );
});

test("unchecks uppercase and lowercase completed task markers", () => {
  assert.equal(toggleTaskAtSourceLine("- [X] 第一项", 0, false), "- [ ] 第一项");
  assert.equal(toggleTaskAtSourceLine("- [x] 第一项", 0, false), "- [ ] 第一项");
});

test("uses source line rather than duplicate task text", () => {
  const markdown = "- [ ] 相同任务\n- [ ] 相同任务";

  assert.equal(
    toggleTaskAtSourceLine(markdown, 1, true),
    "- [ ] 相同任务\n- [x] 相同任务",
  );
});

test("supports nested and ordered task items", () => {
  const markdown = "- [ ] 父任务\n  - [ ] 子任务\n1. [ ] 有序任务";

  assert.equal(
    toggleTaskAtSourceLine(markdown, 1, true),
    "- [ ] 父任务\n  - [x] 子任务\n1. [ ] 有序任务",
  );
  assert.equal(
    toggleTaskAtSourceLine(markdown, 2, true),
    "- [ ] 父任务\n  - [ ] 子任务\n1. [x] 有序任务",
  );
});

test("leaves non-task and invalid source lines unchanged", () => {
  const markdown = "普通文字\n- [ ] 任务";

  assert.equal(toggleTaskAtSourceLine(markdown, 0, true), markdown);
  assert.equal(toggleTaskAtSourceLine(markdown, -1, true), markdown);
  assert.equal(toggleTaskAtSourceLine(markdown, 10, true), markdown);
});

test("preserves CRLF line endings", () => {
  const markdown = "- [ ] 第一项\r\n- [ ] 第二项";

  assert.equal(
    toggleTaskAtSourceLine(markdown, 1, true),
    "- [ ] 第一项\r\n- [x] 第二项",
  );
});
