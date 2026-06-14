# Preview Width Rename And Context Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 放宽预览内容、增加文件重命名，并以自定义右键菜单替换 WebView2 默认菜单。

**Architecture:** `fileRename.ts` 负责文件名校验、重命名对话框和状态同步；`contextMenu.ts` 负责按目标渲染菜单和执行编辑动作；Rust 后端负责原子文件重命名、开发者工具和 Windows 表情面板。

**Tech Stack:** TypeScript、HTML dialog、CSS、Tauri 2、Rust、WebView2。

---

### Task 1: 预览响应式宽度

**Files:**
- Modify: `src/style.css`
- Test: `tests/styles.test.ts`

- [ ] 更新失败测试，要求分屏 80ch、独立预览 96ch，宽内容使用 100%。
- [ ] 修改 CSS 宽度变量和宽内容选择器。
- [ ] 运行样式测试。

### Task 2: 重命名数据流和后端

**Files:**
- Create: `src/fileRename.ts`
- Modify: `src/recentFiles.ts`
- Modify: `src/file.ts`
- Modify: `src-tauri/src/lib.rs`
- Test: `tests/fileRename.test.ts`
- Test: `tests/recentFiles.test.ts`
- Test: Rust unit tests

- [ ] 写文件名校验、路径替换和最近文件替换的失败测试。
- [ ] 实现前端纯函数和最近文件记录同步。
- [ ] 实现 `rename_file` 并增加 Rust 单元测试。
- [ ] 实现重命名对话框调用和当前文件状态同步。

### Task 3: 顶部菜单和自定义右键菜单

**Files:**
- Create: `src/contextMenu.ts`
- Modify: `index.html`
- Modify: `src/toolbar.ts`
- Modify: `src/sidebar.ts`
- Modify: `src/main.ts`
- Modify: `src/i18n.ts`
- Modify: `src/style.css`
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/src/lib.rs`
- Test: `tests/sidebarMarkup.test.ts`
- Test: `tests/styles.test.ts`
- Test: `tests/i18n.test.ts`

- [ ] 写顶部重命名项、对话框、右键菜单容器和三语文案失败测试。
- [ ] 为侧栏文件项附加路径数据。
- [ ] 实现右键菜单目标识别和编辑操作。
- [ ] 实现开发者工具及表情面板后端命令。
- [ ] 运行前端完整测试、构建和 Rust 测试。
