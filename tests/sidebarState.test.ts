import test from "node:test";
import assert from "node:assert/strict";
import {
  clampSidebarWidth,
  getSidebarWidthFromPointer,
  isSameSidebarFilePath,
  loadSidebarOpen,
  loadSidebarWidth,
  normalizeSidebarTab,
  saveSidebarOpen,
  saveSidebarWidth,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_OPEN_KEY,
  SIDEBAR_WIDTH_KEY,
} from "../src/shared/state/sidebarState.ts";

test("sidebar defaults open and persists explicit state", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };

  assert.equal(loadSidebarOpen(storage), true);
  saveSidebarOpen(false, storage);
  assert.equal(values.get(SIDEBAR_OPEN_KEY), "false");
  assert.equal(loadSidebarOpen(storage), false);
});

test("sidebar tab accepts files and outline only", () => {
  assert.equal(normalizeSidebarTab("files"), "files");
  assert.equal(normalizeSidebarTab("outline"), "outline");
  assert.equal(normalizeSidebarTab("settings"), "files");
  assert.equal(normalizeSidebarTab(undefined), "files");
});

test("sidebar width defaults, persists and rejects invalid values", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };

  assert.equal(loadSidebarWidth(storage, 1200), SIDEBAR_DEFAULT_WIDTH);
  saveSidebarWidth(320, storage);
  assert.equal(values.get(SIDEBAR_WIDTH_KEY), "320");
  assert.equal(loadSidebarWidth(storage, 1200), 320);

  values.set(SIDEBAR_WIDTH_KEY, "invalid");
  assert.equal(loadSidebarWidth(storage, 1200), SIDEBAR_DEFAULT_WIDTH);
});

test("sidebar width is constrained by desktop and viewport limits", () => {
  assert.equal(clampSidebarWidth(100, 1200), SIDEBAR_MIN_WIDTH);
  assert.equal(clampSidebarWidth(900, 1200), SIDEBAR_MAX_WIDTH);
  assert.equal(clampSidebarWidth(900, 700), 380);
});

test("sidebar width follows the pointer relative to the shell", () => {
  assert.equal(getSidebarWidthFromPointer(390, 80, 1200), 310);
  assert.equal(
    getSidebarWidthFromPointer(100, 80, 1200),
    SIDEBAR_MIN_WIDTH,
  );
});

test("sidebar file selection compares Windows paths case-insensitively", () => {
  assert.equal(
    isSameSidebarFilePath(
      "C:\\Users\\CZY\\Desktop\\Note.md",
      "c:/users/czy/desktop/note.md",
    ),
    true,
  );
  assert.equal(
    isSameSidebarFilePath("C:\\docs\\one.md", "C:\\docs\\two.md"),
    false,
  );
  assert.equal(isSameSidebarFilePath(null, null), true);
  assert.equal(isSameSidebarFilePath("C:\\docs\\one.md", null), false);
});
