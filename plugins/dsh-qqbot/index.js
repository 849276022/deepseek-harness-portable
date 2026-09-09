/**
 * dsh-qqbot — QQ 机器人配置插件（第一步：配置直通验证）
 *
 * 本版本只做一件事：向 DSH 注册一组 QQ Bot 配置项，
 * 让它们出现在 Web 设置页面上、可填写、可持久化、可被读回。
 * 消息收发（WebSocket 长连接）留到管道验证通过后再实现。
 *
 * 设计约束：
 * - 纯 JavaScript：git 安装不会运行 build 脚本，用 TS 会因缺少 lib/ 而加载失败。
 * - 无硬编码可调参数：凡是不同部署可能取不同值的，一律走 Config。
 * - 不落密钥：appSecret 由用户在运行时填写，仓库内不存在任何默认凭据。
 *
 * 【关键一】只 export Config 不会让配置出现在设置页面。
 * Config 走的是 cordis.yml 的加载期配置；设置页面读的是 settings 服务的
 * namespace 注册表。必须把 namespace 注册进去，设置页才会渲染出这一节。
 * 两者是不同的东西，缺一个就"插件加载了但页面空白"。
 *
 * 【关键二】注册要走 ctx.inject(['settings']) 拿服务，不要 import 具体函数。
 * 上游曾从 dsh-settings 导出 installSettingsSection，新版已移除该导出，
 * 硬 import 会让插件在启动时直接 SyntaxError 崩溃。
 * 官方现行写法（见 packages/core/agent-default-model）是通过服务调用
 * settingsCtx.settings.installSection(...)，这对新旧版本都安全：
 * settings 服务不存在时 inject 回调不执行，插件照常工作。
 */

import Schema from '@deepseek-ai/schemastery'

/** Cordis 函数插件名。 */
export const name = 'qqbot'

/** 设置页面上这一节的命名空间。 */
export const QQBOT_SETTINGS_NAMESPACE = 'qqbot'

/**
 * QQ 开放平台机器人配置。
 * 字段命名对齐 QQ 官方开放平台术语，避免用户在两边对照时产生歧义。
 */
export const Config = Schema.object({
  enabled: Schema.boolean()
    .default(false)
    .description('启用 QQ 机器人。未填写完整凭据前请保持关闭。'),

  appId: Schema.string()
    .default('')
    .description('AppID —— QQ 开放平台「机器人管理」页的应用编号。'),

  token: Schema.string()
    .default('')
    .description('Token —— 机器人令牌，用于校验回调来源。'),

  appSecret: Schema.string()
    .role('secret')
    .default('')
    .description('AppSecret —— 机器人密钥，请勿分享或提交到代码仓库。'),

  sandbox: Schema.boolean()
    .default(true)
    .description('沙箱环境。调试期保持开启，正式上线后关闭。'),

  atOnly: Schema.boolean()
    .default(true)
    .description('仅响应 @ 机器人的消息，避免在群里刷屏。'),
})

/** 把当前配置写进日志，绝不打印凭据内容本身。 */
function report(logger, config) {
  const ready = Boolean(config.appId && config.token && config.appSecret)

  logger.info(
    '[qqbot] 配置插件已加载 — 启用=%s 环境=%s 凭据=%s 仅响应@=%s',
    config.enabled ? '是' : '否',
    config.sandbox ? '沙箱' : '正式',
    ready ? '已填写' : '未填写',
    config.atOnly ? '是' : '否',
  )

  if (config.enabled && !ready) {
    logger.warn('[qqbot] 已启用但凭据不完整，请在设置页填写 AppID / Token / AppSecret。')
  }
}

/**
 * 挂载插件。
 *
 * 第一步刻意不建立任何连接：目的是验证「预装 → 打包 → 解压 → 设置页可见 →
 * 填写可持久化」这条链路是否通畅。
 *
 * 注册语义：把 cordis 入口配置作为 base 层交给 settings 服务，
 * 用户在页面上的修改作为覆盖层；服务缺失时回落到入口配置。
 */
export function apply(ctx, config) {
  const logger = ctx.logger('qqbot')

  // 读取当前生效值（用户覆盖优先），settings 服务不在时回落到入口 config。
  let current = () => config

  // 只有 settings 服务真正就绪时才注册，服务不存在时静默跳过。
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.installSection(ctx, QQBOT_SETTINGS_NAMESPACE, Config, config, {
      setSource: (next) => {
        current = next
      },
      onChange: () => {
        report(logger, current())
      },
    })
  })

  report(logger, current())
}
