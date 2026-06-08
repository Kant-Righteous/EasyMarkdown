# AI对话保存模式 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 添加 AI对话保存模式功能，允许用户快速插入 AI 对话的 Markdown 模板

**Architecture:** 在菜单栏添加 toggle 开关，开启后显示 AI 工具栏，点击按钮插入对应模板到编辑器

**Tech Stack:** TypeScript, HTML, CSS, Vite

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `index.html` | 添加开关按钮和 AI 工具栏 HTML |
| `src/ai-mode.ts` | 新建，AI 模式逻辑（toggle 监听、模板插入） |
| `src/main.ts` | 导入并调用 `bindAiMode()` |
| `src/styles.css` | 添加 AI 相关样式 |

---

## Task 1: 添加 HTML 结构

**Files:**
- Modify: `index.html:46-68`

- [ ] **Step 1: 在菜单栏中添加开关按钮**

在 `index.html` 的 `.dropdown-menus` div 结束标签后、`.view-switcher` div 前添加：

```html
<div class="ai-toggle-wrapper">
  <label class="ai-toggle">
    <input type="checkbox" id="ai-mode-toggle">
    <span>AI对话保存模式</span>
  </label>
</div>
```

- [ ] **Step 2: 在格式栏下方添加 AI 工具栏**

在 `.format-bar` div 结束标签后（约第 123 行后）添加：

```html
<div class="ai-bar" id="ai-bar" hidden>
  <div class="ai-group" role="group" aria-label="AI 对话模板">
    <span class="format-label">AI 对话</span>
    <button type="button" data-command="ai-prompt">👤 用户提示词</button>
    <button type="button" data-command="ai-response">🤖 AI回答</button>
  </div>
</div>
```

- [ ] **Step 3: 验证 HTML 结构**

运行: `npm run dev`
Expected: 页面正常加载，开关按钮和 AI 工具栏（隐藏状态）可见

---

## Task 2: 创建 AI 模式逻辑

**Files:**
- Create: `src/ai-mode.ts`

- [ ] **Step 1: 创建 ai-mode.ts 文件**

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

  editor.dispatchEvent(new Event('input'));
}
```

- [ ] **Step 2: 验证文件创建**

运行: `ls src/ai-mode.ts`
Expected: 文件存在

---

## Task 3: 集成到主入口

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: 导入并调用 bindAiMode**

在 `src/main.ts` 中添加导入和调用：

```typescript
import { bindAiMode } from "./ai-mode";
```

在适当的初始化位置调用：

```typescript
bindAiMode();
```

- [ ] **Step 2: 验证集成**

运行: `npm run dev`
Expected: 开关按钮可点击，AI 工具栏显示/隐藏正常

---

## Task 4: 添加 CSS 样式

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: 添加 AI 相关样式**

在 `src/styles.css` 末尾添加：

```css
/* AI 对话模式 */
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

- [ ] **Step 2: 验证样式**

运行: `npm run dev`
Expected: 开关按钮和 AI 工具栏样式正确，与现有 UI 风格一致

---

## Task 5: 功能验证

- [ ] **Step 1: 测试开关功能**

1. 打开应用
2. 点击"AI对话保存模式"开关
3. 验证 AI 工具栏显示
4. 再次点击开关
5. 验证 AI 工具栏隐藏

- [ ] **Step 2: 测试模板插入**

1. 开启 AI 对话保存模式
2. 点击"👤 用户提示词"按钮
3. 验证编辑器中插入 `## 👤 用户提示词\n\n`
4. 点击"🤖 AI回答"按钮
5. 验证编辑器中插入 `## 🤖 AI回答\n\n`

- [ ] **Step 3: 测试预览更新**

1. 开启 AI 对话保存模式和分屏视图
2. 点击任一按钮插入模板
3. 验证预览区正确渲染 Markdown

---

## Task 6: 提交代码

- [ ] **Step 1: 提交所有更改**

```bash
git add index.html src/ai-mode.ts src/main.ts src/styles.css
git commit -m "feat: 添加 AI对话保存模式功能"
```

- [ ] **Step 2: 验证提交**

```bash
git log --oneline -1
```

Expected: 显示新提交的 commit
