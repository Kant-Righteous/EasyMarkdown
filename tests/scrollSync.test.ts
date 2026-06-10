import test from "node:test";
import assert from "node:assert/strict";
import { calculateSyncedScrollTop } from "../src/scrollSync.ts";

test("按可滚动距离比例同步滚动位置", () => {
  assert.equal(
    calculateSyncedScrollTop(
      { scrollTop: 300, scrollHeight: 1000, clientHeight: 400 },
      { scrollHeight: 1800, clientHeight: 600 },
    ),
    600,
  );
});

test("源区域或目标区域不可滚动时回到顶部", () => {
  assert.equal(
    calculateSyncedScrollTop(
      { scrollTop: 0, scrollHeight: 400, clientHeight: 400 },
      { scrollHeight: 1000, clientHeight: 400 },
    ),
    0,
  );
  assert.equal(
    calculateSyncedScrollTop(
      { scrollTop: 200, scrollHeight: 800, clientHeight: 400 },
      { scrollHeight: 500, clientHeight: 500 },
    ),
    0,
  );
});

test("滚动位置限制在有效范围内", () => {
  assert.equal(
    calculateSyncedScrollTop(
      { scrollTop: 900, scrollHeight: 1000, clientHeight: 400 },
      { scrollHeight: 1000, clientHeight: 400 },
    ),
    600,
  );
});
