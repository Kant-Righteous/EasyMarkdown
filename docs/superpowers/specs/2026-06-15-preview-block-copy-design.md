# Preview Block Copy Design

## Goal

Add a subtle copy icon to the upper-right corner of every preview block created
by the Block toolbar group: quote, code block, formula block, and Mermaid
diagram.

## Behavior

- The live preview decorates quotes, code blocks, display formulas, and Mermaid
  diagrams with one light copy icon.
- The icon has localized hover and accessible labels:
  `复制`, `Copy`, and `Copier`.
- A successful click changes only that button to `√`.
- The success state returns to the copy icon after 1.5 seconds.
- A failed copy leaves the copy icon unchanged.
- Copy content is reusable source content:
  - quote: quote body without leading `>` markers;
  - code block: code without the Markdown fence;
  - formula block: LaTeX without `$$` delimiters;
  - Mermaid diagram: Mermaid source without the Markdown fence.
- Buttons are added only to the live preview and do not appear in PDF output.
- Quote copy buttons participate in layout as a right float so long quote text
  wraps around the control instead of being covered.
- Code blocks reserve right-side space for the absolute button. Formula and
  Mermaid blocks reserve top space so centered content remains unobstructed.

## Architecture

`markdown.ts` marks the four block types with an HTML-safe
`data-copy-source` value and a shared `preview-copy-block` class. A focused
`previewBlockCopy.ts` module decorates marked blocks, handles delegated clicks,
writes to the clipboard, and manages the temporary success state. `main.ts`
decorates after synchronous Markdown rendering and again after asynchronous
Mermaid rendering. Buttons are inserted before block content so quotes can use
normal float wrapping. CSS applies block-specific spacing to the other types.

## Error Handling

Clipboard rejection does not show a false success state. Repeated clicks reset
the 1.5-second success timer for that button. A block with no copy source is not
decorated.

## Verification

Tests cover renderer metadata for all four block types, source normalization,
button markup, clipboard success and failure behavior, localization, live
preview integration, styling, and absence from the PDF rendering path.
