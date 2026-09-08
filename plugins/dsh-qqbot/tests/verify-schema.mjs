// 实测 dsh-qqbot 的 Config schema
// 注意：schemastery 序列化为 { uid, refs } 引用表，根对象在 refs[uid]，
// 字段名到 ref id 的映射在其 .dict 上，元数据在各 ref 的 .meta 上。
import { Config } from '../index.js'

let fail = 0
const ok = (c, m) => { console.log((c ? '  PASS ' : '  FAIL ') + m); if (!c) fail++ }

console.log('=== 1. 空配置解析出默认值 ===')
const d = Config({})
console.log('  ', JSON.stringify(d))
ok(d.enabled === false, 'enabled 默认 false（不挡首次使用）')
ok(d.appId === '' && d.token === '' && d.appSecret === '', '三项凭据默认空（仓库无密钥）')
ok(d.sandbox === true, 'sandbox 默认 true')
ok(d.atOnly === true, 'atOnly 默认 true')

console.log('=== 2. 用户填值能被接受 ===')
const u = Config({ enabled: true, appId: '102xxxx', token: 'tk', appSecret: 'sk', sandbox: false })
ok(u.appId === '102xxxx', 'appId 写入生效')
ok(u.sandbox === false, 'sandbox 可关闭')
ok(u.atOnly === true, '未填字段回落默认值')

console.log('=== 3. UI 渲染依据（schema 元数据）===')
const j = JSON.parse(JSON.stringify(Config))
const root = j.refs[String(j.uid)]
const dict = root.dict
const keys = Object.keys(dict)
console.log('   字段:', keys.join(', '))
ok(keys.length === 6, '共 6 个字段暴露给设置页')

const metaOf = k => (j.refs[String(dict[k])] || {}).meta || {}
const typeOf = k => (j.refs[String(dict[k])] || {}).type

ok(metaOf('appSecret').role === 'secret', 'appSecret 标记 secret（设置页渲染密码框）')
ok(keys.every(k => metaOf(k).description), '每个字段都有中文说明')
ok(typeOf('enabled') === 'boolean' && typeOf('appId') === 'string', '类型正确（开关/文本框）')

console.log('   各字段类型:')
for (const k of keys) console.log(`     ${k.padEnd(10)} ${typeOf(k).padEnd(8)} ${metaOf(k).role ? '[' + metaOf(k).role + ']' : ''}`)

console.log('=== 4. 类型校验生效 ===')
let threw = false
try { Config({ appId: 12345 }) } catch (e) { threw = true }
ok(threw, '数字填进 string 字段被拒绝')

console.log(fail === 0 ? '\n全部通过 ✅' : `\n${fail} 项失败 ❌`)
process.exit(fail === 0 ? 0 : 1)
