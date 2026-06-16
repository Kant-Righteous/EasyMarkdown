export type SaveOutcome =
  | {
      status: "saved";
      path: string;
      content: string;
    }
  | {
      status: "cancelled";
    }
  | {
      status: "failed";
      error: unknown;
    };

export interface SaveOperation {
  path: string | null;
  selectPath: () => Promise<string | null>;
  readContent: () => string;
  write: (path: string, content: string) => Promise<WriteConfirmation>;
}

export interface WriteConfirmation {
  path: string;
  content: string;
}

export async function performSave(
  operation: SaveOperation,
): Promise<SaveOutcome> {
  try {
    const path = operation.path ?? (await operation.selectPath());
    if (!path) return { status: "cancelled" };

    const content = operation.readContent();
    const confirmation = await operation.write(path, content);
    if (confirmation.content !== content) {
      throw new Error("Saved content verification failed");
    }
    return {
      status: "saved",
      path: confirmation.path,
      content: confirmation.content,
    };
  } catch (error) {
    return { status: "failed", error };
  }
}

export function createSaveQueue(): <T>(
  operation: () => Promise<T>,
) => Promise<T> {
  let tail: Promise<void> = Promise.resolve();

  return <T>(operation: () => Promise<T>): Promise<T> => {
    const result = tail.then(operation, operation);
    tail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  };
}

export function getSaveAsDefaultPath(
  currentFilePath: string | null,
  currentFileName: string,
  untitledFileName: string,
): string {
  return currentFilePath || currentFileName || untitledFileName;
}
