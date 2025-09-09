# Online Editor - 安全多语言在线代码编辑器

<div align="center">
  <img src="https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Monaco%20Editor-VSCode%20Style-blue?style=flat-square&logo=visual-studio-code" alt="Monaco Editor">
  <img src="https://img.shields.io/badge/Docker-Sandboxed%20Execution-blue?style=flat-square&logo=docker" alt="Docker">
  <img src="https://img.shields.io/badge/TypeScript-Type%20Safe-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-18-green?style=flat-square&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Python-3.11-green?style=flat-square&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/Java-17-red?style=flat-square&logo=java" alt="Java">
</div>

## 📖 项目简介

Online Editor 是一个基于Docker容器技术的安全多语言在线代码编辑器平台，为开发者提供JavaScript、Python和Java代码的实时编写与执行环境。项目采用前后端分离架构，通过Docker容器实现代码的安全隔离执行，确保主机环境不受影响。

## 🎯 设计理念

我们的目标是创建一个安全、高效、易用的在线编程环境，让开发者可以随时随地编写、测试和运行代码，而无需担心环境配置和安全问题。

## ✨ 核心特性

### 🔧 多语言支持
- 内置支持JavaScript (Node.js 18)、Python 3.11和Java 17三种主流编程语言
- 每种语言都在独立的Docker容器中运行，确保运行环境的纯净性和稳定性

### 🛡️ Docker沙箱隔离
- 所有代码在独立Docker容器中安全执行，完全隔离主机环境，杜绝安全风险
- 代码执行设置超时限制，防止恶意代码耗尽系统资源
- 执行完成后自动清理临时文件和容器，保护用户数据隐私

### 💻 专业编辑器体验
- 集成Monaco Editor（VS Code同款编辑器核心）
- 提供语法高亮、代码补全、括号匹配、错误提示等专业级编辑功能
- 支持代码折叠、多光标编辑、查找替换等高级编辑功能
- 支持明暗主题切换，提升开发体验

### 📊 实时执行与反馈
- 代码执行结果实时展示，支持标准输出和错误信息捕获
- 交互式终端支持，可输入命令并查看响应
- 多文件项目支持，便于组织和管理代码

### 🏗️ 插件扩展系统
- 内置插件机制，支持功能扩展和定制
- 集成OpenVSX插件市场，可安装丰富的VS Code兼容插件
- 支持自定义状态栏、侧边栏和命令面板贡献

### 📱 现代化界面设计
- 仿照VS Code的界面布局，包括菜单栏、活动栏、编辑区和状态栏
- 完全响应式设计，适应不同屏幕尺寸
- 支持自定义布局调整，拖拽改变面板大小

### 🔄 工作区管理
- 文件系统树结构，支持文件和文件夹的创建、删除、重命名
- 支持代码文件的保存和恢复
- 多文件项目的组织和管理

## 🛠️ 技术栈

### 前端技术
- **框架**: React 18 + TypeScript
- **编辑器核心**: Monaco Editor (@monaco-editor/react)
- **样式框架**: Tailwind CSS
- **构建工具**: React Scripts
- **终端模拟**: xterm.js
- **其他库**: React Context API (状态管理)

### 后端技术
- **服务器**: Node.js + Express
- **容器化**: Docker API 集成
- **运行环境**: Node.js 18、Python 3.11、OpenJDK 17
- **文件系统**: 临时文件管理和清理
- **网络**: RESTful API设计

## 📁 项目结构

```
online-editor/
├── .gitignore           # Git忽略配置文件
├── README.md            # 项目说明文档
├── client/              # 前端React应用
│   ├── package-lock.json # 前端依赖锁定文件
│   ├── package.json     # 前端项目配置和依赖
│   ├── public/          # 静态资源目录
│   │   └── index.html   # HTML入口文件
│   └── src/             # 前端源代码
│       ├── App.js       # 主应用组件
│       ├── api.js       # API请求封装
│       ├── components/  # 组件目录
│       ├── index.css    # 全局样式
│       └── index.js     # React渲染入口
├── docker/              # Docker相关配置
│   ├── compose.yml      # Docker Compose配置
│   ├── java.Dockerfile  # Java环境Dockerfile
│   ├── node.Dockerfile  # Node.js环境Dockerfile
│   └── python.Dockerfile # Python环境Dockerfile
└── server/              # 后端Express应用
    ├── package-lock.json # 后端依赖锁定文件
    ├── package.json     # 后端项目配置和依赖
    ├── server.js        # 主服务器文件
    └── temp/            # 临时文件存储目录
```

## 🚦 快速开始

### 前提条件

在开始之前，请确保您的系统已安装以下软件：
- Node.js (建议 v16 或更高版本)
- npm (Node.js 包管理器)
- Docker (并确保Docker服务已启动)

### 安装步骤

1. **克隆或下载项目**

2. **安装项目依赖**

```bash
# 安装前端依赖
cd client && npm install

# 安装后端依赖
cd ../server && npm install
```

3. **拉取必要的Docker镜像**

```bash
docker pull node:18
 docker pull python:3.11
 docker pull openjdk:17
```

### 运行项目

需要打开两个终端窗口，分别运行前端和后端服务：

1. **启动后端服务**

```bash
cd server && npm start
# 服务将在 http://localhost:3001 启动
```

2. **启动前端服务**

```bash
cd client && npm start
# 服务将在 http://localhost:3000 启动
```

3. **访问应用**

打开浏览器，访问 <http://localhost:3000>

## 🖥️ 使用说明

1. 在顶部的语言选择下拉菜单中选择您想要使用的编程语言（JavaScript、Python或Java）
2. 在编辑器中编写您的代码
3. 点击"Run Code"按钮执行代码
4. 代码执行结果将通过弹窗显示

### 示例代码

**JavaScript示例:**
```javascript
console.log('Hello, World!');
const sum = (a, b) => a + b;
console.log('Sum of 5 and 3:', sum(5, 3));
```

**Python示例:**
```python
print('Hello, World!')
def sum(a, b):
    return a + b
print('Sum of 5 and 3:', sum(5, 3))
```

**Java示例:**
```java
public class Temp {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        int result = sum(5, 3);
        System.out.println("Sum of 5 and 3: " + result);
    }
    
    public static int sum(int a, int b) {
        return a + b;
    }
}
```

## 🔒 安全机制

- 所有代码在Docker容器中隔离执行，不会影响主机系统
- 代码执行设置了8秒超时限制，防止无限循环导致资源浪费
- 执行完成后会自动清理临时文件，保护用户数据隐私

## ⚠️ 常见问题解决

### 依赖安装问题

如果在安装前端依赖时遇到 `core-js-pure` 相关错误，可以尝试以下解决方案：

```bash
# 删除现有的依赖和锁定文件
cd client
rd /s /q node_modules
# 或手动删除 node_modules 目录和 package-lock.json 文件

# 清除npm缓存
npm cache clean --force

# 重新安装依赖
npm install
```

### Docker相关问题

- 确保Docker服务已启动
- 确保当前用户有足够的权限运行Docker命令
- 如果遇到端口冲突，可以修改 `server.js` 中的端口配置

## 🤝 开发指南

### 后端API

**POST /run**
- 功能：执行用户提交的代码
- 请求体：
  ```json
  {
    "code": "用户编写的代码",
    "language": "javascript|python|java"
  }
  ```
- 响应：
  ```json
  {
    "output": "代码执行结果" // 成功时
  }
  ```
  或
  ```json
  {
    "error": "错误信息" // 失败时
  }
  ```

## 📄 许可证

MIT License

## 🌟 致谢

感谢所有为开源事业做出贡献的开发者！
        