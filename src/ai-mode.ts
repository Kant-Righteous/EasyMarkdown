import { insertAtCursor, pushAiModeUndo } from "./editor";

let aiModeBound = false;

export function bindAiMode(): void {
  if (aiModeBound) return;
  aiModeBound = true;

  const toggle = document.getElementById('ai-mode-toggle') as HTMLButtonElement;
  const aiBar = document.getElementById('ai-bar');

  if (!toggle || !aiBar) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    const newExpanded = !expanded;
    toggle.setAttribute('aria-expanded', String(newExpanded));
    aiBar.hidden = expanded;
    pushAiModeUndo(newExpanded);
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
