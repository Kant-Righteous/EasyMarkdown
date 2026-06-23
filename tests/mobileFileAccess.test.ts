import test from "node:test";
import assert from "node:assert/strict";
import { performSave } from "../src/shared/utils/saveFlow.ts";
import {
  fileNameFromDocumentReference,
  getMobileSaveDefaultReference,
  getUnsupportedRenameMessage,
  openSelectedMobileDocument,
  readMobileDocument,
  writeMobileDocument,
  type MobileFileIo,
} from "../src/mobile/fileAccess.ts";

function createIo(options: {
  read?: (path: string) => Promise<string>;
  write?: (path: string, content: string) => Promise<void>;
  invoke?: <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
} = {}): MobileFileIo & {
  invoked: Array<{ command: string; args?: Record<string, unknown> }>;
  fsReads: string[];
  fsWrites: Array<{ path: string; content: string }>;
} {
  const invoked: Array<{ command: string; args?: Record<string, unknown> }> = [];
  const fsReads: string[] = [];
  const fsWrites: Array<{ path: string; content: string }> = [];
  return {
    invoked,
    fsReads,
    fsWrites,
    invoke: async <T>(command: string, args?: Record<string, unknown>) => {
      invoked.push({ command, args });
      if (options.invoke) return options.invoke<T>(command, args);
      if (command === "read_file") return "desktop content" as T;
      if (command === "write_file") {
        return {
          path: String(args?.path),
          content: String(args?.content),
        } as T;
      }
      throw new Error(`Unexpected command: ${command}`);
    },
    readTextFile: async (path: string) => {
      fsReads.push(path);
      return options.read ? options.read(path) : "uri content";
    },
    writeTextFile: async (path: string, content: string) => {
      fsWrites.push({ path, content });
      if (options.write) await options.write(path, content);
    },
  };
}

test("普通桌面路径仍走原有 Rust 文件命令", async () => {
  const io = createIo();
  const path = "C:\\docs\\note.md";

  assert.equal(await readMobileDocument(path, io), "desktop content");
  assert.deepEqual(await writeMobileDocument(path, "changed", io), {
    path,
    content: "changed",
  });
  assert.deepEqual(
    io.invoked.map((entry) => entry.command),
    ["read_file", "write_file"],
  );
  assert.deepEqual(io.fsReads, []);
  assert.deepEqual(io.fsWrites, []);
});

test("Android content URI 使用 fs 插件读写，不进入 std::fs 命令", async () => {
  const uri =
    "content://com.android.providers.downloads.documents/document/primary%3Anote.md";
  const io = createIo({ read: async () => "changed" });

  assert.equal(await readMobileDocument(uri, io), "changed");
  assert.deepEqual(await writeMobileDocument(uri, "changed", io), {
    path: uri,
    content: "changed",
  });
  assert.deepEqual(io.invoked, []);
  assert.deepEqual(io.fsReads, [uri, uri]);
  assert.deepEqual(io.fsWrites, [{ path: uri, content: "changed" }]);
});

test("URI 打开成功、失败和取消都有明确结果", async () => {
  const uri = "content://provider/document/primary%3Aok.md";
  assert.equal(await readMobileDocument(uri, createIo()), "uri content");
  await assert.rejects(
    readMobileDocument(
      "content://provider/document/missing",
      createIo({
        read: async () => {
          throw new Error("授权已失效或文件不存在");
        },
      }),
    ),
    /授权已失效|文件不存在/,
  );

  let opened = false;
  assert.equal(
    await openSelectedMobileDocument(null, async () => {
      opened = true;
      return true;
    }),
    false,
  );
  assert.equal(opened, false);
  assert.equal(
    await openSelectedMobileDocument(uri, async (reference) => reference === uri),
    true,
  );
});

test("URI 保存成功和失败会被 performSave 正确映射", async () => {
  const uri = "content://provider/document/primary%3Asave.md";
  const saved = await performSave({
    path: uri,
    selectPath: async () => null,
    readContent: () => "saved",
    write: (path, content) =>
      writeMobileDocument(path, content, createIo({ read: async () => "saved" })),
  });
  assert.deepEqual(saved, { status: "saved", path: uri, content: "saved" });

  const failed = await performSave({
    path: uri,
    selectPath: async () => null,
    readContent: () => "new content",
    write: (path, content) =>
      writeMobileDocument(path, content, createIo({ read: async () => "old content" })),
  });
  assert.equal(failed.status, "failed");
});

test("保存失败不会产生可用于重置 dirty 状态的 saved 结果", async () => {
  const result = await performSave({
    path: "content://provider/document/no-write",
    selectPath: async () => null,
    readContent: () => "draft",
    write: (path, content) =>
      writeMobileDocument(
        path,
        content,
        createIo({
          write: async () => {
            throw new Error("permission denied");
          },
        }),
      ),
  });

  assert.equal(result.status, "failed");
});

test("另存为 content URI 使用文件名作为默认建议而不是 URI", () => {
  assert.equal(
    getMobileSaveDefaultReference(
      "content://provider/document/primary%3ADownload%2Fnote.md",
      "note.md",
      "未命名.md",
    ),
    "note.md",
  );
  assert.equal(
    getMobileSaveDefaultReference("C:\\docs\\note.md", "note.md", "未命名.md"),
    "C:\\docs\\note.md",
  );
});

test("URI 文件名解析和重命名不支持时的回退提示", () => {
  const uri = "content://provider/document/primary%3ADownload%2Fnote.md";
  assert.equal(fileNameFromDocumentReference(uri, "未命名.md"), "note.md");
  assert.match(getUnsupportedRenameMessage(uri) ?? "", /另存为/);
  assert.equal(getUnsupportedRenameMessage("C:\\docs\\note.md"), null);
});
