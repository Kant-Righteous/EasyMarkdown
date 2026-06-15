# 完整 Markdown 预览设计

## 目标

让第二行工具栏生成的全部 Markdown 或扩展语法都能在实时预览和 PDF 导出预览中正确显示，包括：

- `==高亮==`
- `- [ ]` 与 `- [x]` 任务列表
- `$...$` 内联公式
- `$$...$$` 块级公式
- `[^1]` 脚注引用与定义
- `mermaid` 围栏代码块

现有标题、强调、列表、引用、代码、表格、链接、图片、水平线、有限 MDX 和源码行锚点行为必须保持兼容。

## 根因

当前 `src/markdown.ts` 只初始化了基础 `markdown-it`。基础解析器不支持 KaTeX 公式、脚注、任务列表和 `==高亮==`，也不会执行 Mermaid 图表渲染。因此工具栏虽然插入了正确语法，预览端仍把这些内容当作普通文本。

## 架构

### 同步 Markdown 渲染

在现有 `markdown-it` 实例中启用：

- `@mdit/plugin-katex`
- `@mdit/plugin-footnote`
- `@mdit/plugin-tasklist`
- `@mdit/plugin-mark`

KaTeX 使用美元符号分隔方式，支持 `$...$` 和 `$$...$$`。任务列表复选框保持禁用状态，预览区不能反向修改 Markdown。

### Mermaid 异步增强

`mermaid` 围栏代码块在同步解析阶段生成安全的占位容器，容器保留：

- 已转义的 Mermaid 源码
- `data-source-line` 源码行锚点
- 未渲染和错误状态

新建 `src/mermaid.ts`，仅在页面中确实存在 Mermaid 容器时动态加载 Mermaid。初始化配置固定为：

- `startOnLoad: false`
- `securityLevel: "strict"`
- 禁止 HTML 标签和点击行为

渲染成功后将占位内容替换为 SVG。渲染失败时保留源码，并显示简短错误状态，不影响其他 Markdown 内容。

### 实时预览

`src/main.ts` 继续先同步写入 `renderMarkdown()` 结果，再异步调用 Mermaid 增强。每次编辑都会生成新的 DOM 节点；异步任务只更新仍连接在当前预览区的节点，避免快速输入时旧结果覆盖新内容。

### PDF 导出

PDF 导出在创建打印窗口前，将 `renderMarkdown()` 的结果放入临时 DOM 容器，等待 Mermaid 增强完成，再读取最终 HTML。KaTeX 已在同步阶段生成 HTML，Mermaid SVG 在异步阶段生成，因此打印预览和主预览使用相同结果。

## 样式

实时预览和打印样式都需要覆盖：

- KaTeX 字体与布局
- 块级公式横向溢出
- 脚注分隔线、编号和返回链接
- 任务列表复选框与列表缩进
- `mark` 高亮颜色
- Mermaid SVG 自适应宽度
- Mermaid 错误回退区域

KaTeX 基础 CSS 由应用样式引入；打印样式补充相同的必要规则，避免 PDF 中公式和图表溢出页面。

## 安全与错误处理

- 保持 `html: false`。
- 保持危险链接过滤和外部链接属性。
- Mermaid 使用严格安全模式，不启用交互链接。
- Mermaid 源码在进入占位 HTML 前必须转义。
- 单个无效公式显示 KaTeX 错误文本，不中断文档。
- 单个无效 Mermaid 图表显示源码回退，不中断文档。

## 测试

- 渲染测试覆盖内联公式、块级公式、脚注、任务列表和高亮。
- Mermaid 测试覆盖占位结构、源码转义和源码行锚点。
- 源码测试覆盖主预览和 PDF 导出都调用 Mermaid 增强。
- 样式测试覆盖实时预览和打印样式。
- 运行完整测试和生产构建。
- 在浏览器中验证有效及无效语法，确认单个错误不会破坏整页预览。
