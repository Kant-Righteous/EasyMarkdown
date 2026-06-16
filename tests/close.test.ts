import test from "node:test";
import assert from "node:assert/strict";
import { getCloseAction, getCloseDecision } from "../src/shared/utils/close.ts";

test("已保存内容允许系统默认关闭", () => {
  assert.equal(getCloseAction(false), "default");
});

test("将关闭弹窗结果映射为保存、放弃或取消", () => {
  const labels = {
    save: "Save and Close",
    discard: "Close Without Saving",
  };

  assert.equal(getCloseDecision("Save and Close", labels), "save");
  assert.equal(
    getCloseDecision("Close Without Saving", labels),
    "discard",
  );
  assert.equal(getCloseDecision("Cancel", labels), "cancel");
});

test("放弃未保存内容后强制关闭窗口", () => {
  assert.equal(getCloseAction(true, "discard"), "destroy");
});

test("保存成功后强制关闭窗口", () => {
  assert.equal(getCloseAction(true, "save", true), "destroy");
});

test("取消关闭或保存失败时保持窗口打开", () => {
  assert.equal(getCloseAction(true, "cancel"), "keep-open");
  assert.equal(getCloseAction(true, "save", false), "keep-open");
});
