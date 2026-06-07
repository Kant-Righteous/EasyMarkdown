export interface EditorSelection {
  start: number;
  end: number;
  text: string;
}

type InputCallback = () => void;

const inputCallbacks = new Set<InputCallback>();
let inputBound = false;

function editor(): HTMLTextAreaElement {
  const element = document.querySelector<HTMLTextAreaElement>("#editor");
  if (!element) {
    throw new Error("找不到 Markdown 编辑器");
  }
  return element;
}

function notifyInput(): void {
  inputCallbacks.forEach((callback) => callback());
}

export function getContent(): string {
  return editor().value;
}

export function setContent(content: string): void {
  editor().value = content;
  notifyInput();
}

export function focusEditor(): void {
  editor().focus();
}

export function getSelection(): EditorSelection {
  const element = editor();
  return {
    start: element.selectionStart,
    end: element.selectionEnd,
    text: element.value.slice(element.selectionStart, element.selectionEnd),
  };
}

export function replaceSelection(text: string): void {
  const element = editor();
  const { start, end } = getSelection();
  element.setRangeText(text, start, end, "end");
  notifyInput();
  element.focus();
}

export function wrapSelection(
  before: string,
  after: string,
  placeholder: string,
): void {
  const element = editor();
  const { start, end, text } = getSelection();
  const value = text || placeholder;
  const replacement = `${before}${value}${after}`;

  element.setRangeText(replacement, start, end, "end");
  const selectionStart = start + before.length;
  element.setSelectionRange(selectionStart, selectionStart + value.length);
  notifyInput();
  element.focus();
}

export function insertAtCursor(text: string): void {
  replaceSelection(text);
}

function runHistoryCommand(command: "undo" | "redo"): void {
  const element = editor();
  element.focus();
  document.execCommand(command);
  notifyInput();
}

export function undo(): void {
  runHistoryCommand("undo");
}

export function redo(): void {
  runHistoryCommand("redo");
}

export function onEditorInput(callback: InputCallback): () => void {
  inputCallbacks.add(callback);

  if (!inputBound) {
    editor().addEventListener("input", notifyInput);
    inputBound = true;
  }

  return () => inputCallbacks.delete(callback);
}
