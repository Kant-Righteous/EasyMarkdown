# EasyMarkdown UI、菜单、保存状态与图标 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成黑白灰 UI、双下拉菜单、Windows 快捷键、统一保存状态计算、响应式工具栏和 EasyMarkdown 图标替换。

**Architecture:** 保持现有 Vanilla TypeScript 模块划分。状态计算集中在 `state.ts`，快捷键集中在 `shortcuts.ts`，菜单交互集中在 `toolbar.ts`；`main.ts` 只连接编辑器内容变化与状态刷新。图标由一张 1024px 源 PNG 通过 Tauri CLI 生成全套资源。

**Tech Stack:** Vanilla TypeScript、HTML、CSS、Vite、Tauri 2、Node.js test runner。

---

### Task 1: 统一 dirty state

**Files:**
- Create: `tests/state.test.ts`
- Modify: `src/state.ts`
- Modify: `src/main.ts`
- Modify: `src/file.ts`
- Modify: `package.json`

- [ ] **Step 1: 写失败测试**

测试 `calculateDirtyState(currentContent, lastSavedContent)` 在内容相同、内容不同和恢复为保存内容时返回正确值。

- [ ] **Step 2: 验证测试因函数尚不存在而失败**

Run: `npm test -- tests/state.test.ts`

- [ ] **Step 3: 实现唯一 dirty 计算入口**

在 `state.ts` 导出纯函数 `calculateDirtyState` 和 `updateDirtyState(currentContent)`；后者只通过比较内容与 `lastSavedContent` 更新 `isDirty`。

- [ ] **Step 4: 接入所有内容变化与文件操作**

`main.ts` 的编辑器通知统一调用 `updateDirtyState`。新建、打开、保存和另存为更新 `lastSavedContent` 后调用同一入口，不再直接写 `isDirty`。

- [ ] **Step 5: 验证状态测试通过**

Run: `npm test -- tests/state.test.ts`

### Task 2: 快捷键与撤销重做

**Files:**
- Create: `tests/shortcuts.test.ts`
- Modify: `src/shortcuts.ts`
- Modify: `src/editor.ts`

- [ ] **Step 1: 写失败测试**

测试只有 `Ctrl` 组合键会映射到 `save`、`undo`、`redo`、`bold`、`italic`、`link`，`Meta`、`Alt` 和未知键不产生动作。

- [ ] **Step 2: 验证测试因映射函数尚不存在而失败**

Run: `npm test -- tests/shortcuts.test.ts`

- [ ] **Step 3: 实现可测试的快捷键映射**

导出 `getShortcutAction`，由单一 `keydown` 监听调用；增加编辑器 `undo()`、`redo()` 操作，并确保内容变化通过统一通知流重算 dirty state。

- [ ] **Step 4: 验证快捷键测试通过**

Run: `npm test -- tests/shortcuts.test.ts`

### Task 3: 菜单与响应式工具栏

**Files:**
- Modify: `index.html`
- Modify: `src/toolbar.ts`
- Modify: `src/style.css`

- [ ] **Step 1: 重组语义结构**

第一行改为“文件”“操作”下拉菜单和右侧视图切换；第二行保留全部 Markdown 按钮。为菜单触发器、菜单项、快捷键提示和激活视图提供明确 class 与 ARIA 属性。

- [ ] **Step 2: 实现菜单行为**

实现单菜单打开、点击外部关闭、Escape 关闭、执行命令后关闭。撤销和重做接入与快捷键相同的编辑器动作。

- [ ] **Step 3: 实现灰阶视觉和响应式断点**

移除蓝色、青色和装饰性阴影；保留绿色已保存和红色未保存。保持 `760x500` 最小窗口，第一行不滚动，第二行独立横向滚动，中等宽度隐藏分组标签。

- [ ] **Step 4: 检查键盘焦点与激活状态**

确认菜单、格式按钮和视图按钮都有清晰的 hover、focus-visible、active 状态。

### Task 4: EasyMarkdown 图标

**Files:**
- Create: `src-tauri/icons/easymarkdown-source.png`
- Modify: `src-tauri/icons/*`（由 Tauri CLI 覆盖同名图标资源）
- Modify: `src-tauri/tauri.conf.json`

- [ ] **Step 1: 生成 1024px 源图**

创建深灰圆角方形背景和居中白色 `EM` 字标，不使用渐变或阴影。

- [ ] **Step 2: 使用 Tauri CLI 生成全套图标**

Run: `npm run tauri icon src-tauri/icons/easymarkdown-source.png`

- [ ] **Step 3: 核对 Windows 图标配置**

确认 `tauri.conf.json` 的 bundle icon 包含 `icons/icon.ico`，窗口和安装包均使用新资源。

### Task 5: 完整验证

**Files:**
- Modify as needed only when verification finds a scoped defect.

- [ ] **Step 1: 运行自动化测试**

Run: `npm test`

- [ ] **Step 2: 运行前端构建**

Run: `npm run build`

- [ ] **Step 3: 运行 Tauri 检查**

Run: `npm run tauri build -- --debug --no-bundle`

- [ ] **Step 4: 检查变更范围**

Run: `git status --short`

确认没有删除无关文件，变更仅覆盖规格列出的模块、测试、文档和图标资源。
