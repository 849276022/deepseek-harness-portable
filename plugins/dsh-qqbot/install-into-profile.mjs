/**
 * install-into-profile.mjs — 把 dsh-qqbot 装进指定 profile，完全绕开 pnpm。
 *
 * 为什么不用 `dsh plugin add`：
 * 它内部把插件路径转成绝对路径后交给 pnpm，而 pnpm 会在空格/括号处劈开参数。
 * 解压到 "E:\deep seek\Portable (4)" 这类路径时会失败：
 *   ERR_PNPM_SPEC_NOT_SUPPORTED_BY_ANY_RESOLVER  "(4)/portable/..." isn't supported
 * 并往 profile 里塞进 deep / DeepSeekHarness-Portable 之类垃圾依赖。
 *
 * 为什么这样做就够：
 * profile 不需要自己的 node_modules —— dsh 从 src/node_modules 解析 bundle。
 * 实测可用的 profile 里 dependencies 是空的、node_modules/@deepseek-ai 一个包都没有，
 * 却能正常启动。所以只要：
 *   1) 在 profile 的 dsh.profile.bundles 里声明包名
 *   2) 建一个目录链接让 Node 能 import 到插件代码
 * 两步都是纯文件操作，不含任何路径参数解析，天然对空格免疫。
 *
 * 用法：node install-into-profile.mjs <profileDir> <pluginDir>
 */

import fs from 'node:fs'
import path from 'node:path'

const [profileDir, pluginDir] = process.argv.slice(2)

if (!profileDir || !pluginDir) {
  console.error('usage: node install-into-profile.mjs <profileDir> <pluginDir>')
  process.exit(2)
}

if (!fs.existsSync(path.join(pluginDir, 'package.json'))) {
  console.error(`[qqbot] plugin not found at ${pluginDir}`)
  process.exit(2)
}

const pkgName = JSON.parse(
  fs.readFileSync(path.join(pluginDir, 'package.json'), 'utf8'),
).name

// 1. 确保 profile 目录与 package.json 存在，并声明 bundle 名。
fs.mkdirSync(profileDir, { recursive: true })

const manifestPath = path.join(profileDir, 'package.json')
const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : {
      name: `dsh-profile-${path.basename(profileDir)}`,
      private: true,
      dependencies: {},
    }

manifest.dsh ??= {}
manifest.dsh.profile ??= {}
manifest.dsh.profile.bundles ??= ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app']
manifest.dsh.profile.patchReload ??= 'live'

if (!manifest.dsh.profile.bundles.includes(pkgName)) {
  manifest.dsh.profile.bundles.push(pkgName)
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

// 2. 让 Node 能从 profile 解析到插件代码。
//    优先建目录链接（junction 在 Windows 上无需管理员权限）；
//    链接不可用时退回复制，功能等价，只是更新插件后需重装。
const linkPath = path.join(profileDir, 'node_modules', pkgName)
fs.mkdirSync(path.dirname(linkPath), { recursive: true })
fs.rmSync(linkPath, { recursive: true, force: true })

let how = 'junction'
try {
  fs.symlinkSync(path.resolve(pluginDir), linkPath, 'junction')
} catch {
  how = 'copy'
  fs.cpSync(path.resolve(pluginDir), linkPath, { recursive: true })
}

console.log(`[qqbot] installed ${pkgName} into ${path.basename(profileDir)} (${how})`)
console.log(`[qqbot] bundles = ${manifest.dsh.profile.bundles.join(', ')}`)
