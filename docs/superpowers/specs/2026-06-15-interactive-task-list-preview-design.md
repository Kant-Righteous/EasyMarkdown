# Interactive Task List Preview Design

## Goal

Allow task-list checkboxes in the live preview to update the matching Markdown
task marker in the editor.

## Behavior

- Preview task checkboxes are enabled.
- Changing a checkbox replaces `[ ]`, `[x]`, or `[X]` on the matching
  zero-based source line.
- Checked tasks use `[x]`; unchecked tasks use `[ ]`.
- The update follows the normal editor input path so dirty state, preview
  rendering, outline refresh, and saving continue to work.
- Editor selection and scroll position are preserved.
- Duplicate task text and nested task lists are resolved by source line, not
  by label text.
- Non-task content is left unchanged.
- PDF output remains a static representation.

## Design

`markdown.ts` enables task-list inputs while retaining the existing source-line
attribute on each task-list item. A focused `taskListInteraction.ts` module
contains a pure source-line replacement function and the preview event binding.
`editor.ts` exposes a content update function that preserves selection and
scroll state. `main.ts` binds the interaction once during startup.

## Verification

Tests cover enabled checkbox markup, unchecked/checked transitions, nested and
duplicate tasks, invalid source lines, CRLF preservation, and source integration.
The full test suite and production build must pass.
