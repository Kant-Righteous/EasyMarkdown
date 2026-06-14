# Responsive Format Toolbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-line, multilingual formatting toolbar that exposes all 22 commands when space permits and moves lower-priority commands into per-group overflow menus when needed.

**Architecture:** Keep command dispatch in `toolbar.ts`, move reusable Markdown text transformations into a pure module, and isolate overflow ordering in a small pure helper. The DOM layer measures actual width with `ResizeObserver`, moves existing buttons between their group row and overflow panel, and restores them in source order when space returns.

**Tech Stack:** TypeScript, DOM APIs, ResizeObserver, inline SVG, Node test runner, Vite.

---

### Task 1: Markdown transformations

**Files:**
- Create: `src/formatting.ts`
- Modify: `src/commands.ts`
- Test: `tests/formatting.test.ts`

- [ ] Write failing tests for heading replacement, task lists, inline wrappers, block templates, and footnote numbering.
- [ ] Run `npm test -- tests/formatting.test.ts` and verify failures are caused by the missing module.
- [ ] Implement pure helpers and connect all 22 commands to editor operations.
- [ ] Re-run the focused test and verify it passes.

### Task 2: Overflow policy

**Files:**
- Create: `src/toolbarOverflow.ts`
- Test: `tests/toolbarOverflow.test.ts`

- [ ] Write failing tests asserting the overflow order and protected command set.
- [ ] Run `npm test -- tests/toolbarOverflow.test.ts` and verify the missing module failure.
- [ ] Implement exported overflow order and protection helpers.
- [ ] Re-run the focused test and verify it passes.

### Task 3: Toolbar markup and localization

**Files:**
- Modify: `index.html`
- Modify: `src/i18n.ts`
- Modify: `tests/sidebarMarkup.test.ts`
- Modify: `tests/i18n.test.ts`

- [ ] Add failing markup tests for five groups, 22 commands, consistent icon elements, and per-group overflow menus.
- [ ] Add failing localization tests for representative new labels in all three languages.
- [ ] Run the focused tests and verify expected failures.
- [ ] Replace the current format bar markup with the complete toolbar and inline SVG icons.
- [ ] Add Chinese, English, and French translations.
- [ ] Re-run focused tests and verify they pass.

### Task 4: Runtime overflow and styling

**Files:**
- Modify: `src/toolbar.ts`
- Modify: `src/style.css`
- Modify: `tests/styles.test.ts`

- [ ] Add failing style tests for single-line layout, fixed button sizing, compact labels, and overflow panels.
- [ ] Run the style test and verify expected failures.
- [ ] Bind `ResizeObserver`, restore all items before measurement, compact labels on overflow, and move optional items into group menus in policy order.
- [ ] Update CSS for single-line layout, unified icon treatment, menu positioning, focus states, and reduced-motion-safe behavior.
- [ ] Re-run focused tests and verify they pass.

### Task 5: Verification

**Files:**
- Verify all modified files.

- [ ] Run `npm test` and confirm zero failures.
- [ ] Run `npm run build` and confirm TypeScript and Vite complete successfully.
- [ ] Run the local app, inspect Chinese, English, and French layouts at wide and narrow widths, and confirm command buttons and group overflow menus work.
- [ ] Review `git diff --check` and `git status --short`.
