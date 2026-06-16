export type RenameValidationError = "empty" | "invalid";

export function getRenameValidationError(name: string): RenameValidationError | null {
  const trimmed = name.trim();
  if (!trimmed) return "empty";
  if (/[<>:"/\\|?*\u0000-\u001f]/.test(trimmed) || /[. ]$/.test(trimmed)) {
    return "invalid";
  }
  return null;
}

export function buildRenamedPath(path: string, newName: string): string {
  const separatorIndex = Math.max(path.lastIndexOf("\\"), path.lastIndexOf("/"));
  return `${path.slice(0, separatorIndex + 1)}${newName.trim()}`;
}
