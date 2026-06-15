# Preview Block Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add localized copy-icon controls to quote, code, formula, and Mermaid blocks in the live preview.

**Architecture:** The Markdown renderer stores normalized source content on marked block elements. A dedicated preview interaction module adds buttons and handles clipboard feedback, while the application invokes decoration after normal and asynchronous rendering. PDF rendering remains unchanged because decoration is not part of `renderMarkdown`.

**Tech Stack:** TypeScript, markdown-it, DOM Clipboard API, Node test runner, Vite

---

### Task 1: Specify renderer metadata

**Files:**
- Modify: `tests/markdownExtensions.test.ts`
- Modify: `tests/mermaidRendering.test.ts`

- [ ] Add assertions that quote, fenced code, block formula, and Mermaid output contain `preview-copy-block` and escaped `data-copy-source`.
- [ ] Run the focused tests and confirm they fail because copy metadata is absent.

### Task 2: Specify copy interaction

**Files:**
- Create: `tests/previewBlockCopy.test.ts`
- Create: `tests/previewBlockCopyIntegrationSource.test.ts`
- Modify: `tests/i18n.test.ts`
- Modify: `tests/styles.test.ts`

- [ ] Add tests for copy-button markup, successful checkmark feedback, failure behavior, and source decoding.
- [ ] Add source integration assertions for live preview decoration and no PDF decoration.
- [ ] Add Chinese, English, and French copy-label assertions.
- [ ] Add style assertions for upper-right light icon positioning.
- [ ] Run focused tests and confirm they fail because the module, labels, binding, and styles are absent.

### Task 3: Implement renderer metadata

**Files:**
- Modify: `src/markdown.ts`

- [ ] Normalize copy content for quote, code, display formula, and Mermaid tokens.
- [ ] HTML-escape copy content into `data-copy-source`.
- [ ] Add the shared `preview-copy-block` class without changing inline formula rendering.
- [ ] Run renderer tests and confirm they pass.

### Task 4: Implement live-preview copy controls

**Files:**
- Create: `src/previewBlockCopy.ts`
- Modify: `src/main.ts`
- Modify: `src/i18n.ts`
- Modify: `src/style.css`

- [ ] Add the shared line copy SVG button with localized title and aria-label.
- [ ] Handle delegated copy clicks through `navigator.clipboard.writeText`.
- [ ] Show `√` for 1.5 seconds only after a successful write.
- [ ] Decorate the preview after Markdown and Mermaid rendering.
- [ ] Add light upper-right button, hover, focus, and success styles.
- [ ] Run all focused tests and confirm they pass.

### Task 5: Verify regression safety

**Files:**
- No additional files.

- [ ] Run `npm.cmd test` and confirm all tests pass.
- [ ] Run `npm.cmd run build` and confirm TypeScript and Vite succeed.
- [ ] Run `git diff --check` and confirm no whitespace errors.

### Task 6: Prevent copy controls from covering block content

**Files:**
- Modify: `src/previewBlockCopy.ts`
- Modify: `src/style.css`
- Modify: `tests/previewBlockCopyIntegrationSource.test.ts`
- Modify: `tests/styles.test.ts`

- [ ] Assert copy buttons are inserted before block content.
- [ ] Assert quote buttons float right and code, formula, and Mermaid blocks reserve space.
- [ ] Run the focused tests and confirm they fail with the current appended, overlay-only layout.
- [ ] Prepend the copy button and add block-specific layout rules.
- [ ] Run focused tests, the full test suite, and the production build.
