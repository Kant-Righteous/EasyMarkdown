import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOpenFileUrl,
  createRecentWindowLabel,
  getOpenDecision,
  getOpenTarget,
  parseOpenFilePath,
} from "../src/shared/utils/openFlow.ts";

test("将弹窗结果映射为打开决策", () => {
  const labels = { save: "Save and Open", discard: "Open Without Saving" };
  assert.equal(getOpenDecision("Save and Open", labels), "save");
  assert.equal(getOpenDecision("Open Without Saving", labels), "discard");
  assert.equal(getOpenDecision("Cancel", labels), "cancel");
  assert.equal(getOpenDecision("Unknown", labels), "cancel");
});

test("将打开方式弹窗结果映射为当前窗口、新窗口或取消", () => {
  const labels = {
    current: "Open in Current Window",
    newWindow: "Open in New Window",
  };
  assert.equal(getOpenTarget("Open in Current Window", labels), "current");
  assert.equal(getOpenTarget("Open in New Window", labels), "new");
  assert.equal(getOpenTarget("Cancel", labels), "cancel");
  assert.equal(getOpenTarget("Unknown", labels), "cancel");
});

test("新窗口 URL 可无损传递文件路径", () => {
  const path = "C:\\我的文档\\a b&c.md";
  const url = buildOpenFileUrl(path);

  assert.equal(parseOpenFilePath(new URL(url, "http://localhost").search), path);
  assert.equal(parseOpenFilePath("?other=value"), null);
});

test("新窗口标签格式合法且序号不同", () => {
  assert.equal(createRecentWindowLabel(1000, 2), "recent-1000-2");
  assert.notEqual(
    createRecentWindowLabel(1000, 2),
    createRecentWindowLabel(1000, 3),
  );
});
