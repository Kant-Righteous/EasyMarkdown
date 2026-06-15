# Interactive Task List Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make preview task-list checkboxes update their exact Markdown source lines.

**Architecture:** Keep Markdown rendering responsible for source anchors, place task marker replacement and event delegation in a focused interaction module, and route updates through the editor's normal notification path. Source-line matching prevents ambiguity for repeated labels and nested lists.

**Tech Stack:** TypeScript, markdown-it task-list plugin, Node test runner, Vite

---

### Task 1: Specify rendering and source replacement

**Files:**
- Modify: `tests/markdownExtensions.test.ts`
- Create: `tests/taskListInteraction.test.ts`

- [ ] Add a rendering assertion that task checkboxes are enabled and their list items retain `data-source-line`.
- [ ] Add pure-function tests for checking, unchecking, duplicate labels, nested tasks, invalid lines, and CRLF input.
- [ ] Run `npm.cmd test -- tests/markdownExtensions.test.ts tests/taskListInteraction.test.ts` and confirm failure because the current renderer disables inputs and the replacement module does not exist.

### Task 2: Implement task source updates

**Files:**
- Create: `src/taskListInteraction.ts`
- Modify: `src/markdown.ts`
- Modify: `src/editor.ts`
- Modify: `src/main.ts`

- [ ] Implement `toggleTaskAtSourceLine(markdown, sourceLine, checked)` using a line-local task marker regular expression.
- [ ] Implement delegated preview `change` handling using the closest task-list item's `data-source-line`.
- [ ] Enable task-list inputs in the Markdown renderer.
- [ ] Add an editor update function that preserves selection and scroll position while notifying existing input subscribers.
- [ ] Bind task-list interaction during application startup.
- [ ] Run the focused tests and confirm they pass.

### Task 3: Polish and verify

**Files:**
- Modify: `src/style.css`
- Modify: `tests/styles.test.ts`
- Modify: `tests/taskListIntegrationSource.test.ts`

- [ ] Add pointer and accent styling for interactive preview checkboxes.
- [ ] Assert the startup integration binds preview task interaction.
- [ ] Run `npm.cmd test` and confirm all tests pass.
- [ ] Run `npm.cmd run build` and confirm TypeScript and Vite production builds succeed.
