import { t } from "./i18n/i18n";

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
    throw new Error(t("editor.notFound"));
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

export function setContentPreservingView(content: string): void {
  const element = editor();
  const selectionStart = Math.min(element.selectionStart, content.length);
  const selectionEnd = Math.min(element.selectionEnd, content.length);
  const selectionDirection = element.selectionDirection;
  const { scrollTop, scrollLeft } = element;

  element.value = content;
  element.setSelectionRange(
    selectionStart,
    selectionEnd,
    selectionDirection,
  );
  element.scrollTop = scrollTop;
  element.scrollLeft = scrollLeft;
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
  element.focus();
  document.execCommand("insertText", false, text);
  notifyInput();
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

  element.focus();
  element.setSelectionRange(start, end);
  document.execCommand("insertText", false, replacement);

  const selectionStart = start + before.length;
  element.setSelectionRange(selectionStart, selectionStart + value.length);
  notifyInput();
}

export function insertAtCursor(text: string): void {
  replaceSelection(text);
}

export function undo(): void {
  const element = editor();
  element.focus();
  document.execCommand("undo");
  notifyInput();
}

export function redo(): void {
  const element = editor();
  element.focus();
  document.execCommand("redo");
  notifyInput();
}

export function onEditorInput(callback: InputCallback): () => void {
  inputCallbacks.add(callback);

  if (!inputBound) {
    editor().addEventListener("input", notifyInput);
    inputBound = true;
  }

  return () => inputCallbacks.delete(callback);
}
