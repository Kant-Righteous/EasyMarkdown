import test from "node:test";
import assert from "node:assert/strict";
import {
  createSaveQueue,
  getSaveAsDefaultPath,
  performSave,
} from "../src/shared/utils/saveFlow.ts";

test("取消另存为时不写入文件", async () => {
  let writeCount = 0;
  const result = await performSave({
    path: null,
    selectPath: async () => null,
    readContent: () => "draft",
    write: async () => {
      writeCount += 1;
      return { path: "C:\\docs\\note.md", content: "draft" };
    },
  });

  assert.deepEqual(result, { status: "cancelled" });
  assert.equal(writeCount, 0);
});

test("保存对话框异常会转为失败结果", async () => {
  const error = new Error("dialog unavailable");
  const result = await performSave({
    path: null,
    selectPath: async () => {
      throw error;
    },
    readContent: () => "draft",
    write: async () => ({ path: "C:\\docs\\note.md", content: "draft" }),
  });

  assert.equal(result.status, "failed");
  assert.equal(result.status === "failed" && result.error, error);
});

test("磁盘写入异常会转为失败结果", async () => {
  const error = new Error("access denied");
  const result = await performSave({
    path: "C:\\docs\\note.md",
    selectPath: async () => null,
    readContent: () => "draft",
    write: async () => {
      throw error;
    },
  });

  assert.equal(result.status, "failed");
  assert.equal(result.status === "failed" && result.error, error);
});

test("保存成功返回实际写入的内容快照", async () => {
  const writes: Array<{ path: string; content: string }> = [];
  const result = await performSave({
    path: "C:\\docs\\note.md",
    selectPath: async () => null,
    readContent: () => "saved content",
    write: async (path, content) => {
      writes.push({ path, content });
      return { path, content };
    },
  });

  assert.deepEqual(result, {
    status: "saved",
    path: "C:\\docs\\note.md",
    content: "saved content",
  });
  assert.deepEqual(writes, [
    { path: "C:\\docs\\note.md", content: "saved content" },
  ]);
});

test("后端读回内容不一致时不能标记为已保存", async () => {
  const result = await performSave({
    path: "C:\\docs\\note.md",
    selectPath: async () => null,
    readContent: () => "new content",
    write: async (path) => ({ path, content: "old content" }),
  });

  assert.equal(result.status, "failed");
});

test("保存成功使用后端确认的规范化路径", async () => {
  const result = await performSave({
    path: "C:\\docs\\..\\docs\\note.md",
    selectPath: async () => null,
    readContent: () => "saved content",
    write: async () => ({
      path: "C:\\docs\\note.md",
      content: "saved content",
    }),
  });

  assert.deepEqual(result, {
    status: "saved",
    path: "C:\\docs\\note.md",
    content: "saved content",
  });
});

test("连续保存严格串行，后一次不会先写回", async () => {
  const enqueue = createSaveQueue();
  const events: string[] = [];
  let releaseFirst!: () => void;
  const firstBlocked = new Promise<void>((resolve) => {
    releaseFirst = resolve;
  });

  const first = enqueue(async () => {
    events.push("first-start");
    await firstBlocked;
    events.push("first-end");
    return true;
  });
  const second = enqueue(async () => {
    events.push("second-start");
    events.push("second-end");
    return true;
  });

  await Promise.resolve();
  assert.deepEqual(events, ["first-start"]);
  releaseFirst();
  await Promise.all([first, second]);
  assert.deepEqual(events, [
    "first-start",
    "first-end",
    "second-start",
    "second-end",
  ]);
});

test("另存为已有文件时默认使用完整当前路径", () => {
  assert.equal(
    getSaveAsDefaultPath(
      "C:\\docs\\note.md",
      "note.md",
      "Untitled.md",
    ),
    "C:\\docs\\note.md",
  );
  assert.equal(
    getSaveAsDefaultPath(null, "Untitled.md", "Untitled.md"),
    "Untitled.md",
  );
});
