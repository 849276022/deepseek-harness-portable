# DeepSeek Harness 便携版

解压即用的本地 AI 助手，基于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 官方版本打包。

## 📦 下载

从 [Releases](https://github.com/849276022/deepseek-harness-portable/releases) 页面下载最新版本。

- **完整版** (`DeepSeekHarness-Portable-Full.tar.gz`): 包含 node_modules，解压即用
- **精简版** (`DeepSeekHarness-Portable-Lite.tar.gz`): 不含 node_modules，需要运行 `pnpm install`

## 🚀 使用方法

### 快速开始

1. 下载并解压 `DeepSeekHarness-Portable-Full.tar.gz` 到任意目录
2. 双击运行 `一键启动.bat` (Windows) 或 `./一键启动.sh` (Linux/macOS)
3. 浏览器访问 `http://127.0.0.1:3000`
4. 在设置中配置 DeepSeek API Key

### 系统要求

- **操作系统**: Windows 10/11, Linux, macOS
- **内存**: 4GB+
- **磁盘空间**: 2GB+（解压后）

**注意**: 便携版已内置 Node.js 运行时，无需额外安装。

## 📁 项目结构

```
deepseek-harness-portable/
├── 一键启动.bat           # Windows 启动脚本
├── 一键启动.sh            # Linux/macOS 启动脚本
├── README.md              # 使用说明
├── harness/               # 主程序目录
│   ├── package.json       # 项目配置
│   ├── pnpm-lock.yaml     # 依赖锁定
│   ├── apps/              # 应用程序
│   │   ├── cli/           # CLI 工具
│   │   └── web/           # Web 界面
│   ├── packages/          # 核心包
│   │   ├── llm/           # LLM 适配器
│   │   └── attachment/    # 附件处理
│   ├── vendor/            # 第三方依赖
│   └── node_modules/      # npm 依赖
└── runtime/               # 内置运行时（可选）
    └── node-win-x64/      # Node.js 22.x Windows 64位
```

## 🔄 自动构建

本项目使用 GitHub Actions 自动构建便携版。

### 触发方式

1. **手动触发**: 
   - 进入 [Actions](https://github.com/849276022/deepseek-harness-portable/actions) 页面
   - 选择 "Build DeepSeek Harness Portable"
   - 点击 "Run workflow"
   - 填写版本号（如 `v0.1.1-rc.2`）
   - 选择是否包含视觉模型支持

2. **自动触发**: 
   - 推送 tag（如 `v0.1.1-rc.2`）时自动构建

### 构建产物

- **完整版**: 包含 node_modules，解压即用（约 420MB）
- **精简版**: 不含 node_modules，需要 `pnpm install`（约 40MB）

构建完成后，产物会自动上传到 [Releases](https://github.com/849276022/deepseek-harness-portable/releases) 页面。

## 🔧 手动构建流程

如果需要从源码构建：

### 1. 环境准备

```bash
# 安装 Node.js 22+
node --version  # 需要 v22.x.x

# 安装 pnpm 11+
pnpm --version  # 需要 v11.x.x
```

### 2. 克隆并安装依赖

```bash
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
export CI=true
pnpm install
```

### 3. 构建项目

```bash
pnpm build
```

### 4. 清理优化

```bash
# 删除开发依赖和缓存
rm -rf node_modules/.cache
find . -type d -name "__tests__" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "test" -exec rm -rf {} + 2>/dev/null || true

# 删除 TypeScript 源文件（保留编译后的 JS）
find apps packages vendor -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.d.ts" -delete 2>/dev/null || true
```

### 5. 打包

```bash
# 完整版（含 node_modules）
tar -czf DeepSeekHarness-Portable-Full.tar.gz .

# 精简版（不含 node_modules）
mkdir -p ../deepseek-harness-lite
rsync -a --exclude='node_modules' ./ ../deepseek-harness-lite/
tar -czf DeepSeekHarness-Portable-Lite.tar.gz -C .. deepseek-harness-lite
```

## ✨ 特性

- ✅ **解压即用**: 内置所有依赖，无需安装
- ✅ **跨平台**: 支持 Windows、Linux、macOS
- ✅ **视觉模型支持**: 支持 DeepSeek-V4-Flash-Vision-Exp
- ✅ **本地运行**: 数据不上传云端，隐私安全
- ✅ **自动更新**: 通过 GitHub Actions 自动构建最新版本

## ⚠️ 注意事项

- **API Key 安全**: API Key 存储在 `~/.dsh/settings.yaml`，不要提交到仓库
- **端口占用**: 默认使用 3000 端口，如被占用可在启动脚本中修改
- **Windows 长路径**: 使用 tar 打包避免 260 字符路径限制

## 📝 版本信息

- **DeepSeek Harness 版本**: v0.1.1-rc.2
- **Node.js 版本**: 22.x
- **pnpm 版本**: 11.x
- **视觉模型支持**: DeepSeek-V4-Flash-Vision-Exp

## 🤝 参考项目

- [DeepSeek Harness 官方仓库](https://github.com/deepseek-ai/deepseek-harness)
- [wess09/DeepSeekHarnessDesktop](https://github.com/wess09/DeepSeekHarnessDesktop) - Electron 桌面版打包方案

## 📄 许可证

遵循 DeepSeek Harness 官方许可证

---

**构建时间**: 自动构建  
**最后更新**: 2026-08-26
