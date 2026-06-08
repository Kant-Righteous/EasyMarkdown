import { insertAtCursor } from "./editor";

let aiModeBound = false;

export function bindAiMode(): void {
  if (aiModeBound) return;
  aiModeBound = true;

  const toggle = document.getElementById('ai-mode-toggle') as HTMLInputElement;
  const aiBar = document.getElementById('ai-bar');

  if (!toggle || !aiBar) return;

  toggle.addEventListener('change', () => {
    aiBar.hidden = !toggle.checked;
  });

  aiBar.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("[data-command]");
    if (!button) return;

    const command = button.dataset.command;

    if (command === 'ai-prompt') {
      insertAtCursor('## 👤 用户提示词\n\n');
    } else if (command === 'ai-response') {
      insertAtCursor('## 🤖 AI回答\n\n');
    }
  });
}
