# XDo-UI React重构版本技术架构文档

## 1. 架构设计

```mermaid
graph TD
    A[用户浏览器/Electron] --> B[React前端应用]
    B --> C[Electron主进程]
    C --> D[文件系统API]
    C --> E[系统信息API]
    C --> F[音频管理]
    
    subgraph "前端层"
        B
        G[组件系统]
        H[状态管理]
        I[主题系统]
    end
    
    subgraph "Electron层"
        C
        J[IPC通信]
        K[原生API集成]
    end
    
    subgraph "系统层"
        D
        E
        F
        L[操作系统接口]
    end
```

## 2. 技术描述

- 前端：React@18 + TypeScript + Vite + TailwindCSS
- 桌面框架：Electron (最新稳定版)
- 状态管理：Zustand
- 样式系统：CSS Modules + CSS变量
- 构建工具：Vite
- 开发工具：ESLint + Prettier + Vitest

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| / | 主界面，显示三栏布局和所有核心功能 |
| /boot | 启动界面，显示启动日志和标题动画 |
| /settings | 设置页面，配置主题和用户偏好 |

## 4. API定义

### 4.1 核心API

#### 系统信息相关
```
GET /api/system/info
```

响应：
| 参数名称 | 参数类型 | 描述 |
|----------|----------|------|
| cpu | object | CPU信息，包含型号、核心数、使用率 |
| memory | object | 内存信息，包含总量、已用、可用 |
| disk | array | 磁盘信息数组 |
| network | object | 网络接口信息 |

示例：
```json
{
  "cpu": {
    "model": "Intel Core i7",
    "cores": 8,
    "usage": 45.2
  },
  "memory": {
    "total": 16777216,
    "used": 8388608,
    "free": 8388608
  }
}
```

#### 文件系统相关
```
GET /api/filesystem/list
```

请求：
| 参数名称 | 参数类型 | 是否必需 | 描述 |
|----------|----------|----------|------|
| path | string | true | 要列出的目录路径 |
| showHidden | boolean | false | 是否显示隐藏文件 |

响应：
| 参数名称 | 参数类型 | 描述 |
|----------|----------|------|
| files | array | 文件列表 |
| directories | array | 目录列表 |

#### 主题系统相关
```
POST /api/theme/apply
```

请求：
| 参数名称 | 参数类型 | 是否必需 | 描述 |
|----------|----------|----------|------|
| themeName | string | true | 主题名称 |
| customColors | object | false | 自定义颜色配置 |

## 5. 服务器架构图

```mermaid
graph TD
    A[React组件层] --> B[服务层]
    B --> C[Electron IPC层]
    C --> D[系统API层]
    
    subgraph "React应用"
        A
        E[状态管理]
        F[主题系统]
    end
    
    subgraph "服务层"
        B
        G[音频管理器]
        H[设置管理器]
        I[文件服务]
    end
    
    subgraph "Electron进程"
        C
        J[主进程]
        K[渲染进程]
    end
```

## 6. 数据模型

### 6.1 数据模型定义

```mermaid
erDiagram
    SETTINGS ||--o{ THEME_CONFIG : contains
    SETTINGS ||--o{ USER_PREFERENCES : contains
    THEME_CONFIG ||--|| COLOR_SCHEME : uses
    FILE_SYSTEM ||--o{ FILE_ITEM : contains
    SYSTEM_INFO ||--|| CPU_INFO : includes
    SYSTEM_INFO ||--|| MEMORY_INFO : includes
    SYSTEM_INFO ||--|| NETWORK_INFO : includes
    
    SETTINGS {
        string id PK
        string username
        string theme
        boolean nointro
        string keyboard
        boolean hideDotfiles
        boolean fsListView
    }
    
    THEME_CONFIG {
        string name PK
        object colors
        string fontFamily
        object animations
    }
    
    COLOR_SCHEME {
        string primary
        string secondary
        string background
        string text
    }
    
    FILE_ITEM {
        string path PK
        string name
        string type
        number size
        date modified
        boolean isDirectory
    }
    
    SYSTEM_INFO {
        string timestamp PK
        object cpu
        object memory
        object network
        array processes
    }
```

### 6.2 数据定义语言

#### 设置配置 (Settings)
```typescript
// 设置接口定义
interface Settings {
  username?: string;
  theme: string;
  nointro: boolean;
  nointroOverride?: boolean;
  keyboard: string;
  hideDotfiles: boolean;
  fsListView: boolean;
  audioEnabled: boolean;
  customThemeColors?: {
    r: number;
    g: number;
    b: number;
  };
}

// 主题配置接口
interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  fontFamily: string;
  animations: {
    duration: number;
    easing: string;
  };
}

// 文件系统项目接口
interface FileSystemItem {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size: number;
  modified: Date;
  isHidden: boolean;
  permissions: {
    read: boolean;
    write: boolean;
    execute: boolean;
  };
}

// 系统信息接口
interface SystemInfo {
  cpu: {
    model: string;
    cores: number;
    usage: number;
    temperature?: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    cached: number;
  };
  network: {
    interfaces: NetworkInterface[];
    activeConnections: number;
    bytesReceived: number;
    bytesSent: number;
  };
  processes: ProcessInfo[];
}

// 网络接口信息
interface NetworkInterface {
  name: string;
  type: string;
  ip4: string;
  ip6?: string;
  mac: string;
  speed: number;
  isActive: boolean;
}

// 进程信息
interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  user: string;
}
```

#### 初始化数据
```typescript
// 默认设置
const defaultSettings: Settings = {
  theme: 'tron',
  nointro: false,
  keyboard: 'en-US',
  hideDotfiles: true,
  fsListView: false,
  audioEnabled: true
};

// 默认主题配置
const defaultTheme: ThemeConfig = {
  name: 'tron',
  colors: {
    primary: '#00ff00',
    secondary: '#00aa00',
    background: '#000000',
    text: '#00ff00',
    accent: '#ffffff'
  },
  fontFamily: 'Courier New, monospace',
  animations: {
    duration: 500,
    easing: 'cubic-bezier(0.4, 0, 1, 1)'
  }
};
```