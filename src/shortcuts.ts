import { bold, italic, link } from "./commands";
import { saveFile } from "./file";

export function bindShortcuts(): void {
  document.addEventListener("keydown", (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;

    switch (event.key.toLowerCase()) {
      case "s":
        event.preventDefault();
        void saveFile();
        break;
      case "b":
        event.preventDefault();
        bold();
        break;
      case "i":
        event.preventDefault();
        italic();
        break;
      case "k":
        event.preventDefault();
        link();
        break;
    }
  });
}
