# DeepSeek Harness 便携版

解压即用的本地 AI 助手，基于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 官方版本打包。

## 📦 下载

从 [Releases](https://github.com/849276022/deepseek-harness-portable/releases) 页面下载最新版本。

## 🚀 使用方法

1. 解压 `dsh-portable.7z` 到任意目录
2. 双击 `start.bat`
3. 浏览器访问 `http://localhost:3080`
4. 在设置中配置 DeepSeek API Key

## 📁 项目结构

```
deepseek-harness/
├── node.exe              # Node.js 22.19.0 运行时
├── start.bat             # 启动脚本
├── apps/                 # 应用代码
│   ├── cli/              # CLI 入口
│   │   └── lib/          # 构建产物
│   └── web/              # Web 前端
│       └── dist/         # 构建产物
├── packages/             # 核心模块
│   ├── core/             # Agent 核心
│   ├── llm/              # LLM 适配器
│   ├── session/          # 会话管理
│   └── ...               # 其他模块
├── node_modules/         # 依赖（hoisted 扁平结构）
├── vendor/               # 第三方插件
└── .npmrc                # pnpm 配置（hoisted 模式）
```

## 🔧 更新流程

### 1. 拉取官方更新

```bash
cd deepseek-harness
git pull origin main
```

### 2. 重新安装依赖

```bash
pnpm install
```

### 3. 重新构建

```bash
pnpm build
```

### 4. 重新打包

```bash
cd ..
7z a -t7z -mx=9 dsh-portable.7z ./deepseek-harness/* -xr!build -xr!.git
```

### 5. 发布新版本

1. 在 GitHub Releases 页面点击 "Draft a new release"
2. 上传新的 `dsh-portable.7z`
3. 填写版本号和更新说明
4. 点击 "Publish release"

## ⚠️ 注意事项

- **Windows 长路径问题**：打包时排除 `build` 和 `.git` 目录，避免路径超过 260 字符限制
- **hoisted 模式**：使用 `node-linker=hoisted` 让 node_modules 扁平化，减少嵌套层级
- **API Key 安全**：API Key 存储在 `~/.dsh/settings.yaml`，不要提交到仓库

## 📝 版本信息

- **Node.js 版本**：22.19.0
- **pnpm 版本**：11.7.0
- **DeepSeek Harness 版本**：基于官方 main 分支

## 🤝 参考项目

- [wess09/DeepSeekHarnessDesktop](https://github.com/wess09/DeepSeekHarnessDesktop) - Electron 桌面版打包方案

## 📄 许可证

遵循 DeepSeek Harness 官方许可证
