# DeepSeek Harness Portable

DeepSeek Harness 的便携版本，内置 Node.js 运行时，解压即用，并预装 QQ 机器人插件。

## 特性

- ✅ **内置 Node.js 22**：无需预先安装 Node.js
- ✅ **自动安装依赖**：首次运行自动装好 pnpm 11 和项目依赖（已配置国内 npmmirror 镜像）
- ✅ **跨平台**：支持 Windows、Linux、macOS
- ✅ **内置 QQ 机器人插件**：在 QQ 上直接和智能体对话
- ✅ **数据独立**：配置、智能体、QQ 凭据统一落在 `data/` 目录，便于备份和便携
- ✅ **自动构建**：GitHub Actions 跟随上游 `deepseek-ai/deepseek-harness` 自动构建发布

## 下载

从 [Releases](https://github.com/849276022/deepseek-harness-portable/releases) 页面下载最新版本。

当前版本：**v0.3.6**（安装包 `DeepSeekHarness-Portable.tar.gz`，约 74MB）

## 使用方法

### Windows

1. 下载 `DeepSeekHarness-Portable.tar.gz`
2. 解压到任意目录（如 `D:\DeepSeekHarness`）
3. 双击运行 `launcher\launcher.bat`
4. 首次运行会自动安装 pnpm 和依赖（约 2-3 分钟）
5. 进入菜单选择：
   - `[1]` 启动 Web UI，浏览器访问 `http://127.0.0.1:3000`
   - `[2]` 启动 QQ 机器人
   - `[3]` 设置 QQ AppID / AppSecret
   - `[4]` Web UI 与 QQ 机器人同时运行

### Linux / macOS

1. 下载 `DeepSeekHarness-Portable.tar.gz`
2. 解压到任意目录
3. 运行 `./launcher/launcher.sh`
4. 首次运行会自动安装依赖（需系统已有 pnpm：`npm install -g pnpm`）
5. 按提示启动 Web UI（`http://127.0.0.1:3000`）或 QQ 机器人

## 首次运行说明

首次运行时，launcher 会自动：
1. 用内置 npm 安装 pnpm 11（Windows 自动执行；Linux/macOS 需自行准备 pnpm）
2. Windows 下将 npm 源设为 `https://registry.npmmirror.com`，加快国内安装
3. 在 `src/` 内执行 `pnpm install --shamefully-hoist --frozen-lockfile`
4. 启动服务

**注意**：首次运行需要网络连接，安装过程约 2-3 分钟。再次启动若已存在 `src/node_modules`，会跳过安装直接进入菜单。

## QQ 机器人

便携版预装了腾讯官方 QQ 机器人插件，在 QQ 上即可与智能体对话。

1. 到 [QQ 开放平台](https://q.qq.com) 创建机器人，在「机器人 → 开发 → 设置」中获取 **AppID** 和 **AppSecret**
2. 在 launcher 菜单选择 `[3]`（或启动 QQ 机器人时按提示）填入凭据
3. 凭据保存在本地 `data/qqbot.env`（权限 600），**不会**进入安装包或仓库
4. 选择 `[2]` 或 `[4]` 启动机器人

> 凭据安全：仓库与安装包内不含任何凭据；插件日志只输出「已填写／未填写」，绝不打印内容。

## 目录结构

```
DeepSeekHarness/
├── node/                  # 内置 Node.js 运行时
│   ├── node.exe / node
│   └── npm / npx
├── src/                   # 项目源码（上游构建产物）
│   ├── apps/              # CLI、Web 等应用
│   ├── packages/          # 核心包
│   └── node_modules/      # 首次运行后生成
├── launcher/
│   ├── launcher.bat       # Windows 启动脚本（交互菜单）
│   └── launcher.sh        # Linux/macOS 启动脚本
├── plugins/
│   └── dsh-qqbot/         # 内置 QQ 机器人插件
├── data/                  # 用户数据（运行后生成，便于备份）
│   ├── .dsh/              # Harness 配置
│   ├── .agents/           # 智能体数据
│   └── qqbot.env          # QQ 凭据（本地私有）
└── README.md
```

## 系统要求

- **操作系统**：Windows 10/11、Linux、macOS
- **内存**：建议 4GB+
- **磁盘空间**：约 1GB（解压后 + 依赖）
- **网络**：首次运行需要（安装依赖）

## 配置 API Key

首次启动后，需要配置模型 API Key：

1. 访问 `http://127.0.0.1:3000`
2. 进入设置页面
3. 输入你的 API Key
4. 保存配置

## 技术细节

### 为什么首次运行要安装依赖？

DeepSeek Harness 使用 pnpm 管理依赖，pnpm 的 node_modules 包含大量符号链接。这些符号链接在 Linux 上打包后，解压到 Windows 会断链，导致无法运行。

**解决方案**：
- 不预装 node_modules（避免符号链接跨平台断链）
- 首次运行时在目标平台执行 `pnpm install`
- 使用 `--shamefully-hoist` 扁平化依赖结构
- 使用 `--frozen-lockfile` 保证依赖版本与锁文件一致

### 构建流程

GitHub Actions 自动执行：
1. 检出本仓库（launcher、插件、工作流）与上游 `deepseek-ai/deepseek-harness`
2. 使用 Node.js 22 + pnpm 11 安装依赖并构建（含 CLI 与 Web）
3. 下载 Node.js 便携版
4. 复制源码、launcher 与 QQ 插件（不含 node_modules）
5. 打包为 `DeepSeekHarness-Portable.tar.gz` 并发布 Release

## 故障排除

### 端口被占用

如果 3000 端口被占用，可在启动命令中指定其他端口：

```bash
# 用 CLI 直接启动并指定端口
node src/apps/cli/lib/bin.js web --port 8080
```

### 依赖安装失败

1. 检查网络连接
2. Windows 确认能访问 `https://registry.npmmirror.com`
3. 删除 `src/node_modules` 目录
4. 重新运行 launcher

### Windows 乱码问题

`launcher.bat` 已用 `chcp 65001` 切换 UTF-8。如仍有乱码：
- 确保使用最新版本的 launcher.bat
- 不要用文本编辑器另存为其他编码

## 版本历史

| 版本 | 日期（约） | 说明 |
|------|-----------|------|
| v0.3.6 | 2026-09-15 | 当前版本，约 74MB |
| v0.3.0 – v0.3.5 | 2026-09 | 交互菜单、QQ 机器人接入与稳定性迭代 |
| v0.2.1 | 2026-09-08 | 起预装 QQ 机器人插件（配置层） |
| v0.1.2 | 2026-08-28 | 首个便携发布版本 |

完整列表见 [Releases](https://github.com/849276022/deepseek-harness-portable/releases)。

## 许可证

遵循 DeepSeek Harness 官方许可证。内置 QQ 机器人插件为 MIT。

## 相关链接

- [DeepSeek Harness 上游仓库](https://github.com/deepseek-ai/deepseek-harness)
- [QQ 开放平台](https://q.qq.com)
- [问题反馈](https://github.com/849276022/deepseek-harness-portable/issues)
