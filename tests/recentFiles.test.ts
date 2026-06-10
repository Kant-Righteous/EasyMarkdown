import test from "node:test";
import assert from "node:assert/strict";
import {
  addRecentFile,
  clearRecentFiles,
  loadRecentFiles,
  removeRecentFile,
  type StorageLike,
} from "../src/recentFiles.ts";

function storage(initial: string | null = null): StorageLike {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key, next) => {
      value = next;
    },
    removeItem: () => {
      value = null;
    },
  };
}

test("最近文件置顶、去重并限制为 10 条", () => {
  const store = storage();
  for (let index = 0; index < 12; index += 1) {
    addRecentFile(`C:\\docs\\${index}.md`, store);
  }
  addRecentFile("C:\\docs\\5.md", store);

  const paths = loadRecentFiles(store);
  assert.equal(paths.length, 10);
  assert.equal(paths[0], "C:\\docs\\5.md");
  assert.equal(paths.filter((path) => path === "C:\\docs\\5.md").length, 1);
});

test("过滤损坏数据和非法路径", () => {
  assert.deepEqual(loadRecentFiles(storage("{broken")), []);
  assert.deepEqual(
    loadRecentFiles(
      storage(JSON.stringify(["C:\\docs\\a.md", 1, "relative.md", "/tmp/b.md"])),
    ),
    ["C:\\docs\\a.md", "/tmp/b.md"],
  );
});

test("支持移除和清空", () => {
  const store = storage(JSON.stringify(["C:\\a.md", "C:\\b.md"]));
  removeRecentFile("C:\\a.md", store);
  assert.deepEqual(loadRecentFiles(store), ["C:\\b.md"]);
  clearRecentFiles(store);
  assert.deepEqual(loadRecentFiles(store), []);
});
