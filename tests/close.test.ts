import test from "node:test";
import assert from "node:assert/strict";
import { getCloseAction } from "../src/close.ts";

test("已保存内容允许系统默认关闭", () => {
  assert.equal(getCloseAction(false), "default");
});

test("放弃未保存内容后强制关闭窗口", () => {
  assert.equal(getCloseAction(true, false), "destroy");
});

test("保存成功后强制关闭窗口", () => {
  assert.equal(getCloseAction(true, true, true), "destroy");
});

test("取消保存或保存失败时保持窗口打开", () => {
  assert.equal(getCloseAction(true, true, false), "keep-open");
});
