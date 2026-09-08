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
 */

import Schema from '@deepseek-ai/schemastery'

/** Cordis 函数插件名。 */
export const name = 'qqbot'

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

/**
 * 挂载插件。
 *
 * 第一步刻意不建立任何连接：目的是验证「预装 → 打包 → 解压 → 设置页可见 →
 * 填写可持久化」这条链路是否通畅。日志同时输出凭据完备性，便于用户自查，
 * 但绝不打印凭据内容本身。
 */
export function apply(ctx, config) {
  const ready = Boolean(config.appId && config.token && config.appSecret)
  const env = config.sandbox ? '沙箱' : '正式'

  ctx.logger('qqbot').info(
    '[qqbot] 配置插件已加载 — 启用=%s 环境=%s 凭据=%s 仅响应@=%s',
    config.enabled ? '是' : '否',
    env,
    ready ? '已填写' : '未填写',
    config.atOnly ? '是' : '否',
  )

  if (config.enabled && !ready) {
    ctx.logger('qqbot').warn(
      '[qqbot] 已启用但凭据不完整，请在设置页填写 AppID / Token / AppSecret。',
    )
  }
}
