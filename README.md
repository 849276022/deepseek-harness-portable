# DeepSeek Harness Portable

DeepSeek Harness 的便携版本，解压即用，无需安装。

## 特性

- ✅ **解压即用**：内置 Node.js 运行时，无需安装任何依赖
- ✅ **视觉模型支持**：支持 DeepSeek-V4-Flash-Vision-Exp
- ✅ **跨平台**：支持 Windows、Linux、macOS
- ✅ **自动构建**：GitHub Actions 自动构建，保持最新版本

## 下载

从 [Releases](https://github.com/849276022/deepseek-harness-portable/releases) 页面下载最新版本。

### 版本说明

- **完整版** (`DeepSeekHarness-Portable-Full-v2.tar.gz`)：包含所有依赖，解压即用（推荐）
- **精简版** (`DeepSeekHarness-Portable-Lite.tar.gz`)：需要手动安装依赖

## 使用方法

### Windows

1. 下载 `DeepSeekHarness-Portable-Full-v2.tar.gz`
2. 解压到任意目录（如 `D:\DeepSeekHarness`）
3. 双击运行 `一键启动.bat`
4. 浏览器访问 `http://127.0.0.1:3000`

### Linux / macOS

1. 下载 `DeepSeekHarness-Portable-Full-v2.tar.gz`
2. 解压到任意目录
3. 运行 `./一键启动.sh`
4. 浏览器访问 `http://127.0.0.1:3000`

## 目录结构

```
DeepSeekHarness-Portable/
├── node-win-x64/          # 内置 Node.js 运行时
│   ├── node.exe           # Node.js 可执行文件
│   ├── npm.cmd            # npm 命令
│   └── ...
├── 一键启动.bat           # Windows 启动脚本
├── 一键启动.sh            # Linux/macOS 启动脚本
├── apps/                  # 应用程序
│   ├── cli/               # CLI 工具
│   └── web/               # Web 界面
├── packages/              # 核心包
├── vendor/                # 第三方依赖
└── node_modules/          # npm 依赖（完整版已包含）
```

## 系统要求

- **操作系统**：Windows 10/11、Linux、macOS
- **内存**：建议 4GB+
- **磁盘空间**：约 2GB（解压后）

## 配置

首次启动后，需要配置 DeepSeek API Key：

1. 访问 `http://127.0.0.1:3000`
2. 进入设置页面
3. 输入你的 DeepSeek API Key
4. 保存配置

## 自动构建

本项目使用 GitHub Actions 自动构建便携版本。

### 触发方式

- **手动触发**：在 Actions 页面选择 "Build DeepSeek Harness Portable"，点击 "Run workflow"
- **自动触发**：推送 tag（如 `v0.1.1-rc.2`）时自动构建

### 构建产物

- 完整版：包含所有依赖，解压即用
- 精简版：需要手动运行 `pnpm install` 安装依赖

## 故障排除

### 端口被占用

如果 3000 端口被占用，可以修改启动脚本中的端口号：

```bash
# Windows: 编辑 一键启动.bat
node apps\cli\lib\bin.js web --port 8080

# Linux/macOS: 编辑 一键启动.sh
node apps/cli/lib/bin.js web --port 8080
```

### 依赖安装失败

如果依赖安装失败，尝试：

```bash
# 清理缓存
pnpm store prune

# 重新安装
set CI=true
pnpm install
```

## 许可证

遵循 DeepSeek Harness 官方许可证。

## 相关链接

- [DeepSeek Harness 官方仓库](https://github.com/deepseek-ai/deepseek-harness)
- [问题反馈](https://github.com/849276022/deepseek-harness-portable/issues)
