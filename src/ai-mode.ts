export function bindAiMode(): void {
  const toggle = document.getElementById('ai-mode-toggle') as HTMLInputElement;
  const aiBar = document.getElementById('ai-bar');

  if (!toggle || !aiBar) return;

  toggle.addEventListener('change', () => {
    aiBar.hidden = !toggle.checked;
  });

  aiBar.addEventListener('click', (event) => {
    const target = event.target as HTMLButtonElement;
    const command = target.dataset.command;

    if (command === 'ai-prompt') {
      insertTemplate('## 👤 用户提示词\n\n');
    } else if (command === 'ai-response') {
      insertTemplate('## 🤖 AI回答\n\n');
    }
  });
}

function insertTemplate(template: string): void {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  if (!editor) return;

  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const text = editor.value;

  editor.value = text.substring(0, start) + template + text.substring(end);
  editor.selectionStart = editor.selectionEnd = start + template.length;
  editor.focus();

  editor.dispatchEvent(new Event('input'));
}
