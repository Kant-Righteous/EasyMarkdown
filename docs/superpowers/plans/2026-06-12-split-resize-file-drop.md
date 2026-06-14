# Split Resize And File Drop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 增加分屏比例拖动、本地 Markdown 文件拖放打开，并统一新建/切换文件时的未保存确认。

**Architecture:** 使用三个小型模块隔离比例计算、拖放筛选和未保存流程。界面层只负责绑定事件和设置 CSS 变量，文件读取继续复用 `openPathInCurrentWindow`。

**Tech Stack:** TypeScript、CSS Grid、Pointer Events、Tauri 2 drag-drop API、Node test runner。

---

### Task 1: 通用未保存确认

**Files:**
- Create: `src/fileTransition.ts`
- Modify: `src/file.ts`
- Modify: `src/i18n.ts`
- Test: `tests/fileTransition.test.ts`
- Test: `tests/i18n.test.ts`

- [ ] 写失败测试，覆盖无修改直接继续、保存成功继续、保存失败停止、不保存继续、取消停止。
- [ ] 运行聚焦测试确认因模块和通用文案不存在而失败。
- [ ] 实现 `confirmUnsavedTransition`，让 `newFile` 和打开文件共用该流程。
- [ ] 将三语按钮改为 Save / Don't Save / Cancel 对应文案。
- [ ] 运行聚焦测试确认通过。

### Task 2: 分屏分隔线拖动

**Files:**
- Create: `src/splitPane.ts`
- Modify: `index.html`
- Modify: `src/style.css`
- Modify: `src/main.ts`
- Test: `tests/splitPane.test.ts`
- Test: `tests/sidebarMarkup.test.ts`
- Test: `tests/styles.test.ts`

- [ ] 写失败测试，覆盖默认 50%、20% 到 80% 限制和指针位置换算。
- [ ] 增加可访问的垂直 separator DOM 测试和 CSS 状态测试。
- [ ] 实现 Pointer Events 拖动及键盘左右方向键调整。
- [ ] 在非分屏模式和 860px 以下布局隐藏分隔条。
- [ ] 运行聚焦测试和构建。

### Task 3: 文件拖放打开

**Files:**
- Create: `src/fileDrop.ts`
- Modify: `src/main.ts`
- Modify: `src/style.css`
- Test: `tests/fileDrop.test.ts`
- Test: `tests/styles.test.ts`

- [ ] 写失败测试，覆盖大小写扩展名、忽略不支持文件、多文件取第一个支持文件。
- [ ] 实现 Tauri `onDragDropEvent` 绑定和拖入反馈状态。
- [ ] 放下文件时调用 `openPathInCurrentWindow`，复用未保存确认。
- [ ] 运行聚焦测试、完整测试和生产构建。
