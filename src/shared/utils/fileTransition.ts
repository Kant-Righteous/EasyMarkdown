export type UnsavedTransitionDecision = "save" | "discard" | "cancel";

export interface UnsavedTransitionOptions {
  isDirty: boolean;
  prompt(): Promise<UnsavedTransitionDecision>;
  save(): Promise<boolean>;
}

export async function confirmUnsavedTransition(
  options: UnsavedTransitionOptions,
): Promise<boolean> {
  if (!options.isDirty) return true;

  const decision = await options.prompt();
  if (decision === "discard") return true;
  if (decision === "cancel") return false;
  return options.save();
}
