# XDo-UI Architecture Documentation / XDo-UI 架构文档

## Overview / 概述
XDo-UI is an Electron-based application that simulates a sci-fi desktop interface. It combines a fully functional terminal emulator with system monitoring modules and a touch-friendly virtual keyboard.
XDo-UI 是一个基于 Electron 的应用程序，模拟科幻桌面界面。它结合了功能齐全的终端模拟器、系统监控模块和支持触摸的虚拟键盘。

## Directory Structure / 目录结构

### Root Directory / 根目录
- **`src/`**: The core source code of the application.
  - 应用程序的核心源代码。
- **`media/`**: Assets for the repository (logos, screenshots).
  - 仓库的资源文件（Logo、截图）。
- **`dist/`**: (Generated) Output directory for built binaries.
  - （自动生成）构建产物的输出目录。
- **`prebuild-src/`**: (Generated) Temporary directory for build preparation.
  - （自动生成）构建准备阶段的临时目录。
- **`GIT_GUIDE.md`**: Guide for Git operations and workflow.
  - Git 操作和工作流指南。
- **`ARCHITECTURE.md`**: This document.
  - 本架构文档。

### Source (`src/`) / 源代码目录
The application follows a standard Electron Main/Renderer architecture:
应用程序遵循标准的 Electron 主进程/渲染进程架构：

#### Entry Points / 入口文件
- **`_boot.js`**: **Main Process**. Handles window creation, application lifecycle, global shortcuts, and OS interactions (like pty spawning).
  - **主进程**。处理窗口创建、应用程序生命周期、全局快捷键和系统交互（如 pty 孵化）。
- **`_renderer.js`**: **Renderer Process**. Loads the UI, initializes the DOM, and coordinates the instantiation of UI modules.
  - **渲染进程**。加载 UI、初始化 DOM 并协调 UI 模块的实例化。
- **`ui.html`**: The main HTML entry point loaded by the window.
  - 窗口加载的主要 HTML 入口点。

#### Modules (`src/classes/`) / 模块目录
The application logic is modularized into classes, each responsible for a specific component of the interface:
应用程序逻辑模块化为类，每个类负责界面的特定组件：

- **System Monitoring / 系统监控**:
  - `cpuinfo.class.js`: Monitors CPU usage, frequency, and processes. (监控 CPU 使用率、频率和进程)
  - `ramwatcher.class.js`: Monitors RAM and Swap usage. (监控 RAM 和 Swap 使用情况)
  - `netstat.class.js`: Monitors network traffic and active connections. (监控网络流量和活动连接)
  - `sysinfo.class.js`: General system info (OS, Uptime, Battery). (通用系统信息：系统、运行时间、电池)
  - `hardwareInspector.class.js`: detailed hardware information. (详细硬件信息)

- **Terminal & Filesystem / 终端与文件系统**:
  - `terminal.class.js`: Wraps `xterm.js` and `node-pty` to provide the terminal emulator. Handles shell spawning, resizing, and input/output. (封装 `xterm.js` 和 `node-pty` 以提供终端模拟器。处理 Shell 孵化、调整大小和输入/输出)
  - `filesystem.class.js`: Manages the file browser UI, tracking the current working directory (CWD) of the terminal. (管理文件浏览器 UI，跟踪终端的当前工作目录 CWD)
  - `docReader.class.js`: Handles markdown preview/reading functionality. (处理 Markdown 预览/阅读功能)

- **Interface & UX / 界面与用户体验**:
  - `keyboard.class.js`: Virtual on-screen keyboard logic. (虚拟屏幕键盘逻辑)
  - `modal.class.js`: Handles modal popups. (处理模态弹窗)
  - `toplist.class.js`: Displays top processes. (显示顶级进程)
  - `clock.class.js`: Date and time display. (日期和时间显示)
  - `audiofx.class.js`: Sound effects engine. (音效引擎)
  - `particleBackground.class.js`: Background visual effects. (背景视觉特效)
  - `locationGlobe.class.js` / `vendor/encom-globe.js`: 3D Globe visualization. (3D 地球可视化)

#### Assets (`src/assets/`) / 资源目录
- **`css/`**: Modular CSS files. `main.css` is the core, with specific files for each module (e.g., `mod_cpuinfo.css`).
  - 模块化 CSS 文件。`main.css` 是核心，每个模块有单独的文件（如 `mod_cpuinfo.css`）。
- **`themes/`**: JSON files defining color schemes and UI settings.
  - 定义配色方案和 UI 设置的 JSON 文件。
- **`icons/`**: File type icons and application icons.
  - 文件类型图标和应用程序图标。
- **`audio/`**: Sound effect files (.wav).
  - 音效文件 (.wav)。
- **`fonts/`**: Embedded fonts (Fira Code, etc.).
  - 嵌入式字体（Fira Code 等）。

## Data Flow / 数据流
1. **Initialization**: `_boot.js` launches the Electron window.
   - **初始化**：`_boot.js` 启动 Electron 窗口。
2. **UI Load**: `ui.html` loads `_renderer.js`.
   - **UI 加载**：`ui.html` 加载 `_renderer.js`。
3. **Module Boot**: `_renderer.js` imports and instantiates classes from `src/classes/`.
   - **模块启动**：`_renderer.js` 导入并实例化 `src/classes/` 中的类。
4. **Inter-Process Communication (IPC) / 进程间通信**:
   - `node-pty` (in Main) <-> `terminal.class.js` (in Renderer) via Electron IPC for shell output.
     - `node-pty`（主进程）与 `terminal.class.js`（渲染进程）通过 Electron IPC 进行 Shell 输出通信。
   - System stats are gathered via `systeminformation` (mostly in Renderer, some proxied if needed).
     - 系统状态通过 `systeminformation` 收集（主要在渲染进程，必要时进行代理）。

## Build System / 构建系统
- **Scripts**: `package.json` contains platform-specific build scripts (`build:win`, `build-linux`, etc.).
  - **脚本**：`package.json` 包含特定平台的构建脚本（`build:win`, `build-linux` 等）。
- **Process / 流程**:
  1. **Prebuild**: Copies source to `prebuild-src/` and minifies JS/JSON (`prebuild-minify.js`).
     - **预构建**：将源代码复制到 `prebuild-src/` 并压缩 JS/JSON (`prebuild-minify.js`)。
  2. **Install**: Installs production dependencies in `prebuild-src/`.
     - **安装**：在 `prebuild-src/` 中安装生产依赖。
  3. **Package**: Uses `electron-builder` to create the final executable/installer.
     - **打包**：使用 `electron-builder` 创建最终的可执行文件/安装程序。
