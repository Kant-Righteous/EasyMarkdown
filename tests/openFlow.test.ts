import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOpenFileUrl,
  createRecentWindowLabel,
  getOpenDecision,
  parseOpenFilePath,
} from "../src/openFlow.ts";

test("将弹窗结果映射为打开决策", () => {
  assert.equal(getOpenDecision("保存并打开"), "save");
  assert.equal(getOpenDecision("不保存并打开"), "discard");
  assert.equal(getOpenDecision("取消打开"), "cancel");
  assert.equal(getOpenDecision("未知结果"), "cancel");
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
