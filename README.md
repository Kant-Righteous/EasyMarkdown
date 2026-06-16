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
npm run dev:desktop
npm run desktop:dev
```

桌面前端构建：

```powershell
npm run build:desktop
```

移动端前端开发和构建：

```powershell
npm run dev:mobile
npm run build:mobile
```

桌面端和移动端使用独立前端入口：

- 桌面端入口：`src/desktop/index.html`
- 移动端入口：`src/mobile/index.html`
- 共享 Markdown、状态、命令、国际化和通用工具位于 `src/shared`
- 桌面构建输出到 `dist-desktop`
- 移动构建输出到 `dist-mobile`

旧的快捷命令仍保留：

```powershell
npm run dev
npm run build
```

## Windows 打包

```powershell
npm run desktop:build
```

等价于：

```powershell
npm run tauri build
```

Windows 构建使用 `src-tauri/tauri.windows.conf.json` 和 `dist-desktop`，生成 NSIS `.exe` 安装包，安装界面支持简体中文、法语和英语。

## Android 开发与打包

```powershell
npm run android:dev
npm run android:build
```

Android 平台配置使用 `src-tauri/tauri.android.conf.json` 和 `dist-mobile`。`scripts/android-dev.ps1` 会设置本机 Java、Android SDK 和 NDK 环境变量后调用 `npm run tauri android dev`。

## 许可证

MIT
