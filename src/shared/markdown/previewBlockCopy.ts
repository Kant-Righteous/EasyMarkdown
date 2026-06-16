import { t } from "../i18n/i18n.ts";

type ClipboardWriter = (source: string) => Promise<void>;

const COPY_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="8" y="8" width="10" height="10" rx="2"></rect>
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path>
  </svg>
`;

const resetTimers = new WeakMap<
  HTMLButtonElement,
  ReturnType<typeof setTimeout>
>();

function setButtonLabel(button: HTMLButtonElement, copied: boolean): void {
  const label = t(copied ? "preview.copySuccess" : "preview.copyBlock");
  button.title = label;
  button.setAttribute("aria-label", label);
}

function resetButton(button: HTMLButtonElement): void {
  button.classList.remove("is-copied");
  button.innerHTML = COPY_ICON;
  setButtonLabel(button, false);
}

function showCopied(button: HTMLButtonElement): void {
  const activeTimer = resetTimers.get(button);
  if (activeTimer) clearTimeout(activeTimer);

  button.classList.add("is-copied");
  button.textContent = "√";
  setButtonLabel(button, true);
  resetTimers.set(
    button,
    setTimeout(() => resetButton(button), 1500),
  );
}

export async function copyBlockSource(
  source: string,
  writeText: ClipboardWriter = (text) =>
    navigator.clipboard.writeText(text),
): Promise<boolean> {
  try {
    await writeText(source);
    return true;
  } catch {
    return false;
  }
}

export function decoratePreviewCopyBlocks(root: HTMLElement): void {
  root
    .querySelectorAll<HTMLElement>(
      ".preview-copy-block[data-copy-source]",
    )
    .forEach((block) => {
      const existingButton = Array.from(block.children).find((child) =>
        child.classList.contains("preview-copy-button"),
      );
      if (existingButton instanceof HTMLButtonElement) {
        if (!existingButton.classList.contains("is-copied")) {
          setButtonLabel(existingButton, false);
        }
        return;
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-copy-button";
      resetButton(button);
      block.prepend(button);
    });
}

export function bindPreviewBlockCopy(root: HTMLElement): () => void {
  const handleClick = async (event: Event): Promise<void> => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest<HTMLButtonElement>(
      ".preview-copy-button",
    );
    if (!button || !root.contains(button)) return;

    const block = button.closest<HTMLElement>(
      ".preview-copy-block[data-copy-source]",
    );
    const source = block?.dataset.copySource;
    if (source === undefined) return;

    if (await copyBlockSource(source)) showCopied(button);
  };

  root.addEventListener("click", handleClick);
  return () => root.removeEventListener("click", handleClick);
}
