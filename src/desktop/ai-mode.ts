import { insertAtCursor } from "../shared/editor";
import { t } from "../shared/i18n/i18n";

let aiModeBound = false;

export function bindAiMode(): void {
  if (aiModeBound) return;
  aiModeBound = true;

  const toggle = document.getElementById('ai-mode-toggle') as HTMLButtonElement;
  const aiBar = document.getElementById('ai-bar');

  if (!toggle || !aiBar) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    aiBar.hidden = expanded;
  });

  aiBar.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("[data-command]");
    if (!button) return;

    const command = button.dataset.command;

    if (command === 'ai-prompt') {
      insertAtCursor(`## ${t("ai.prompt")}\n\n`);
    } else if (command === 'ai-response') {
      insertAtCursor(`## ${t("ai.response")}\n\n`);
    }
  });
}
