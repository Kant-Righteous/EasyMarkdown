# EasyMarkdown 最近打开 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在“文件”菜单中增加最多 10 条最近文件记录，并支持在当前窗口或新窗口打开，同时安全处理未保存修改。

**Architecture:** 使用 `recentFiles.ts` 管理 `localStorage` 中的路径列表和变更订阅；使用 `openFlow.ts` 封装三按钮决策、窗口 URL 和唯一标签等纯逻辑；`file.ts` 负责文件读写、保存前确认和当前窗口加载；`toolbar.ts` 动态渲染三级菜单并创建 Tauri Webview 窗口。动态窗口通过 URL 查询参数加载文件，并由 `recent-*` capability 获得与主窗口相同的必要权限。

**Tech Stack:** TypeScript 5.6, Vanilla HTML/CSS, Node test runner, Tauri 2, `@tauri-apps/plugin-dialog` 2.7

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `src/recentFiles.ts` | 最近文件数据校验、排序、去重、截断、持久化和订阅 |
| `src/openFlow.ts` | 未保存文档打开决策、新窗口 URL 参数和窗口标签纯逻辑 |
| `src/file.ts` | 按路径读取、当前窗口打开、保存并更新最近记录 |
| `src/toolbar.ts` | 渲染嵌套菜单、分发当前窗口/新窗口操作 |
| `src/main.ts` | 初始化菜单，并读取新窗口 URL 中的目标文件 |
| `index.html` | “最近打开”子菜单静态入口 |
| `src/style.css` | 二级/三级菜单、文件名省略和空状态样式 |
| `src-tauri/capabilities/default.json` | 允许主窗口创建 Webview 窗口，并授权 `recent-*` 动态窗口 |
| `tests/recentFiles.test.ts` | 最近记录行为测试 |
| `tests/openFlow.test.ts` | 三选项决策、URL 编解码和窗口标签测试 |

---

### Task 1: 实现最近文件纯数据模型

**Files:**
- Create: `tests/recentFiles.test.ts`
- Create: `src/recentFiles.ts`

- [ ] **Step 1: 写入最近文件行为测试**

创建 `tests/recentFiles.test.ts`：

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import {
  addRecentFile,
  clearRecentFiles,
  loadRecentFiles,
  removeRecentFile,
  type StorageLike,
} from "../src/recentFiles.ts";

function createStorage(initial?: string): StorageLike {
  let value = initial ?? null;
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

test("新路径加入首位并按路径去重", () => {
  const storage = createStorage();
  addRecentFile("C:\\docs\\a.md", storage);
  addRecentFile("C:\\docs\\b.md", storage);
  addRecentFile("C:\\docs\\a.md", storage);

  assert.deepEqual(loadRecentFiles(storage), [
    "C:\\docs\\a.md",
    "C:\\docs\\b.md",
  ]);
});

test("最近记录最多保留 10 条", () => {
  const storage = createStorage();
  for (let index = 0; index < 12; index += 1) {
    addRecentFile(`C:\\docs\\${index}.md`, storage);
  }

  assert.deepEqual(
    loadRecentFiles(storage),
    Array.from({ length: 10 }, (_, index) => `C:\\docs\\${11 - index}.md`),
  );
});

test("损坏数据和非字符串成员回退为有效路径列表", () => {
  assert.deepEqual(loadRecentFiles(createStorage("{broken")), []);
  assert.deepEqual(
    loadRecentFiles(
      createStorage(
        JSON.stringify(["C:\\docs\\a.md", 1, null, "relative.md", "/tmp/b.md"]),
      ),
    ),
    ["C:\\docs\\a.md", "/tmp/b.md"],
  );
});

test("存储不可用时回退为空列表且写入不抛错", () => {
  const storage: StorageLike = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
    removeItem: () => {
      throw new Error("blocked");
    },
  };

  assert.deepEqual(loadRecentFiles(storage), []);
  assert.doesNotThrow(() => addRecentFile("C:\\docs\\a.md", storage));
  assert.doesNotThrow(() => clearRecentFiles(storage));
});

test("可移除单条记录并清空全部记录", () => {
  const storage = createStorage(
    JSON.stringify(["C:\\docs\\a.md", "C:\\docs\\b.md"]),
  );
  removeRecentFile("C:\\docs\\a.md", storage);
  assert.deepEqual(loadRecentFiles(storage), ["C:\\docs\\b.md"]);

  clearRecentFiles(storage);
  assert.deepEqual(loadRecentFiles(storage), []);
});
```

- [ ] **Step 2: 运行测试并确认失败**

运行：

```powershell
npm test -- tests/recentFiles.test.ts
```

Expected: FAIL，提示无法找到 `../src/recentFiles.ts`。

- [ ] **Step 3: 实现最近文件模块**

创建 `src/recentFiles.ts`：

```typescript
export const RECENT_FILES_KEY = "easymarkdown.recent-files.v1";
export const RECENT_FILES_LIMIT = 10;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

type RecentFilesListener = (paths: readonly string[]) => void;

const listeners = new Set<RecentFilesListener>();

function normalizeRecentPath(path: string): string | null {
  const trimmed = path.trim();
  const isWindowsAbsolute = /^[A-Za-z]:[\\/]/.test(trimmed);
  const isUncPath = /^\\\\[^\\]/.test(trimmed);
  const isPosixAbsolute = trimmed.startsWith("/");
  return isWindowsAbsolute || isUncPath || isPosixAbsolute ? trimmed : null;
}

function getDefaultStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function parseRecentFiles(raw: string | null): string[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((path): path is string => typeof path === "string")
      .map(normalizeRecentPath)
      .filter((path): path is string => path !== null)
      .slice(0, RECENT_FILES_LIMIT);
  } catch {
    return [];
  }
}

export function loadRecentFiles(storage = getDefaultStorage()): string[] {
  if (!storage) return [];
  try {
    return parseRecentFiles(storage.getItem(RECENT_FILES_KEY));
  } catch {
    return [];
  }
}

function persistRecentFiles(paths: string[], storage: StorageLike | null): void {
  if (!storage) return;
  try {
    storage.setItem(RECENT_FILES_KEY, JSON.stringify(paths));
  } catch {
    return;
  }
  listeners.forEach((listener) => listener(paths));
}

export function addRecentFile(
  path: string,
  storage = getDefaultStorage(),
): string[] {
  const normalizedPath = normalizeRecentPath(path);
  if (!normalizedPath) return loadRecentFiles(storage);

  const paths = [
    normalizedPath,
    ...loadRecentFiles(storage).filter(
      (candidate) => candidate !== normalizedPath,
    ),
  ].slice(0, RECENT_FILES_LIMIT);
  persistRecentFiles(paths, storage);
  return paths;
}

export function removeRecentFile(
  path: string,
  storage = getDefaultStorage(),
): string[] {
  const paths = loadRecentFiles(storage).filter((candidate) => candidate !== path);
  persistRecentFiles(paths, storage);
  return paths;
}

export function clearRecentFiles(storage = getDefaultStorage()): void {
  if (!storage) return;
  try {
    storage.removeItem(RECENT_FILES_KEY);
  } catch {
    return;
  }
  listeners.forEach((listener) => listener([]));
}

export function subscribeRecentFiles(
  listener: RecentFilesListener,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function bindRecentFilesStorageSync(): void {
  window.addEventListener("storage", (event) => {
    if (event.key !== RECENT_FILES_KEY) return;
    const paths = parseRecentFiles(event.newValue);
    listeners.forEach((listener) => listener(paths));
  });
}
```

- [ ] **Step 4: 运行最近文件测试**

运行：

```powershell
npm test -- tests/recentFiles.test.ts
```

Expected: 5 tests PASS。

- [ ] **Step 5: 提交最近文件数据模型**

```powershell
git add -- src/recentFiles.ts tests/recentFiles.test.ts
git commit -m "feat: 添加最近文件数据模型"
```

---

### Task 2: 实现打开决策和新窗口参数

**Files:**
- Create: `tests/openFlow.test.ts`
- Create: `src/openFlow.ts`

- [ ] **Step 1: 写入纯逻辑测试**

创建 `tests/openFlow.test.ts`：

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOpenFileUrl,
  createRecentWindowLabel,
  getOpenDecision,
  parseOpenFilePath,
} from "../src/openFlow.ts";

test("自定义三按钮结果映射为打开决策", () => {
  assert.equal(getOpenDecision("保存并打开"), "save");
  assert.equal(getOpenDecision("不保存并打开"), "discard");
  assert.equal(getOpenDecision("取消打开"), "cancel");
  assert.equal(getOpenDecision("unknown"), "cancel");
});

test("文件路径经过 URL 编码后可无损解析", () => {
  const path = "C:\\我的文档\\a b&c.md";
  const url = buildOpenFileUrl(path);
  assert.equal(parseOpenFilePath(new URL(url, "http://localhost").search), path);
});

test("没有 openFile 参数时不加载文件", () => {
  assert.equal(parseOpenFilePath("?other=value"), null);
});

test("动态窗口标签只包含 Tauri 允许字符并保持唯一", () => {
  assert.equal(createRecentWindowLabel(1000, 2), "recent-1000-2");
  assert.notEqual(
    createRecentWindowLabel(1000, 2),
    createRecentWindowLabel(1000, 3),
  );
});
```

- [ ] **Step 2: 运行测试并确认失败**

运行：

```powershell
npm test -- tests/openFlow.test.ts
```

Expected: FAIL，提示无法找到 `../src/openFlow.ts`。

- [ ] **Step 3: 实现打开流程纯逻辑**

创建 `src/openFlow.ts`：

```typescript
export type OpenDecision = "save" | "discard" | "cancel";

export function getOpenDecision(result: string): OpenDecision {
  if (result === "保存并打开") return "save";
  if (result === "不保存并打开") return "discard";
  return "cancel";
}

export function buildOpenFileUrl(path: string): string {
  return `/?openFile=${encodeURIComponent(path)}`;
}

export function parseOpenFilePath(search: string): string | null {
  return new URLSearchParams(search).get("openFile");
}

export function createRecentWindowLabel(
  timestamp = Date.now(),
  sequence = Math.floor(Math.random() * 1_000_000),
): string {
  return `recent-${timestamp}-${sequence}`;
}
```

- [ ] **Step 4: 运行打开流程测试**

运行：

```powershell
npm test -- tests/openFlow.test.ts
```

Expected: 4 tests PASS。

- [ ] **Step 5: 提交打开流程纯逻辑**

```powershell
git add -- src/openFlow.ts tests/openFlow.test.ts
git commit -m "feat: 添加最近文件打开流程工具"
```

---

### Task 3: 重构文件打开与保存编排

**Files:**
- Modify: `src/file.ts`
- Modify: `tests/openFlow.test.ts`

- [ ] **Step 1: 增加保存结果对打开流程的失败测试**

在 `tests/openFlow.test.ts` 的 import 中加入 `getOpenContinuation`，再增加：

```typescript
test("保存取消或失败时终止打开目标文件", () => {
  assert.equal(getOpenContinuation("save", true), "open");
  assert.equal(getOpenContinuation("save", false), "stop");
  assert.equal(getOpenContinuation("discard"), "open");
  assert.equal(getOpenContinuation("cancel"), "stop");
});
```

- [ ] **Step 2: 运行测试并确认失败**

运行：

```powershell
npm test -- tests/openFlow.test.ts
```

Expected: FAIL，提示 `openFlow.ts` 没有导出 `getOpenContinuation`。

- [ ] **Step 3: 实现保存结果判断**

在 `src/openFlow.ts` 增加：

```typescript
export type OpenContinuation = "open" | "stop";

export function getOpenContinuation(
  decision: OpenDecision,
  saveSucceeded?: boolean,
): OpenContinuation {
  if (decision === "cancel") return "stop";
  if (decision === "save") return saveSucceeded ? "open" : "stop";
  return "open";
}
```

- [ ] **Step 4: 运行测试确认通过**

运行：

```powershell
npm test -- tests/openFlow.test.ts
```

Expected: 5 tests PASS。

- [ ] **Step 5: 在 `file.ts` 引入最近记录和三按钮对话框**

将 dialog import 改为：

```typescript
import { message, open, save } from "@tauri-apps/plugin-dialog";
```

增加 imports：

```typescript
import { getOpenContinuation, getOpenDecision } from "./openFlow";
import { addRecentFile, removeRecentFile } from "./recentFiles";
```

新增未保存处理函数：

```typescript
async function prepareForCurrentWindowOpen(): Promise<boolean> {
  if (!getState().isDirty) return true;

  const result = await message("当前文件有未保存的修改。", {
    title: "打开文件",
    kind: "warning",
    buttons: {
      yes: "保存并打开",
      no: "不保存并打开",
      cancel: "取消打开",
    },
  });
  const decision = getOpenDecision(result);
  const saveSucceeded = decision === "save" ? await saveFile() : undefined;
  return getOpenContinuation(decision, saveSucceeded) === "open";
}
```

- [ ] **Step 6: 提取指定路径读取函数**

在 `file.ts` 中新增：

```typescript
async function loadFilePath(path: string): Promise<void> {
  const content = await invoke<string>("read_file", { path });
  setContent(content);
  setState({
    currentFilePath: path,
    currentFileName: fileNameFromPath(path),
    lastSavedContent: content,
  });
  updateDirtyState(getContent());
  addRecentFile(path);
  await updateWindowTitle();
}

export async function openPathInCurrentWindow(
  path: string,
  options: { confirmUnsaved?: boolean; removeOnFailure?: boolean } = {},
): Promise<boolean> {
  const { confirmUnsaved = true, removeOnFailure = false } = options;
  if (confirmUnsaved && !(await prepareForCurrentWindowOpen())) return false;

  try {
    await loadFilePath(path);
    return true;
  } catch (error) {
    if (removeOnFailure) removeRecentFile(path);
    showError("打开文件", error);
    return false;
  }
}
```

将 `openFile()` 改为先选择路径，再走统一流程：

```typescript
export async function openFile(): Promise<void> {
  const path = await open({
    multiple: false,
    directory: false,
    filters: markdownFilters,
  });
  if (!path) return;

  await openPathInCurrentWindow(path);
}
```

- [ ] **Step 7: 保存成功后更新最近记录**

在 `writeCurrentFile()` 的 `setState(...)` 之后加入：

```typescript
addRecentFile(path);
```

这样新建文件首次保存、另存为和普通保存都会把成功写入的路径移到最近列表首位。

- [ ] **Step 8: 运行测试和构建**

运行：

```powershell
npm test
npm run build
```

Expected: 全部测试 PASS；TypeScript 和 Vite build 成功。

- [ ] **Step 9: 提交文件流程**

```powershell
git add -- src/file.ts src/openFlow.ts tests/openFlow.test.ts
git commit -m "feat: 安全处理最近文件打开与保存"
```

---

### Task 4: 添加最近打开嵌套菜单

**Files:**
- Modify: `index.html`
- Modify: `src/style.css`
- Modify: `src/toolbar.ts`

- [ ] **Step 1: 添加“最近打开”静态入口**

在 `index.html` 的“打开”按钮后加入：

```html
<div class="submenu">
  <button
    type="button"
    class="submenu-trigger"
    id="recent-files-trigger"
    aria-haspopup="menu"
    aria-expanded="false"
  >
    <span>最近打开</span>
    <span class="submenu-arrow" aria-hidden="true">›</span>
  </button>
  <div
    class="dropdown-panel submenu-panel recent-files-panel"
    id="recent-files-menu"
    role="menu"
    hidden
  ></div>
</div>
```

- [ ] **Step 2: 添加嵌套菜单样式**

在 `src/style.css` 的 `.menu-separator` 后加入：

```css
.submenu {
  position: relative;
}

.submenu-panel {
  top: -5px;
  left: calc(100% + 4px);
}

.recent-files-panel {
  width: 240px;
  max-height: min(380px, calc(100vh - 70px));
  overflow-y: auto;
}

.recent-file-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.submenu-arrow {
  flex: none;
  margin-left: 12px;
  color: var(--text-faint);
}

.menu-empty {
  padding: 8px 9px;
  color: var(--text-muted);
  font-size: 12px;
}

.recent-action-panel {
  width: 170px;
}
```

- [ ] **Step 3: 在工具栏中生成最近文件菜单**

在 `src/toolbar.ts` 增加 imports：

```typescript
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { openPathInCurrentWindow } from "./file";
import {
  buildOpenFileUrl,
  createRecentWindowLabel,
} from "./openFlow";
import {
  bindRecentFilesStorageSync,
  clearRecentFiles,
  loadRecentFiles,
  subscribeRecentFiles,
} from "./recentFiles";
```

保留现有 `file.ts` import 中的 `newFile`、`openFile`、`saveAsFile`、`saveFile`。

新增菜单辅助函数：

```typescript
function fileNameFromPath(path: string): string {
  return path.split(/[\\/]/).pop() || path;
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderRecentFiles(paths = loadRecentFiles()): void {
  const menu = document.querySelector<HTMLElement>("#recent-files-menu");
  if (!menu) return;

  if (paths.length === 0) {
    menu.innerHTML = '<div class="menu-empty">暂无最近文件</div>';
    return;
  }

  const items = paths
    .map((path) => {
      const encodedPath = escapeAttribute(path);
      const name = escapeAttribute(fileNameFromPath(path));
      return `
        <div class="submenu">
          <button
            type="button"
            class="submenu-trigger"
            data-recent-file="${encodedPath}"
            title="${encodedPath}"
            aria-haspopup="menu"
            aria-expanded="false"
          >
            <span class="recent-file-name">${name}</span>
            <span class="submenu-arrow" aria-hidden="true">›</span>
          </button>
          <div class="dropdown-panel submenu-panel recent-action-panel" role="menu" hidden>
            <button type="button" data-recent-action="current" data-path="${encodedPath}">
              在当前窗口打开
            </button>
            <button type="button" data-recent-action="new" data-path="${encodedPath}">
              在新窗口打开
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  menu.innerHTML = `
    ${items}
    <div class="menu-separator" role="separator"></div>
    <button type="button" data-recent-action="clear">清空最近记录</button>
  `;
}

function closeSubmenus(keptPanels = new Set<HTMLElement>()): void {
  document
    .querySelectorAll<HTMLElement>(".submenu-panel")
    .forEach((panel) => {
      if (!keptPanels.has(panel)) panel.hidden = true;
    });
  document
    .querySelectorAll<HTMLButtonElement>(".submenu-trigger")
    .forEach((trigger) => {
      if (!keptPanels.has(trigger.nextElementSibling as HTMLElement)) {
        trigger.setAttribute("aria-expanded", "false");
      }
    });
}

function toggleSubmenu(trigger: HTMLButtonElement): void {
  const panel = trigger.nextElementSibling as HTMLElement | null;
  if (!panel?.classList.contains("submenu-panel")) return;
  const shouldOpen = panel.hidden;

  const keptPanels = new Set<HTMLElement>();
  let ancestor = trigger.closest<HTMLElement>(".submenu-panel");
  while (ancestor) {
    keptPanels.add(ancestor);
    ancestor = ancestor.parentElement?.closest<HTMLElement>(".submenu-panel") ?? null;
  }
  if (shouldOpen) keptPanels.add(panel);

  closeSubmenus(keptPanels);
  panel.hidden = !shouldOpen;
  trigger.setAttribute("aria-expanded", String(shouldOpen));
}

function openInNewWindow(path: string): void {
  const webview = new WebviewWindow(createRecentWindowLabel(), {
    url: buildOpenFileUrl(path),
    title: `${fileNameFromPath(path)} - EasyMarkdown`,
    width: 1200,
    height: 760,
    minWidth: 760,
    minHeight: 500,
  });

  void webview.once("tauri://error", (event) => {
    window.alert(`创建新窗口失败：${String(event.payload)}`);
  });
}
```

- [ ] **Step 4: 接入点击分发和菜单关闭**

在 `closeMenus()` 中追加：

```typescript
closeSubmenus();
```

在 toolbar click handler 中，普通 `[data-menu-trigger]` 判断后、普通 command 判断前加入：

```typescript
const submenuTrigger = target.closest<HTMLButtonElement>(".submenu-trigger");
if (submenuTrigger) {
  toggleSubmenu(submenuTrigger);
  return;
}

const recentAction = target.closest<HTMLButtonElement>("[data-recent-action]");
if (recentAction) {
  const action = recentAction.dataset.recentAction;
  const path = recentAction.dataset.path;

  if (action === "clear") {
    clearRecentFiles();
    closeMenus();
    return;
  }

  if (path && action === "current") {
    closeMenus();
    void openPathInCurrentWindow(path, { removeOnFailure: true });
    return;
  }

  if (path && action === "new") {
    closeMenus();
    openInNewWindow(path);
    return;
  }
}
```

在 `bindToolbar()` 初始化开始处加入：

```typescript
renderRecentFiles();
subscribeRecentFiles(renderRecentFiles);
bindRecentFilesStorageSync();
```

- [ ] **Step 5: 构建验证菜单代码**

运行：

```powershell
npm run build
```

Expected: TypeScript 和 Vite build 成功。

- [ ] **Step 6: 提交嵌套菜单**

```powershell
git add -- index.html src/style.css src/toolbar.ts
git commit -m "feat: 添加最近打开嵌套菜单"
```

---

### Task 5: 支持新窗口启动加载与 Tauri 权限

**Files:**
- Modify: `src/main.ts`
- Modify: `src-tauri/capabilities/default.json`

- [ ] **Step 1: 新窗口初始化时读取目标路径**

在 `src/main.ts` 增加 imports：

```typescript
import { openPathInCurrentWindow } from "./file";
import { parseOpenFilePath } from "./openFlow";
```

将初始化中的：

```typescript
setContent("");
updatePreview();
updateChrome();
```

替换为：

```typescript
setContent("");
updatePreview();
updateChrome();

const startupPath = parseOpenFilePath(window.location.search);
if (startupPath) {
  void openPathInCurrentWindow(startupPath, {
    confirmUnsaved: false,
    removeOnFailure: true,
  });
}
```

这里必须先完成编辑器、订阅和工具栏绑定，再加载文件。`setContent()` 会通知现有编辑器输入订阅并刷新预览；新窗口读取失败时会提示错误并移除失效记录。

- [ ] **Step 2: 授权动态窗口和创建窗口命令**

将 `src-tauri/capabilities/default.json` 改为：

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for EasyMarkdown editor windows",
  "windows": ["main", "recent-*"],
  "permissions": [
    "core:default",
    "core:webview:allow-create-webview-window",
    "core:window:allow-destroy",
    "core:window:allow-set-title",
    "dialog:default"
  ]
}
```

- [ ] **Step 3: 运行完整自动验证**

运行：

```powershell
npm test
npm run build
npx tauri build --debug --no-bundle
```

Expected:
- 所有 Node tests PASS；
- TypeScript/Vite build 成功；
- Tauri debug build 成功，capability 中不存在未知权限。

- [ ] **Step 4: 提交新窗口启动支持**

```powershell
git add -- src/main.ts src-tauri/capabilities/default.json
git commit -m "feat: 支持在新窗口打开最近文件"
```

---

### Task 6: 桌面端交互验证与收尾

**Files:**
- Modify only if verification finds a defect: `index.html`, `src/style.css`, `src/toolbar.ts`, `src/file.ts`, `src/main.ts`

- [ ] **Step 1: 启动 Tauri 开发应用**

运行：

```powershell
npm run tauri dev
```

Expected: EasyMarkdown 主窗口正常启动，控制台无 capability 或 Webview 创建错误。

- [ ] **Step 2: 验证最近记录写入**

按顺序验证：

1. 打开一个 Markdown 文件，确认其出现在“文件 → 最近打开”首位。
2. 再打开第二个文件，确认第二个文件排首位。
3. 再次打开第一个文件，确认它移到首位且没有重复项。
4. 新建文档，确认未保存时不进入最近记录。
5. 保存新建文档，确认保存成功后进入最近记录。
6. 连续打开超过 10 个不同路径，确认只保留最新 10 条。

- [ ] **Step 3: 验证未保存文档三选项**

修改当前文档后，从最近记录选择“在当前窗口打开”：

1. 选择“取消打开”，确认当前内容和状态不变。
2. 选择“不保存并打开”，确认目标文件被加载。
3. 选择“保存并打开”，确认当前文件保存成功后加载目标文件。
4. 对未命名文档选择“保存并打开”，取消“另存为”，确认目标文件未打开。
5. 制造保存失败后选择“保存并打开”，确认目标文件未打开且当前内容保留。

- [ ] **Step 4: 验证新窗口与失效路径**

1. 从最近记录选择“在新窗口打开”，确认出现独立编辑窗口。
2. 确认原窗口的内容和未保存状态不改变。
3. 在新窗口修改并保存，确认两边的最近记录通过 `storage` 事件刷新。
4. 移动或删除一个最近文件，再尝试打开，确认提示错误并从列表移除。
5. 点击“清空最近记录”，确认列表变为空且磁盘文件仍存在。

- [ ] **Step 5: 验证菜单布局与关闭行为**

在 1200×760 和最小 760×500 窗口下验证：

1. “最近打开”二级菜单和文件操作三级菜单不被工具栏裁切。
2. 长文件名显示省略号，悬停可查看完整路径。
3. 点击菜单外、按 `Escape`、完成打开操作后，所有菜单关闭。
4. 最近记录为空时显示“暂无最近文件”，且该项不可点击。

- [ ] **Step 6: 最终检查**

停止开发进程后运行：

```powershell
npm test
npm run build
git status --short
git log -6 --oneline
```

Expected:
- 全部测试和 build 通过；
- `git status --short` 无未提交功能改动；
- 最近提交依次覆盖数据模型、打开流程、嵌套菜单和新窗口支持。
