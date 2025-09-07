# Online Code Editor (多语言 Docker 沙箱)

一个基于Docker的安全多语言在线代码编辑器，支持JavaScript、Python和Java代码的实时编写与执行。

## 🚀 项目特点

- **多语言支持**：内置支持JavaScript (Node.js)、Python和Java三种主流编程语言
- **Docker沙箱隔离**：所有代码在Docker容器中安全执行，完全隔离主机环境，杜绝安全风险
- **Monaco Editor集成**：采用VS Code同款编辑器，提供专业的代码编辑体验、语法高亮和自动补全
- **实时执行反馈**：代码执行结果通过弹窗实时展示，方便调试
- **轻量级架构**：前后端分离设计，部署简单，易于扩展

## 🛠️ 技术栈

### 前端
- React 18
- Monaco Editor (@monaco-editor/react)
- React Scripts

### 后端
- Node.js + Express
- Docker API集成

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
        