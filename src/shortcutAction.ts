export type ShortcutAction =
  | "save"
  | "undo"
  | "redo"
  | "bold"
  | "italic"
  | "link";

export interface ShortcutEvent {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

const shortcutActions: Record<string, ShortcutAction> = {
  s: "save",
  z: "undo",
  y: "redo",
  b: "bold",
  i: "italic",
  k: "link",
};

export function getShortcutAction(
  event: ShortcutEvent,
): ShortcutAction | null {
  if (!event.ctrlKey || event.metaKey || event.altKey) return null;
  return shortcutActions[event.key.toLowerCase()] ?? null;
}
