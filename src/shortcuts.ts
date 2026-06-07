import { bold, italic, link } from "./commands";
import { redo, undo } from "./editor";
import { saveFile } from "./file";
import { getShortcutAction } from "./shortcutAction";

let shortcutsBound = false;

export function bindShortcuts(): void {
  if (shortcutsBound) return;
  shortcutsBound = true;

  document.addEventListener("keydown", (event) => {
    const action = getShortcutAction(event);
    if (!action) return;

    event.preventDefault();

    switch (action) {
      case "save":
        void saveFile();
        break;
      case "undo":
        undo();
        break;
      case "redo":
        redo();
        break;
      case "bold":
        bold();
        break;
      case "italic":
        italic();
        break;
      case "link":
        link();
        break;
    }
  });
}
