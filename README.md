# DeepSeek Harness Portable

DeepSeek Harness 的便携版本，内置 Node.js 运行时。

## 特性

- ✅ **内置 Node.js**：无需预先安装 Node.js
- ✅ **自动安装依赖**：首次运行自动安装 pnpm 和项目依赖
- ✅ **跨平台**：支持 Windows、Linux、macOS
- ✅ **自动构建**：GitHub Actions 自动构建，保持最新版本

## 下载

从 [Releases](https://github.com/849276022/deepseek-harness-portable/releases) 页面下载最新版本。

当前版本：**v0.1.2**（62MB）

## 使用方法

### Windows

1. 下载 `DeepSeekHarness-Portable.tar.gz`
2. 解压到任意目录（如 `D:\DeepSeekHarness`）
3. 双击运行 `launcher.bat`
4. 首次运行会自动安装依赖（约 2-3 分钟）
5. 浏览器访问 `http://127.0.0.1:3000`

### Linux / macOS

1. 下载 `DeepSeekHarness-Portable.tar.gz`
2. 解压到任意目录
3. 运行 `./launcher.sh`
4. 首次运行会自动安装依赖
5. 浏览器访问 `http://127.0.0.1:3000`

## 首次运行说明

首次运行时，launcher 会自动：
1. 检查并安装 pnpm（使用内置 npm）
2. 安装项目依赖（`pnpm install --shamefully-hoist`）
3. 启动服务

**注意**：首次运行需要网络连接，安装过程约 2-3 分钟。

## 目录结构

```
portable/
├── node/                  # 内置 Node.js 运行时
│   ├── node.exe           # Node.js 可执行文件（Windows）
│   ├── node               # Node.js 可执行文件（Linux/macOS）
│   └── ...
├── src/                   # 项目源码
│   ├── apps/              # 应用程序
│   │   ├── cli/           # CLI 工具
│   │   └── web/           # Web 界面
│   ├── packages/          # 核心包
│   ├── vendor/            # 第三方依赖
│   ├── patches/           # pnpm 补丁
│   ├── scripts/           # 构建脚本
│   ├── package.json       # 项目配置
│   └── pnpm-lock.yaml     # 依赖锁定
├── launcher.bat           # Windows 启动脚本
├── launcher.sh            # Linux/macOS 启动脚本
└── README.md              # 本文件
```

## 系统要求

- **操作系统**：Windows 10/11、Linux、macOS
- **内存**：建议 4GB+
- **磁盘空间**：约 1GB（解压后 + 依赖）
- **网络**：首次运行需要（安装依赖）

## 配置

首次启动后，需要配置 DeepSeek API Key：

1. 访问 `http://127.0.0.1:3000`
2. 进入设置页面
3. 输入你的 DeepSeek API Key
4. 保存配置

## 技术细节

### 为什么首次运行要安装依赖？

DeepSeek Harness 使用 pnpm 管理依赖，pnpm 的 node_modules 包含大量符号链接。这些符号链接在 Linux 上打包后，解压到 Windows 会断链，导致无法运行。

**解决方案**：
- 不预装 node_modules（避免符号链接问题）
- 首次运行时在目标平台执行 `pnpm install`
- 使用 `--shamefully-hoist` 扁平化依赖结构

### 构建流程

GitHub Actions 自动执行：
1. 克隆上游仓库
2. 安装依赖并构建
3. 下载 Node.js 便携版
4. 复制源码（不含 node_modules）
5. 打包为 tar.gz

## 故障排除

### 端口被占用

如果 3000 端口被占用，可以修改启动脚本中的端口号：

```bash
# Windows: 编辑 launcher.bat
"%NODE_EXE%" apps\cli\lib\bin.js web --port 8080

# Linux/macOS: 编辑 launcher.sh
"$NODE_EXE" apps/cli/lib/bin.js web --port 8080
```

### 依赖安装失败

如果首次运行时依赖安装失败：

1. 检查网络连接
2. 删除 `src/node_modules` 目录
3. 重新运行 launcher

### Windows 乱码问题

launcher.bat 使用全英文，避免编码问题。如果出现乱码：
- 确保使用最新版本的 launcher.bat
- 不要用文本编辑器修改后保存为其他编码

## 许可证

遵循 DeepSeek Harness 官方许可证。

## 相关链接

- [DeepSeek Harness 官方仓库](https://github.com/deepseek-ai/deepseek-harness)
- [问题反馈](https://github.com/849276022/deepseek-harness-portable/issues)
