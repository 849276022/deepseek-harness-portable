# dsh-qqbot

DeepSeek Harness 的 QQ 机器人插件，以 **组合包（bundle）** 形式分发。

## 当前状态：配置层（v0.2.0）

这一版**只提供配置界面**，不建立 QQ 连接。目的是先把
「预装 → 打包 → 解压 → 设置页可见 → 填写可持久化」这条链路验证通，
消息收发在下一版实现。

## 为什么用 bundle 而不是改上游源码

Harness 的插件机制（`package.json` 里的 `dsh.bundle` + `cordis.patch.yml`）
允许插件以独立包的形式安装，**不需要改动上游源码树**。
好处是上游 `deepseek-ai/deepseek-harness` 无论怎么迭代，都不会和本插件冲突。

## 为什么是 JavaScript 而不是 TypeScript

从 git 安装插件时，pnpm **不会**运行 `build` 脚本，TypeScript 包到手没有
`lib/` 产物会直接加载失败。纯 JS 无需编译，规避了这个问题，
也省去让用户在 `pnpm-workspace.yaml` 里配 `allowBuilds` 授权的麻烦。

## 配置项

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `enabled` | boolean | `false` | 启用开关。默认关闭，不阻挡首次使用 |
| `appId` | string | `''` | QQ 开放平台应用编号 |
| `token` | string | `''` | 机器人令牌 |
| `appSecret` | string(secret) | `''` | 机器人密钥，设置页渲染为密码框 |
| `sandbox` | boolean | `true` | 沙箱环境开关 |
| `atOnly` | boolean | `true` | 仅响应 @ 消息，避免群内刷屏 |

配置界面由 schema 自动生成 —— harness 用 schema 渲染设置页，无需手写前端。

## 凭据安全

- 仓库内**不含任何凭据**，所有字段默认空值，由用户在设置页填写。
- `appSecret` 标记 `role('secret')`，界面上以密码框呈现。
- 插件日志只输出「已填写／未填写」状态，**绝不打印凭据内容**。
- CI 构建时有守卫步骤，检测到硬编码凭据会直接让构建失败。

## 手动安装

便携版首次启动会自动安装。手动安装：

```sh
dsh plugin --profile default add ./plugins/dsh-qqbot
dsh --profile default --dump-config   # 应能看到 dsh-qqbot 层
```

卸载：

```sh
dsh plugin --profile default remove dsh-qqbot
```

## 本地验证

```sh
npm install @deepseek-ai/cordis @deepseek-ai/schemastery --no-save
node tests/verify-schema.mjs   # 配置 schema
node tests/verify-load.mjs     # 真实 cordis 挂载
```

## 已知事项

- `ctx.plugin()` 返回 thenable，`apply` **异步执行**；写测试时必须 `await`，
  否则断言会在 apply 跑之前就执行。
- schemastery 序列化结构是 `{ uid, refs }` 引用表，字段在 `refs[uid].dict`，
  元数据在各 ref 的 `.meta` 上 —— 读取 schema 元信息时别猜结构。
