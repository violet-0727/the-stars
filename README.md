# 星途剧情编辑器 (TheStars Story Editor)

[![Electron](https://img.shields.io/badge/Electron-36.9.5-blue.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646cff.svg)](https://vitejs.dev/)

**星途剧情编辑器** 是一款专为二次元风格视觉小说（Visual Novel）设计的剧情制作工具。它模仿了类似《崩坏：星穹铁道》等现代二次元游戏的手机信笺/聊天交互界面，旨在为创作者提供直观、高效的剧情编写体验。

---

## ✨ 核心特性

- 📱 **沉浸式 UI 设计**：深度还原二次元游戏风格的暗色科幻主题界面。
- 🎭 **多维度剧情编辑**：
  - **对话管理**：支持多角色同时编辑，轻松切换发件人。
  - **消息类型**：支持普通对话、系统旁白、选项分支（多分支切换）、延迟显示、图片插入。
- 👥 **角色资产库**：内置数十位预设角色头像，支持快速搜索与置顶管理。
- 💾 **工程化管理**：
  - 导出/导入自定义 `.ssp` (Star Story Project) 格式工程文件。
  - 自动处理中文字符路径，确保打包后资源（头像、背景、字体）完美加载。
- 🖥️ **跨平台打包**：支持一键生成 Windows 安装包 (`NSIS`) 及免安装便携版。

---

## 🛠️ 技术架构

项目基于现代化的桌面应用开发栈重构：

- **框架**: [React 18](https://reactjs.org/) (Hooks / Functional Components)
- **开发语言**: [TypeScript](https://www.typescriptlang.org/)
- **构建工具**: [Vite 5](https://vitejs.dev/) (提供极速热更新体验)
- **桌面端环境**: [Electron 36](https://www.electronjs.org/)
- **样式方案**: 原生 CSS (基于 Flexbox 与 Grid 布局)
- **通信协议**: 自定义 `app://` 协议（解决 Electron 环境下中文路径资源读取 Bug）

---

## 🚀 快速开始

### 1. 环境准备
确保您的计算机已安装 [Node.js](https://nodejs.org/) (建议 v18.0.0+)。

### 2. 安装依赖
```bash
npm install
```

### 3. 开发模式
启动 Vite 服务并联动唤起 Electron 客户端：
```bash
npm run dev
```

### 4. 项目打包
生成正式环境的可执行文件：
```bash
# 生成 Windows 安装程序和便携版
npm run dist
```
*注：打包脚本已配置国内镜像源，无需担心下载 Electron 依赖缓慢的问题。*

---

## 📂 项目结构

```text
├── electron/          # Electron 主进程与预加载脚本
├── src/               # React 源代码
│   ├── components/    # 组件库 (Toolbar, ChatArea, etc.)
│   ├── types.ts       # TypeScript 类型定义
│   └── index.css      # 全局样式配置
├── public/            # 静态资源文件 (头像、字体、背景)
├── dist/              # 前端编译产物 (构建后生成)
├── release/           # 可执行文件产物 (打包后生成)
└── vite.config.ts     # Vite 构建配置
```

---

## 📝 许可证

本项目采用 [ISC License](LICENSE) 许可协议。
