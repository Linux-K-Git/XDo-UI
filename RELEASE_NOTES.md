# Release Notes v2.4.0

## 🚀 What's New / 更新亮点

### 🎨 Visual & Experience / 视觉与体验
*   **New Default Theme**: The system now defaults to the `gradient` theme, offering a more immersive sci-fi aesthetic out of the box（if not set default，will use `gradient` theme in `theme` folder）.
    *   **全新默认主题**：系统现在默认使用 `gradient` 主题，开箱即提供更具沉浸感的科幻美学体验。（如果没有默认，可以前往theme文件夹切换）
*   **Bilingual Welcome Message**: The terminal welcome message is now fully bilingual (English/Chinese).
    *   **双语欢迎信息**：终端欢迎信息现在完全支持中英双语显示。

### ⚡ Technical Improvements / 技术改进
*   **PowerShell Syntax Highlighting**: Integrated `PSReadLine` to provide rich syntax highlighting for PowerShell sessions (keywords, strings, variables, etc.).
    *   **PowerShell 语法高亮**：集成了 `PSReadLine`，为 PowerShell 会话提供丰富的语法高亮（关键字、字符串、变量等）。
*   **Architecture Documentation**: Added comprehensive `ARCHITECTURE.md` (bilingual) detailing the project structure and data flow.
    *   **架构文档**：新增了详尽的 `ARCHITECTURE.md`（双语），详细说明了项目结构和数据流。
*   **Security Policy Update**: Updated `SECURITY.md` with supported versions and reporting guidelines.
    *   **安全策略更新**：更新了 `SECURITY.md`，明确了支持的版本和漏洞报告指南。

### 🛠 Build System / 构建系统
*   **One-Click Build**: Introduced unified build commands (`npm run build:win`, `build:linux`, `build:darwin`) that handle dependency installation, pre-build processing, and packaging in a single step.
    *   **一键构建**：引入了统一的构建命令（`npm run build:win` 等），一步完成依赖安装、预构建处理和打包。
*   **Windows x64 Optimization**: Optimized Windows build configuration to target x64 architecture exclusively, reducing build time and package size.
    *   **Windows x64 优化**：优化了 Windows 构建配置，专注于 x64 架构，减少了构建时间和安装包体积。
*   **Build Script Fixes**: Resolved issues with directory creation/cleanup in Windows build scripts by migrating to Node.js-based file operations.
    *   **构建脚本修复**：通过迁移到基于 Node.js 的文件操作，解决了 Windows 构建脚本中目录创建/清理的问题。

## 📦 Installation / 安装

### Windows
Download `XDo-UI-Windows-x64.exe` and run the installer.
下载 `XDo-UI-Windows-x64.exe` 并运行安装程序。

### Linux
Download `XDo-UI-Linux-x64.AppImage`, make it executable (`chmod +x`), and run.
下载 `XDo-UI-Linux-x64.AppImage`，赋予执行权限 (`chmod +x`) 并运行。

### macOS
Download `XDo-UI-macOS-x64.dmg` and drag the app to your Applications folder.
下载 `XDo-UI-macOS-x64.dmg` 并将应用拖入应用程序文件夹。

---
*Happy Hacking!*
*祝您黑客愉快！*
