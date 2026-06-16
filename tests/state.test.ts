import test from "node:test";
import assert from "node:assert/strict";
import { calculateDirtyState } from "../src/shared/state/state.ts";

test("相同内容保持已保存状态", () => {
  assert.equal(calculateDirtyState("# 文档", "# 文档"), false);
});

test("不同内容标记为未保存", () => {
  assert.equal(calculateDirtyState("# 已修改", "# 文档"), true);
});

test("内容恢复为保存基线后重新标记为已保存", () => {
  assert.equal(calculateDirtyState("原始内容", "原始内容"), false);
});
