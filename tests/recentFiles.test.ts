import test from "node:test";
import assert from "node:assert/strict";
import {
  addRecentFile,
  clearRecentFiles,
  loadRecentFiles,
  removeRecentFile,
  replaceRecentFile,
  type StorageLike,
} from "../src/shared/utils/recentFiles.ts";

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

test("过滤损坏数据和非法路径，同时保留 Android URI", () => {
  assert.deepEqual(loadRecentFiles(storage("{broken")), []);
  const uri =
    "content://com.android.providers.downloads.documents/document/primary%3Aa.md";
  assert.deepEqual(
    loadRecentFiles(
      storage(
        JSON.stringify([
          "C:\\docs\\a.md",
          uri,
          1,
          "relative.md",
          "/tmp/b.md",
        ]),
      ),
    ),
    ["C:\\docs\\a.md", uri, "/tmp/b.md"],
  );
});

test("支持移除和清空", () => {
  const store = storage(JSON.stringify(["C:\\a.md", "C:\\b.md"]));
  removeRecentFile("C:\\a.md", store);
  assert.deepEqual(loadRecentFiles(store), ["C:\\b.md"]);
  clearRecentFiles(store);
  assert.deepEqual(loadRecentFiles(store), []);
});

test("重命名后原位置替换最近文件路径", () => {
  const store = storage(JSON.stringify(["C:\\a.md", "C:\\b.md"]));
  replaceRecentFile("C:\\a.md", "C:\\renamed.md", store);
  assert.deepEqual(loadRecentFiles(store), ["C:\\renamed.md", "C:\\b.md"]);
});

test("最近文件对普通路径和 URI 分别去重", () => {
  const store = storage();
  const uri =
    "content://com.android.providers.downloads.documents/document/primary%3Aa.md";
  addRecentFile("C:\\docs\\a.md", store);
  addRecentFile(uri, store);
  addRecentFile("C:\\docs\\a.md", store);
  addRecentFile(uri, store);

  assert.deepEqual(loadRecentFiles(store), [uri, "C:\\docs\\a.md"]);
});
