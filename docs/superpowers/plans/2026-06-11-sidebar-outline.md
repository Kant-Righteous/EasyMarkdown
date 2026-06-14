# Sidebar Files and Outline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a collapsible Files/Outline sidebar with safe recent-file deletion and H1-H4 navigation, then document lightweight MDX support in all README languages.

**Architecture:** Keep parsing and decisions in pure TypeScript modules, bind DOM behavior in one sidebar controller, and reuse existing recent-file storage and file-opening functions. Add one narrowly scoped Tauri command that deletes only a single file path after the frontend confirmation flow.

**Tech Stack:** TypeScript, DOM APIs, Node test runner, CSS, Tauri 2, Rust

---

### Task 1: Pure behavior tests

**Files:**
- Create: `src/outline.ts`
- Create: `src/sidebarState.ts`
- Create: `src/recentDelete.ts`
- Create: `tests/outline.test.ts`
- Create: `tests/sidebarState.test.ts`
- Create: `tests/recentDelete.test.ts`

- [ ] Write failing tests for H1-H4 parsing, fenced code exclusion, parent/child ranges, and collapsed descendant visibility.
- [ ] Write failing tests for sidebar persisted open state and active tab normalization.
- [ ] Write failing tests mapping three-button dialog results to `record`, `file`, or `cancel`.
- [ ] Run focused tests and confirm RED.
- [ ] Implement minimal pure functions and confirm GREEN.

### Task 2: Sidebar markup and styling

**Files:**
- Modify: `index.html`
- Modify: `src/style.css`
- Modify: `tests/styles.test.ts`
- Create: `tests/sidebarMarkup.test.ts`

- [ ] Add failing markup and style assertions.
- [ ] Add toolbar toggle, semantic tabs, panels, empty-state containers, and workspace shell.
- [ ] Add restrained desktop and responsive overlay styling with clear focus and selected states.
- [ ] Run focused tests and confirm GREEN.

### Task 3: Files panel behavior

**Files:**
- Create: `src/sidebar.ts`
- Modify: `src/main.ts`
- Modify: `src/i18n.ts`
- Modify: `src/file.ts`

- [ ] Render recent files from `loadRecentFiles()` and `subscribeRecentFiles()`.
- [ ] Open item names in the current window.
- [ ] Add fixed SVG buttons for new-window and delete actions.
- [ ] Show the three-choice localized deletion dialog with the full path.
- [ ] Remove only the recent record when selected.
- [ ] Call `delete_file` only when the destructive choice is selected.
- [ ] Preserve current editor content and convert it to an unsaved file if its backing file is deleted.

### Task 4: Outline behavior

**Files:**
- Modify: `src/sidebar.ts`
- Modify: `src/main.ts`
- Modify: `src/editor.ts`
- Modify: `src/markdown.ts`

- [ ] Refresh H1-H4 outline after content changes.
- [ ] Render indentation and independent parent collapse controls.
- [ ] Add stable source-line metadata to rendered preview headings.
- [ ] Navigate to textarea line offsets in edit/split mode.
- [ ] Scroll to matching preview heading in preview mode.

### Task 5: Safe backend deletion

**Files:**
- Modify: `src-tauri/src/lib.rs`

- [ ] Add a Rust test proving a single file is deleted.
- [ ] Add a Rust test proving directories are rejected.
- [ ] Implement `delete_file(path)` using file metadata and `remove_file`.
- [ ] Register the command and run Rust tests.

### Task 6: README synchronization

**Files:**
- Modify: `README.md`
- Modify: `README.en.md`
- Modify: `README.fr.md`

- [ ] Set displayed version to `1.1.0`.
- [ ] Add equivalent lightweight MDX feature bullets.
- [ ] Add equivalent scope limitations in all three languages.

### Task 7: Verification

- [ ] Run `npm.cmd test`.
- [ ] Run `npm.cmd run build`.
- [ ] Run targeted Rust tests.
- [ ] Run full sample MDX structural verification.
- [ ] Inspect the local UI with Browser when available.
- [ ] Run `git diff --check` and review final changed-file scope.
