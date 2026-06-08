# AI对话保存模式 设计文档

## 概述

在 EasyMarkdown 编辑器中添加"AI对话保存模式"功能，允许用户快速插入 AI 对话的 Markdown 模板，方便保存与 ChatGPT 或其他 AI 的对话内容。

## 功能需求

### 1. 开关按钮

- 位置：顶部菜单栏"操作"菜单的右侧
- 样式：toggle 开关，无图标
- 文本：`AI对话保存模式`

### 2. AI对话工具栏

- 显示条件：开关按钮开启时
- 位置：格式工具栏下方（第三行）
- 包含两个按钮：
  - `👤 用户提示词` - 插入用户提示词模板
  - `🤖 AI回答` - 插入 AI 回答模板

### 3. 模板内容

点击按钮后在编辑器中插入：

- **用户提示词**：`## 👤 用户提示词\n\n`
- **AI回答**：`## 🤖 AI回答\n\n`

## 技术设计

### HTML 结构

```html
<!-- 菜单栏中添加开关 -->
<div class="ai-toggle-wrapper">
  <label class="ai-toggle">
    <input type="checkbox" id="ai-mode-toggle">
    <span>AI对话保存模式</span>
  </label>
</div>

<!-- 格式栏下方添加 AI 工具栏 -->
<div class="ai-bar" id="ai-bar" hidden>
  <div class="ai-group" role="group" aria-label="AI 对话模板">
    <span class="format-label">AI 对话</span>
    <button type="button" data-command="ai-prompt">👤 用户提示词</button>
    <button type="button" data-command="ai-response">🤖 AI回答</button>
  </div>
</div>
```

### TypeScript 逻辑

新建 `src/ai-mode.ts`：

```typescript
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

  // 触发 input 事件以更新预览
  editor.dispatchEvent(new Event('input'));
}
```

### CSS 样式

```css
.ai-toggle-wrapper {
  display: flex;
  align-items: center;
  margin-left: 1rem;
}

.ai-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.ai-toggle input[type="checkbox"] {
  cursor: pointer;
}

.ai-bar {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: var(--toolbar-bg, #f5f5f5);
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.ai-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.ai-bar button {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
  background: var(--button-bg, #fff);
  cursor: pointer;
  font-size: 0.8125rem;
}

.ai-bar button:hover {
  background: var(--button-hover-bg, #e8e8e8);
}
```

### 修改的文件

1. `index.html` - 添加开关按钮和 AI 工具栏 HTML
2. `src/ai-mode.ts` - 新建，包含 AI 模式逻辑
3. `src/main.ts` - 导入并调用 `bindAiMode()`
4. `src/styles.css` - 添加 AI 相关样式

## 布局结构

```
┌─────────────────────────────────────────────────────────┐
│ 文件 | 操作 | AI对话保存模式 [开关]          编辑|预览|分屏 │
├─────────────────────────────────────────────────────────┤
│ 标题 H1 H2 H3 | 强调 B I | 列表 | 块级 | 插入           │
├─────────────────────────────────────────────────────────┤
│ AI 对话 [👤 用户提示词] [🤖 AI回答]  ← 开关开启时显示    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    编辑器 / 预览区                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 验收标准

1. 开关按钮显示在"操作"菜单右侧
2. 开关默认为关闭状态
3. 开关开启时，第三行 AI 工具栏显示
4. 开关关闭时，第三行 AI 工具栏隐藏
5. 点击"👤 用户提示词"在编辑器光标位置插入模板
6. 点击"🤖 AI回答"在编辑器光标位置插入模板
7. 插入模板后自动触发预览更新
