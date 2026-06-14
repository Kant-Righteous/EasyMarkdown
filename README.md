# EasyMarkdown

<p align="center">
  <strong>中文</strong> ·
  <a href="README.en.md">English</a> ·
  <a href="README.fr.md">Français</a>
</p>

![EasyMarkdown 预览](demo.png)

## 项目简介

EasyMarkdown 是一款轻量的本地 Markdown 桌面编辑器，支持编辑、实时预览、本地文件保存和 PDF 导出。

## 主要功能

- 新建、打开、保存和另存 Markdown 或文本文件
- 编辑、预览和分屏视图
- Markdown 格式工具栏与常用快捷键
- 最近文件列表
- 轻量的 MDX 渲染
- PDF 导出
- 中文、英语和法语界面
- 在系统默认浏览器中打开预览链接

轻量 MDX 支持内置的 `Icon`、`CardGroup` / `Card`、展开式
`Tabs` / `Tab`，以及有限的安全 HTML。它不是完整的 MDX 运行时，
不会执行组件导入、任意 JSX 或 JavaScript 表达式。

## 技术栈

Tauri 2、Rust、TypeScript、Vite 和 Markdown-it。

## 本地开发

```powershell
npm install
npm run dev
npm run tauri dev
```

前端构建：

```powershell
npm run build
```

## Windows 打包

```powershell
npm run tauri build
```

Windows 构建生成 NSIS `.exe` 安装包，安装界面支持简体中文、法语和英语。

## 许可证

MIT
