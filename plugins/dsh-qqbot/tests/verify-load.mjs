// 真机验证：用真实 cordis Context 加载 dsh-qqbot 插件
// 关键：ctx.plugin() 返回 thenable，apply 异步执行，必须 await 后再断言。
import { Context } from '@deepseek-ai/cordis'
import * as qqbot from '../index.js'

let fail = 0
const ok = (c, m) => { console.log((c ? '  PASS ' : '  FAIL ') + m); if (!c) fail++ }

let logs = []

function makeCtx() {
  const ctx = new Context()
  ctx.logger = (ns) => {
    const rec = (level) => (...args) => {
      const [fmt, ...rest] = args
      let i = 0
      const msg = String(fmt).replace(/%s/g, () => String(rest[i++]))
      logs.push({ level, ns, msg })
    }
    return { info: rec('info'), warn: rec('warn'), error: rec('error') }
  }
  return ctx
}

async function mount(config) {
  logs = []
  const ctx = makeCtx()
  await ctx.plugin(qqbot, config)
  return logs
}

console.log('=== 1. 插件导出符合 cordis 约定 ===')
ok(qqbot.name === 'qqbot', 'name 导出正确')
ok(typeof qqbot.apply === 'function', 'apply 是函数')
ok(typeof qqbot.Config === 'function', 'Config 是 schema（可调用）')

console.log('=== 2. 真实挂载（默认配置） ===')
let err = null
let L = []
try { L = await mount({}) } catch (e) { err = e }
ok(!err, '默认配置挂载无异常' + (err ? ' -> ' + err.message : ''))
const info = L.find(l => l.level === 'info')
ok(!!info, '插件输出了加载日志')
if (info) console.log('   日志:', info.msg)
ok(!L.some(l => l.level === 'warn'), '默认未启用时不告警')

console.log('=== 3. 启用但凭据不全时告警 ===')
L = await mount({ enabled: true })
const warn = L.find(l => l.level === 'warn')
ok(!!warn, '发出未填凭据告警')
if (warn) console.log('   告警:', warn.msg)

console.log('=== 4. 凭据齐全 + 正式环境 ===')
L = await mount({ enabled: true, appId: '102000001', token: 'tk-abc', appSecret: 'sk-xyz', sandbox: false })
ok(!L.find(l => l.level === 'warn'), '凭据齐全时无告警')
const info4 = L.find(l => l.level === 'info')
if (info4) console.log('   日志:', info4.msg)
ok(info4 && info4.msg.includes('正式'), '正确识别正式环境')
ok(info4 && info4.msg.includes('已填写'), '正确识别凭据完备')

console.log('=== 5. 安全：日志不含凭据明文 ===')
const all = L.map(l => l.msg).join('\n')
ok(!all.includes('sk-xyz'), 'AppSecret 未出现在日志')
ok(!all.includes('tk-abc'), 'Token 未出现在日志')
ok(!all.includes('102000001'), 'AppID 未出现在日志')

console.log(fail === 0 ? '\n真机加载全部通过 ✅' : `\n${fail} 项失败 ❌`)
process.exit(fail === 0 ? 0 : 1)
