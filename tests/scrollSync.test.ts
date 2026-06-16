import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateAnchoredScrollTop,
  calculateSyncedScrollTop,
} from "../src/desktop/scrollSync.ts";

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

test("按照源码行锚点同步不同高度的内容块", () => {
  const editorAnchors = [
    { line: 0, top: 0 },
    { line: 10, top: 200 },
    { line: 20, top: 400 },
  ];
  const previewAnchors = [
    { line: 0, top: 0 },
    { line: 10, top: 600 },
    { line: 20, top: 800 },
  ];

  assert.equal(
    calculateAnchoredScrollTop(100, editorAnchors, previewAnchors),
    300,
  );
  assert.equal(
    calculateAnchoredScrollTop(300, editorAnchors, previewAnchors),
    700,
  );
});

test("锚点不足时返回空结果以便回退到比例同步", () => {
  assert.equal(
    calculateAnchoredScrollTop(
      100,
      [{ line: 0, top: 0 }],
      [{ line: 0, top: 0 }],
    ),
    null,
  );
});
