<p align="center">
  <br>
  <img alt="Logo" src="media/horizontal.png">
  <br>
  <a href="https://lgtm.com/projects/g/Linux-K-Git/XDo-UI/context:javascript">
  <a href="https://github.com/Linux-K-Git/XDo-UI/blob/master/LICENSE"><img alt="undefined" src="https://img.shields.io/github/license/Linux-K-Git/XDo-UI.svg?style=popout"></a>
  <br>
</p>

<p align="center">
  <em>Jump to: <br><a href="#features">Features</a> — <a href="#qa">Questions & Answers</a> — <a href="#useful-commands-for-the-nerds">Contributor Instructions</a> — <a href="#credits">Credits</a> — <a href="#licensing">Licensing</a></em>
  <em>跳转到：<br><a href="#features">功能</a> — <a href="#qa">问答</a> — <a href="#useful-commands-for-the-nerds">贡献者说明</a> — <a href="#credits">鸣谢</a> — <a href="#licensing">许可</a></em>
</p>

---

# XDo-UI

XDo-UI is a fullscreen, cross-platform terminal emulator and system monitor that looks and feels like a sci-fi computer interface.
XDo-UI 是一个全屏、跨平台的终端模拟器和系统监视器，其外观和感觉就像一个科幻电脑界面。

XDo-UI inherits from the archived project eDEX-UI (<https://github.com/GitSquared/edex-ui/releases>), but due to excessive code modifications, a new project was created.
XDo-UI 继承于已存档项目 eDEX-UI (<https://github.com/GitSquared/edex-ui/releases>)，但由于修改的代码部分过多，遂新建项目。

While keeping a futuristic look and feel, it strives to maintain a certain level of functionality and to be usable in real-life scenarios, with the larger goal of bringing science-fiction UXs to the mainstream.
在保持未来感外观和感觉的同时，它努力保持一定程度的功能性，并在现实生活中可用，其更大的目标是将科幻用户体验带入主流。

---

## Features
## 功能

- Fully featured terminal emulator with tabs, colors, mouse events, and support for `curses` and `curses`-like applications.
- 功能齐全的终端模拟器，支持标签页、颜色、鼠标事件，并支持 `curses` 和类似 `curses` 的应用程序。
- Real-time system (CPU, RAM, swap, processes) and network (GeoIP, active connections, transfer rates) monitoring.
- 实时系统（CPU、RAM、交换、进程）和网络（GeoIP、活动连接、传输速率）监控。
- Full support for touch-enabled displays, including an on-screen keyboard.
- 全面支持触摸屏显示器，包括屏幕键盘。
- Directory viewer that follows the CWD (current working directory) of the terminal.
- 目录查看器，跟随终端的 CWD（当前工作目录）。
- Advanced customization using themes, on-screen keyboard layouts, CSS injections. See the [wiki](https://github.com/Linux-K-Git/XDo-UI/wiki) for more info.
- 使用主题、屏幕键盘布局、CSS 注入进行高级定制。更多信息请参见 [wiki](https://github.com/Linux-K-Git/XDo-UI/wiki)。
- Optional sound effects made by a talented sound designer for maximum hollywood hacking vibe.
- 可选的音效，由才华横溢的声音设计师制作，带来最大的好莱坞黑客氛围。

---

## Q&A
## 问答

#### How do I get it?
#### 如何获取？

Click on the little badges under the XDo logo at the top of this page, or go to the [Releases](https://github.com/Linux-K-Git/XDo-UI/releases) tab.
点击本页顶部 XDo 标志下的小徽章，或前往 [Releases](https://github.com/Linux-K-Git/XDo-UI/releases) 选项卡下载。

Public release binaries are unsigned ([why](https://gaby.dev/posts/code-signing)). On Linux, you will need to `chmod +x` the AppImage file in order to run it.
公开发布的二进制文件未签名（[原因](https://gaby.dev/posts/code-signing)）。在 Linux 上，您需要 `chmod +x` AppImage 文件才能运行它。

#### I have a problem!
#### 我有问题！

Search through the [Issues](https://github.com/Linux-K-Git/XDo-UI/issues) to see if yours has already been reported. If you're confident it hasn't been reported yet, feel free to open up a new one. If you see your issue and it's been closed, it probably means that the fix for it will ship in the next version, and you'll have to wait a bit.
搜索 [Issues](https://github.com/Linux-K-Git/XDo-UI/issues) 查看您的问题是否已被报告。如果您确信尚未报告，请随时提出新问题。如果您看到您的问题已被关闭，那可能意味着修复将在下一个版本中发布，您需要稍等片刻。

#### Can you disable the keyboard/the filesystem display?
#### 可以禁用键盘/文件系统显示吗？

You can't disable them (yet) but you can hide them. See the `tron-notype` theme.
您暂时无法禁用它们，但可以隐藏它们。请参阅 `tron-notype` 主题。

#### Why is the file browser saying that "Tracking Failed"? (Windows only)
#### 为什么文件浏览器显示“跟踪失败”？（仅限 Windows）

On Linux and macOS, XDo tracks where you're going in your terminal tab to display the content of the current folder on-screen.
在 Linux 和 macOS 上，XDo 会跟踪您在终端选项卡中的位置，以在屏幕上显示当前文件夹的内容。

Sadly, this is technically impossible to do on Windows right now, so the file browser reverts back to a "detached" mode. You can still use it to browse files & directories and click on files to input their path in the terminal.
遗憾的是，目前在 Windows 上技术上无法实现这一点，因此文件浏览器会恢复到“分离”模式。您仍然可以使用它来浏览文件和目录，并点击文件以在终端中输入其路径。

#### Is this repo actively maintained?
#### 这个仓库还在积极维护吗？

Yes, it is. I'm still working on it and I'm planning to add new features and improvements.
是的，它是。我仍然在工作，我计划添加新功能和改进。

Because the previous eDEX-UI project author archived it, I planned to continue it and adopt a completely new technological architecture, which led to XDo-UI.
因为前 eDEX-UI 项目作者将其归档，我计划让其继续下去，并采用全新的技术架构，于是就有了 XDo-UI。

---

## Useful commands for the nerds
## 极客的有用命令

**IMPORTANT NOTE:** the following instructions are meant for running XDo from the latest unoptimized, unreleased, development version. If you'd like to get stable software instead, refer to [these](#how-do-i-get-it) instructions.
**重要提示：** 以下说明适用于从最新未优化、未发布、开发版本运行 XDo。如果您想获取稳定软件，请参阅 [这些](#how-do-i-get-it) 说明。

#### Starting from source:
#### 从源代码启动：

On *nix systems (You'll need the Xcode command line tools on macOS):
在 *nix 系统上（macOS 上需要 Xcode 命令行工具）：

- Clone the repository
- 克隆仓库
- `npm run install-linux`
- `npm run start`

On Windows:
在 Windows 上：

- Start cmd or powershell **as administrator**
- **以管理员身份**启动 cmd 或 powershell
- Clone the repository
- 克隆仓库
- `npm run install-windows`
- `npm run start`

#### Building
#### 构建

Note: Due to native modules, you can only build targets for the host OS you are using.
注意：由于原生模块，您只能为您正在使用的主机操作系统构建目标。

- `npm install` (NOT `install-linux` or `install-windows`)
- `npm run build:win` (Windows)
- `npm run build:linux` (Linux)
- `npm run build:darwin` (macOS)

The script will minify the source code, recompile native dependencies and create distributable assets in the `dist` folder.
该脚本将压缩源代码，重新编译原生依赖项，并在 `dist` 文件夹中创建可分发资产。

---

## Credits
## 鸣谢

XDo-UI's source code was primarily written by me, [Linux-K](https://github.com/Linux-K-Git/XDo-UI).
XDo-UI 的部分源代码和主要的修改代码由我 [Linux-K](https://github.com/Linux-K-Git/XDo-UI) 编写。

Old eDEX-UI's source code was primarily written by [Squared](https://github.com/GitSquared/edex-ui).
原 eDEX-UI 的源代码主要由 [Squared](https://github.com/GitSquared/edex-ui) 编写。

XDo-UI inherits from the archived project eDEX-UI, but due to excessive code modifications, a new project was created.
XDo-UI 继承于已存档项目 eDEX-UI，但由于修改的代码部分过多，遂新建项目。

Please refer to the original author's project for related resources and acknowledgements: <https://github.com/GitSquared/edex-ui/releases>.
相关资源和鸣谢请查看原作者的项目：<https://github.com/GitSquared/edex-ui/releases>。

---

## Licensing
## 许可

Licensed under the [GPLv3.0](https://github.com/Linux-K-Git/XDo-UI/blob/master/LICENSE).
根据 [GPLv3.0](https://github.com/Linux-K-Git/XDo-UI/blob/master/LICENSE) 许可。
